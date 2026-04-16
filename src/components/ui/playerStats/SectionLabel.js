const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-1 h-5 rounded-sm bg-orange-500" />
    <span className="font-condensed text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase">
      {children}
    </span>
    <div className="flex-1 h-px bg-white/[0.06]" />
  </div>
);

export default SectionLabel;
