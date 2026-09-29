export function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div data-testid="empty-state" className="flex flex-col items-center justify-center py-16 px-4 text-center glass-card-subtle">
      <div className="text-5xl mb-4" aria-hidden="true">{icon}</div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">{description}</p>
    </div>
  );
}
