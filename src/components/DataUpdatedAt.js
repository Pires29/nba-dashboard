const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export default function DataUpdatedAt({ updatedAt, className = "" }) {
  if (!updatedAt) return null;

  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return null;

  return (
    <p className={`font-mono text-[10px] leading-5 text-slate-400 sm:text-[11px] ${className}`}>
      Updated <time dateTime={date.toISOString()}>{dateFormatter.format(date)} at {timeFormatter.format(date)} ET</time>
    </p>
  );
}
