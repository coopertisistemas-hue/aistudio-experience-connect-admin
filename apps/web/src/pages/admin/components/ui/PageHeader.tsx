interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ icon, title, subtitle, badge, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-navy-950 flex-shrink-0">
          <i className={`${icon} text-amber-400 text-base`}></i>
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-semibold text-navy-950">{title}</h1>
            {badge && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-[11px] font-medium">
                <span className="w-1 h-1 rounded-full bg-teal-500"></span>
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-navy-400 text-sm font-light mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}