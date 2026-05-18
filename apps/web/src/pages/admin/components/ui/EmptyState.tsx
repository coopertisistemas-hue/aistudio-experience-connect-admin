interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon = 'ri-inbox-line', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-sand-100 border border-sand-200 mb-5">
        <i className={`${icon} text-navy-300 text-2xl`}></i>
      </div>
      <h3 className="font-serif text-lg font-semibold text-navy-700 mb-2">{title}</h3>
      {description && (
        <p className="text-navy-400 text-sm font-light max-w-sm leading-relaxed">{description}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-navy-950 hover:bg-navy-900 text-white text-sm font-medium rounded-xl transition-colors duration-150 cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line text-sm"></i>
          {action.label}
        </button>
      )}
    </div>
  );
}