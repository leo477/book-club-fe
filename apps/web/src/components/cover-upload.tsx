'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/lib/api';

/** What the picker offers and what the backend would accept (it also allows gif, which the picker never has). */
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_COVER_BYTES = 5 * 1024 * 1024;

interface Props {
  value: string;
  onChange: (url: string) => void;
  invalid?: boolean;
  /** Accessible name of the URL input, which has no visible label of its own. */
  label: string;
  urlInputProps?: { id?: string; 'aria-describedby'?: string };
}

const isWebUrl = (src: string) => /^https?:\/\//i.test(src);

export function CoverUpload({ value, onChange, invalid = false, label, urlInputProps }: Props) {
  const t = useTranslations('COVER_UPLOAD');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);
  const previewRef = useRef<string | null>(null);
  // typing a URL or removing the cover supersedes an upload still in flight; its late answer is ignored
  const uploadSeq = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const setLocalPreview = (next: string | null) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = next;
    setPreview(next);
  };

  const supersede = () => {
    uploadSeq.current += 1;
    setUploading(false);
    setLocalPreview(null);
  };

  const clear = () => {
    supersede();
    onChange('');
  };

  const upload = async (file: File) => {
    setError(null);
    if (!ACCEPT.includes(file.type) || file.size > MAX_COVER_BYTES) {
      setError(t('upload_failed'));
      return;
    }
    const seq = ++uploadSeq.current;
    setLocalPreview(URL.createObjectURL(file));
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const { url } = await api.upload.cover(form);
      if (!mounted.current || seq !== uploadSeq.current) return;
      setUploadedUrl(url);
      setUploading(false);
      onChange(url);
    } catch {
      if (!mounted.current || seq !== uploadSeq.current) return;
      setError(t('upload_failed'));
      setLocalPreview(null);
      setUploading(false);
    }
  };

  // the local preview stands in for the uploaded file only while the field still holds that upload
  const local = preview !== null && (uploading || value === uploadedUrl) ? preview : null;
  const src = local ?? (isWebUrl(value) ? value : '');

  return (
    <div className="space-y-2">
      {src && src !== brokenSrc ? (
        <div className="relative h-28 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
          {/* eslint-disable-next-line @next/next/no-img-element -- cover URLs are arbitrary hosts; no image optimizer is configured */}
          <img src={src} alt="" referrerPolicy="no-referrer" className="size-full object-cover" onError={() => setBrokenSrc(src)} />
          <button
            type="button"
            onClick={clear}
            aria-label={t('remove')}
            className="absolute right-1 top-1 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white transition-colors hover:bg-black/70"
          >
            ✕
          </button>
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button type="button" variant="outline" disabled={uploading} onClick={() => fileInput.current?.click()} data-testid="cover-upload-button">
          {uploading ? (
            <>
              <Spinner /> {t('uploading')}
            </>
          ) : (
            t('upload_image')
          )}
        </Button>
        <Button type="button" variant="outline" aria-expanded={showUrl} onClick={() => setShowUrl((v) => !v)}>
          {showUrl ? t('hide_url') : t('enter_url')}
        </Button>
      </div>
      {showUrl ? (
        <Input
          type="url"
          value={value}
          onChange={(e) => {
            supersede();
            onChange(e.target.value);
          }}
          placeholder="https://example.com/cover.jpg"
          aria-label={label}
          aria-invalid={invalid || undefined}
          data-testid="cover-url-input"
          {...urlInputProps}
        />
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
      <input
        ref={fileInput}
        type="file"
        accept={ACCEPT.join(',')}
        className="hidden"
        data-testid="cover-file-input"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void upload(file);
        }}
      />
    </div>
  );
}
