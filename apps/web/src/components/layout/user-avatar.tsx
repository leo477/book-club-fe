export const TRIGGER_CLASS =
  'flex items-center gap-2 rounded-full p-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2';

export function initialsOf(name: string): string {
  return (
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '?'
  );
}

export function UserAvatar({ displayName }: { displayName: string }) {
  return (
    <div className="h-9 w-9 rounded-full avatar-gradient flex items-center justify-center text-white text-sm font-semibold select-none" aria-hidden="true">
      {initialsOf(displayName)}
    </div>
  );
}
