import Image from "next/image";

const QA_PLAYER_ID_MIN = 900001;
const QA_PLAYER_ID_MAX = 900318;

const isQaPlayerId = (playerId) => {
  const id = Number(playerId);
  return Number.isInteger(id) && id >= QA_PLAYER_ID_MIN && id <= QA_PLAYER_ID_MAX;
};

function Placeholder({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 80"
      className={`h-full w-full text-slate-500 ${className}`}
    >
      <rect width="80" height="80" fill="#0D1828" />
      <circle cx="40" cy="32" r="15" fill="currentColor" opacity="0.55" />
      <path d="M13 80c2-18 11-29 27-29s25 11 27 29H13Z" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

export default function PropsPlayerHeadshot({ playerId, alt = "", ...imageProps }) {
  if (isQaPlayerId(playerId)) {
    return <Placeholder className={imageProps.className} />;
  }

  return (
    <Image
      {...imageProps}
      src={`https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerId}.png`}
      alt={alt}
    />
  );
}
