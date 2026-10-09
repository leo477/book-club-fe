import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { messages, renderWithProviders, setupApiServer } from '@/test/harness';
import { CoverUpload, MAX_COVER_BYTES } from './cover-upload';

const toast = vi.hoisted(() => vi.fn());
vi.mock('@/lib/toast', () => ({ showToast: toast }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn(), replaceNavigate: vi.fn() }));

setupApiServer();

const t = (key: string) => messages.uk[`COVER_UPLOAD.${key}`] ?? key;

let objectUrls: string[] = [];
let revoked: string[] = [];
beforeEach(() => {
  toast.mockReset();
  objectUrls = [];
  revoked = [];
  URL.createObjectURL = vi.fn(() => {
    const url = `blob:test/${objectUrls.length}`;
    objectUrls.push(url);
    return url;
  });
  URL.revokeObjectURL = vi.fn((url: string) => {
    revoked.push(url);
  });
});
afterEach(() => vi.restoreAllMocks());

function Harness({ initial = '', onChange }: { initial?: string; onChange?: (v: string) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <CoverUpload
        label="Обкладинка"
        value={value}
        onChange={(v) => {
          setValue(v);
          onChange?.(v);
        }}
      />
      <output data-testid="value">{value}</output>
    </>
  );
}

const file = (name = 'cover.png', type = 'image/png', size = 1024) => new File([new Uint8Array(size)], name, { type });
const fileInput = () => screen.getByTestId('cover-file-input') as HTMLInputElement;

interface Upload {
  url: string;
  form: FormData;
}

/**
 * jsdom's FormData is not Node's, so undici (and MSW behind it) cannot serialize it; the request is therefore
 * answered at the fetch boundary, where the FormData the component built can be inspected as is.
 */
function mockUpload(respond: (n: number) => Response | Promise<Response> = () => Response.json({ url: 'https://x.supabase.co/covers/a.png' })) {
  const uploads: Upload[] = [];
  vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (!url.endsWith('/api/v1/upload/cover')) throw new Error(`unexpected request ${url}`);
    if (!(init?.body instanceof FormData)) throw new Error('upload body is not FormData');
    uploads.push({ url, form: init.body });
    return respond(uploads.length);
  });
  return uploads;
}

