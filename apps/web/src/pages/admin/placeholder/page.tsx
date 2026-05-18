interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  icon: string;
}

export default function PlaceholderPage({ title, subtitle, icon }: PlaceholderPageProps) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="max-w-sm text-center">
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-navy-50 border border-navy-100 mx-auto mb-5">
          <i className={`${icon} text-navy-400 text-2xl`}></i>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span className="text-amber-700 text-[11px] font-medium">Em desenvolvimento</span>
        </div>
        <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-2">{title}</h2>
        <p className="text-navy-400 text-sm font-light leading-relaxed">{subtitle}</p>
        <div className="mt-6 bg-sand-50 border border-sand-200 rounded-2xl p-4">
          <p className="text-navy-400 text-xs font-light leading-relaxed">
            Este módulo faz parte do roadmap do Experience Connect e será disponibilizado em breve como parte do ecossistema operacional.
          </p>
        </div>
      </div>
    </div>
  );
}