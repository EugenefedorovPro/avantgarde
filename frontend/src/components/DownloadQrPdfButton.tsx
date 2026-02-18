// src/components/DownloadQrPdfButton.tsx
import { baseUrl } from "../api/urls";

type Props = {
  href?: string; // "/print/qr.pdf" or "/api/print/qr.pdf"
  label?: string;
};

export function DownloadQrPdfButton({
  href = baseUrl + "/print/pdf/",
  label = "PDF",
}: Props) {
  return (
    <a href={href}>
      <button type="button">{label}</button>
    </a>
  );
}
