import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';
import { messages } from '@/test/harness';
import { nest } from '@/i18n/locale';
import { LoadMore } from './load-more';

const t = (key: string) => messages.uk[key] ?? key;

const view = (props: Partial<Parameters<typeof LoadMore>[0]> = {}) => {
  const onLoadMore = vi.fn();
  render(
    <NextIntlClientProvider locale="uk" messages={nest(messages.uk)}>
      <LoadMore hasNextPage isFetching={false} failed={false} onLoadMore={onLoadMore} {...props} />
    </NextIntlClientProvider>,
  );
  return onLoadMore;
};

describe('LoadMore', () => {
  it('renders nothing when there is no next page', () => {
    view({ hasNextPage: false });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('is disabled and busy while a page loads, and announces it', () => {
    view({ isFetching: true });
    expect(screen.getByRole('button', { name: t('PAGINATION.loading') })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(t('PAGINATION.loading'));
    expect(screen.getByRole('button').parentElement).toHaveAttribute('aria-busy', 'true');
  });

  it('shows the failure and lets the user retry', async () => {
    const onLoadMore = view({ failed: true });
    expect(screen.getByRole('alert')).toHaveTextContent(t('PAGINATION.load_failed'));
    await userEvent.click(screen.getByRole('button', { name: t('PAGINATION.load_more') }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
