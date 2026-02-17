type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
      </div>
    </div>
  );
}
