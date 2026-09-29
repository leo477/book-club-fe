'use client';

import { showToast } from '@/lib/toast';
import { Button } from '@/components/ui/button';

export function ToastButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => showToast('success', 'Saved')}>success</Button>
      <Button variant="outline" onClick={() => showToast('error', 'Failed')}>error</Button>
      <Button variant="outline" onClick={() => showToast('info', 'FYI')}>info</Button>
    </div>
  );
}
