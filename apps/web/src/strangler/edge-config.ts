import { get } from '@vercel/edge-config';
import { loadConfig, type StranglerConfig } from './config';

export function readStranglerConfig(): Promise<StranglerConfig | null> {
  return loadConfig((key) => get(key));
}
