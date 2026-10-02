/** Shared QR look for preview + download. */
const QR_OPTS = {
  margin: 2,
  errorCorrectionLevel: "M" as const,
  color: { dark: "#1c1917", light: "#ffffff" },
};

export async function qrDataUrl(url: string, width = 240) {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(url, { ...QR_OPTS, width });
}

/** Download a PNG QR code for the given URL */
export async function downloadQrPng(url: string, fileName: string) {
  const dataUrl = await qrDataUrl(url, 512);

  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}
