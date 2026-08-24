import type { SVGProps } from "react";

/** آیکون‌های برند (در lucide حذف شده‌اند) — به‌صورت SVG درون‌خطی */

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TelegramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M21.94 4.3 18.6 20.06c-.25 1.11-.91 1.38-1.84.86l-5.1-3.76-2.46 2.37c-.27.27-.5.5-1.02.5l.36-5.2 9.47-8.56c.41-.37-.09-.57-.64-.2L5.07 13.04.99 11.76c-.89-.28-.91-.89.19-1.32l16.5-6.36c.74-.27 1.39.18 1.26 1.22Z" />
    </svg>
  );
}

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M.06 24l1.68-6.13A11.86 11.86 0 0 1 .16 11.9C.16 5.34 5.5 0 12.06 0a11.82 11.82 0 0 1 8.4 3.49 11.78 11.78 0 0 1 3.48 8.4c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 0 1-5.69-1.45L.06 24Zm6.6-3.8c1.68.99 3.28 1.58 5.4 1.58 5.45 0 9.89-4.43 9.89-9.88a9.84 9.84 0 0 0-9.88-9.89c-5.46 0-9.9 4.43-9.9 9.89 0 2.22.65 3.88 1.74 5.62l-1 3.64 3.75-.96Zm11.39-5.55c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41Z" />
    </svg>
  );
}
