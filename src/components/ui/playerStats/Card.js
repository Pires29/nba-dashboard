const Card = ({
  children,
  className = "",
  accent = "orange",
  overflow = "hidden",
  style,
  elementRef,
}) => {
  const accentMap = {
    orange: "from-orange-500",
    blue: "from-blue-500",
    emerald: "from-emerald-500",
    violet: "from-violet-500",
  };
  return (
    <div
      ref={elementRef}
      className={`relative rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#162035] to-[#0F1828] shadow-[0_12px_36px_rgba(0,0,0,0.22)] overflow-${overflow} ${className}`}
      style={style}
    >
      <div
        className={`absolute left-4 right-4 top-0 h-px bg-gradient-to-r ${accentMap[accent]} via-current/30 to-transparent opacity-80`}
      />
      {children}
    </div>
  );
};

export default Card;
