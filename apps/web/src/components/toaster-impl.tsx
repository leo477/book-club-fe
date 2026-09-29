'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { attachToastSink } from '@/lib/toast';

/** Loaded on the first toast only. Parent effects run after the Toaster's own subscription, so drained messages are not lost. */
export default function ToasterImpl({ theme }: { theme: 'light' | 'dark' | 'system' }) {
  useEffect(() => attachToastSink((kind, message) => void toast[kind](message)), []);
  return <Toaster theme={theme} />;
}
