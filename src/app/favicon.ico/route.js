const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="14" fill="#f97316"/>
  <path d="M17 50V13h20.8c7.9 0 13.4 4.9 13.4 11.9 0 7.1-5.5 12-13.4 12H29.4V50H17Zm12.4-22.4h7.3c2.4 0 3.9-1.1 3.9-2.8 0-1.8-1.5-2.9-3.9-2.9h-7.3v5.7Z" fill="#f8fafc"/>
  <path d="m30.7 37.9 5.8-6.8 5 3.7 7.2-8.2" stroke="#111827" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="48.7" cy="26.6" r="2.6" fill="#111827"/>
</svg>`;

export function GET() {
  return new Response(favicon, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