describe('CoverUpload', () => {
  it('offers JPEG, PNG and WebP', () => {
    renderWithProviders(<Harness />);
    expect(fileInput()).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
  });

  it('posts the file as multipart form data under "file", fills the field with the returned URL and shows the preview', async () => {
    const uploads = mockUpload();
    const user = userEvent.setup();
    renderWithProviders(<Harness />);
    await user.upload(fileInput(), file());
    await waitFor(() => expect(screen.getByTestId('value')).toHaveTextContent('https://x.supabase.co/covers/a.png'));
    expect(uploads).toHaveLength(1);
    expect([...(uploads[0]?.form.keys() ?? [])]).toEqual(['file']);
    const sent = uploads[0]?.form.get('file');
    expect(sent).toBeInstanceOf(File);
    expect((sent as File).name).toBe('cover.png');
    expect(document.querySelector('img')).toHaveAttribute('src', objectUrls[0]);
    expect(screen.getByRole('button', { name: t('upload_image') })).toBeEnabled();
  });

  it('disables the button and shows the uploading label while the request is in flight', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    mockUpload(async () => {
      await gate;
      return Response.json({ url: 'https://x.supabase.co/a.png' });
    });
    const user = userEvent.setup();
    renderWithProviders(<Harness />);
    await user.upload(fileInput(), file());
    const busy = await screen.findByRole('button', { name: new RegExp(t('uploading')) });
    expect(busy).toBeDisabled();
    expect(document.querySelector('img')).toHaveAttribute('src', objectUrls[0]);
    await act(async () => release());
    await waitFor(() => expect(screen.getByRole('button', { name: t('upload_image') })).toBeEnabled());
  });

  it.each([
    ['a GIF', file('a.gif', 'image/gif')],
    ['a PDF', file('a.pdf', 'application/pdf')],
    ['a file over 5 MB', file('big.png', 'image/png', MAX_COVER_BYTES + 1)],
  ])('refuses %s without sending anything', async (_label, bad) => {
    const uploads = mockUpload();
    renderWithProviders(<Harness />);
    fireEvent.change(fileInput(), { target: { files: [bad] } });
    expect(await screen.findByRole('alert')).toHaveTextContent(t('upload_failed'));
    expect(uploads).toHaveLength(0);
    expect(document.querySelector('img')).toBeNull();
  });

  it('accepts exactly 5 MB', async () => {
    const uploads = mockUpload();
    const user = userEvent.setup();
    renderWithProviders(<Harness />);
    await user.upload(fileInput(), file('edge.webp', 'image/webp', MAX_COVER_BYTES));
    await waitFor(() => expect(uploads).toHaveLength(1));
  });

  it('shows the failure, drops the preview and keeps the old value when the backend refuses', async () => {
    mockUpload(() => Response.json({ detail: 'File too large' }, { status: 413 }));
    const user = userEvent.setup();
    renderWithProviders(<Harness initial="https://old.example/c.png" />);
    await user.upload(fileInput(), file());
    expect(await screen.findByText(t('upload_failed'))).toBeInTheDocument();
    expect(screen.getByTestId('value')).toHaveTextContent('https://old.example/c.png');
    expect(document.querySelector('img')).toHaveAttribute('src', 'https://old.example/c.png');
    expect(revoked).toContain(objectUrls[0]);
  });

  it('toggles the URL input, edits the field with it and previews an https URL', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);
    expect(screen.queryByTestId('cover-url-input')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: t('enter_url') }));
    await user.type(screen.getByTestId('cover-url-input'), 'https://example.com/c.jpg');
    expect(screen.getByTestId('value')).toHaveTextContent('https://example.com/c.jpg');
    expect(document.querySelector('img')).toHaveAttribute('src', 'https://example.com/c.jpg');
    await user.click(screen.getByRole('button', { name: t('hide_url') }));
    expect(screen.queryByTestId('cover-url-input')).not.toBeInTheDocument();
  });

  it('never previews a non-http(s) value', () => {
    renderWithProviders(<Harness initial="javascript:alert(1)" />);
    expect(document.querySelector('img')).toBeNull();
  });

  it('hides a preview that fails to load but keeps the stored value', () => {
    renderWithProviders(<Harness initial="https://gone.example/c.png" />);
    fireEvent.error(document.querySelector('img') as HTMLImageElement);
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByTestId('value')).toHaveTextContent('https://gone.example/c.png');
  });

  it('clears the value and the local preview with the remove button', async () => {
    mockUpload();
    const user = userEvent.setup();
    renderWithProviders(<Harness />);
    await user.upload(fileInput(), file());
    await waitFor(() => expect(screen.getByTestId('value')).not.toBeEmptyDOMElement());
    await user.click(screen.getByRole('button', { name: t('remove') }));
    expect(screen.getByTestId('value')).toBeEmptyDOMElement();
    expect(document.querySelector('img')).toBeNull();
    expect(revoked).toContain(objectUrls[0]);
  });

  it('revokes its object URL when unmounted', async () => {
    mockUpload();
    const user = userEvent.setup();
    const { unmount } = renderWithProviders(<Harness />);
    await user.upload(fileInput(), file());
    await waitFor(() => expect(screen.getByTestId('value')).not.toBeEmptyDOMElement());
    unmount();
    expect(revoked).toContain(objectUrls[0]);
  });

  it('names the URL input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);
    await user.click(screen.getByRole('button', { name: t('enter_url') }));
    expect(screen.getByLabelText('Обкладинка')).toBe(screen.getByTestId('cover-url-input'));
  });

  it.each(['typing a URL', 'Remove'])('ignores an upload that %s superseded', async (how) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    mockUpload(async () => {
      await gate;
      return Response.json({ url: 'https://x.supabase.co/late.png' });
    });
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<Harness onChange={onChange} />);
    await user.upload(fileInput(), file());
    await screen.findByRole('button', { name: new RegExp(t('uploading')) });
    if (how === 'Remove') {
      await user.click(screen.getByRole('button', { name: t('remove') }));
    } else {
      await user.click(screen.getByRole('button', { name: t('enter_url') }));
      await user.type(screen.getByTestId('cover-url-input'), 'https://typed.example/c.png');
    }
    onChange.mockClear();
    await act(async () => release());
    await new Promise((r) => setTimeout(r, 30));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId('value')).toHaveTextContent(how === 'Remove' ? '' : 'https://typed.example/c.png');
    expect(screen.getByRole('button', { name: t('upload_image') })).toBeEnabled();
  });
});
