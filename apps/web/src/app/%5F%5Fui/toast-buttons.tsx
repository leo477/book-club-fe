'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function ToastButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast.success('Saved')}>success</Button>
      <Button variant="outline" onClick={() => toast.error('Failed')}>error</Button>
      <Button variant="outline" onClick={() => toast.info('FYI')}>info</Button>
    </div>
  );
}
