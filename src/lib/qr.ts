import QRCode from "qrcode";

/**
 * تولید QR اختصاصی هر کسب‌وکار — سمت سرور (بدون وابستگی به سرویس بیرونی)
 * خروجی به‌صورت data-URL (PNG) برای نمایش و دانلود.
 */
export async function businessQrDataUrl(
  text: string,
  { size = 512, margin = 2 }: { size?: number; margin?: number } = {}
): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin,
    errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}

export async function businessQrSvg(
  text: string,
  { size = 512, margin = 2 }: { size?: number; margin?: number } = {}
): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    width: size,
    margin,
    errorCorrectionLevel: "M",
  });
}
