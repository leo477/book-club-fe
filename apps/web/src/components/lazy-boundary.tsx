'use client';

import { Component, type ReactNode } from 'react';
import { reportJsError } from '@/lib/analytics';

interface Props {
  /** the inert or plain UI the page keeps when the lazy island cannot load */
  fallback: ReactNode;
  children: ReactNode;
}

/** Contains chunk-load (and render) failures of a lazy island so they degrade the island, never the page. */
export class LazyBoundary extends Component<Props, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: Error) {
    reportJsError(error, 'boundary');
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
