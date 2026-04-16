const Card = ({
  children,
  className = "",
  accent = "orange",
  overflow = "hidden",
}) => {
  const accentMap = {
    orange: "from-orange-500",
    blue: "from-blue-500",
    emerald: "from-emerald-500",
    violet: "from-violet-500",
  };
  return (
    <div
      className={`relative rounded-xl border border-white/6 bg-gradient-to-b  from-[#162035] to-[#0F1828] shadow-[0_4px_24px_rgba(0,0,0,0.4)] overflow-${overflow} ${className}`}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accentMap[accent]} to-transparent`}
      />
      {children}
    </div>
  );
};

export default Card;
