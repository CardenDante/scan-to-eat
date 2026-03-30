"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import JSZip from "jszip";
import {
  IOSNavBar,
  IOSSection,
  IOSRow,
  IOSSheet,
  IOSTextField,
  IOSButton,
  IOSBadge,
  IOSEmptyState,
} from "@/components/IOSComponents";

interface QRCodeData {
  id: string;
  code: string;
  label: string;
  scans: { mealSlot: { name: string; date: string } }[];
}

export default function QRCodesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showQR, setShowQR] = useState<QRCodeData | null>(null);
  const [count, setCount] = useState("10");
  const [labelPrefix, setLabelPrefix] = useState("Attendee");
  const [generating, setGenerating] = useState(false);
  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (canvas && showQR) {
        QRCode.toCanvas(canvas, showQR.code, {
          width: 260,
          margin: 2,
          color: { dark: "#1c1c1e", light: "#ffffff" },
        });
      }
    },
    [showQR]
  );
  const router = useRouter();

  const fetchQRCodes = useCallback(async () => {
    const res = await fetch(`/api/events/${id}/qrcodes`);
    const data = await res.json();
    setQRCodes(data.qrCodes || []);
    setEventName(data.eventName || "Event");
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchQRCodes();
  }, [fetchQRCodes]);

const handleGenerate = async () => {
    setGenerating(true);
    await fetch(`/api/events/${id}/qrcodes/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: parseInt(count), labelPrefix }),
    });
    setShowGenerate(false);
    setGenerating(false);
    fetchQRCodes();
  };

  const [downloading, setDownloading] = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const downloadAllQR = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();

      for (const qr of qrCodes) {
        const canvas = document.createElement("canvas");
        await QRCode.toCanvas(canvas, qr.code, {
          width: 400,
          margin: 3,
          color: { dark: "#1c1c1e", light: "#ffffff" },
        });

        // Add label text
        const newCanvas = document.createElement("canvas");
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height + 50;
        const newCtx = newCanvas.getContext("2d")!;
        newCtx.fillStyle = "#ffffff";
        newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height);
        newCtx.drawImage(canvas, 0, 0);
        newCtx.fillStyle = "#1c1c1e";
        newCtx.font = "bold 20px -apple-system, sans-serif";
        newCtx.textAlign = "center";
        newCtx.fillText(qr.label, newCanvas.width / 2, canvas.height + 32);

        const blob = await new Promise<Blob>((resolve) =>
          newCanvas.toBlob((b) => resolve(b!), "image/png")
        );
        zip.file(`${qr.label.replace(/\s+/g, "-")}.png`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.download = `${eventName.replace(/\s+/g, "-")}-QR-Codes.zip`;
      link.href = URL.createObjectURL(zipBlob);
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setDownloading(false);
    }
  };

  const downloadCSV = () => {
    setDownloadingCSV(true);
    try {
      const rows = [["Label", "Code"]];
      for (const qr of qrCodes) {
        rows.push([qr.label, qr.code]);
      }
      const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const link = document.createElement("a");
      link.download = `${eventName.replace(/\s+/g, "-")}-QR-Codes.csv`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setDownloadingCSV(false);
    }
  };

  return (
    <div>
      <IOSNavBar
        title="QR Codes"
        leftButton={
          <button
            onClick={() => router.push(`/dashboard/events/${id}`)}
            className="text-ios-blue text-[17px] flex items-center gap-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Event
          </button>
        }
        rightButton={
          <button
            onClick={() => setShowGenerate(true)}
            className="text-ios-blue text-[17px]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        }
      />

      <div className="pt-2">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-ios-blue/20 border-t-ios-blue rounded-full animate-spin" />
          </div>
        ) : qrCodes.length === 0 ? (
          <IOSEmptyState
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            }
            title="No QR Codes"
            description="Generate QR codes for event attendees."
            action={
              <IOSButton onClick={() => setShowGenerate(true)} fullWidth={false}>
                Generate QR Codes
              </IOSButton>
            }
          />
        ) : (
          <>
            <div className="px-4 mb-4 flex gap-2">
              <IOSButton onClick={downloadAllQR} variant="secondary" loading={downloading}>
                Download All ({qrCodes.length})
              </IOSButton>
              <IOSButton onClick={downloadCSV} variant="secondary" loading={downloadingCSV}>
                Download CSV
              </IOSButton>
            </div>
            <IOSSection header={`${qrCodes.length} QR Codes`}>
              {qrCodes.map((qr, i) => (
                <IOSRow
                  key={qr.id}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  }
                  iconBg="bg-ios-teal"
                  label={qr.label}
                  value={
                    qr.scans.length > 0 ? (
                      <IOSBadge color="green">{qr.scans.length} scans</IOSBadge>
                    ) : (
                      <IOSBadge color="gray">Unused</IOSBadge>
                    )
                  }
                  chevron
                  onClick={() => setShowQR(qr)}
                  last={i === qrCodes.length - 1}
                />
              ))}
            </IOSSection>
          </>
        )}
      </div>

      {/* Generate Sheet */}
      <IOSSheet
        open={showGenerate}
        onClose={() => setShowGenerate(false)}
        title="Generate QR Codes"
      >
        <IOSSection footer="Each QR code is unique and can only be used once per meal slot.">
          <IOSTextField label="Count" value={count} onChange={setCount} type="number" placeholder="10" />
          <IOSTextField label="Prefix" value={labelPrefix} onChange={setLabelPrefix} placeholder="Attendee" last />
        </IOSSection>
        <div className="mt-2">
          <IOSButton onClick={handleGenerate} loading={generating}>
            Generate {count} Codes
          </IOSButton>
        </div>
      </IOSSheet>

      {/* QR Code Preview Sheet */}
      <IOSSheet
        open={!!showQR}
        onClose={() => setShowQR(null)}
        title={showQR?.label || "QR Code"}
      >
        {showQR && (
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <canvas ref={canvasRef} />
            </div>
            <p className="text-[20px] font-semibold mt-4">{showQR.label}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(showQR.code);
                setCopiedId(showQR.id);
                setTimeout(() => setCopiedId(null), 2000);
              }}
              className="flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full active:opacity-60 transition-opacity"
            >
              <span className="text-[13px] text-ios-secondary font-mono">{showQR.code}</span>
              {copiedId === showQR.id ? (
                <svg className="w-4 h-4 text-ios-green shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-ios-blue shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            {showQR.scans.length > 0 && (
              <div className="w-full mt-6">
                <IOSSection header="Scan History">
                  {showQR.scans.map((scan, i) => (
                    <IOSRow
                      key={i}
                      label={scan.mealSlot.name}
                      value={new Date(scan.mealSlot.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      last={i === showQR.scans.length - 1}
                    />
                  ))}
                </IOSSection>
              </div>
            )}
          </div>
        )}
      </IOSSheet>
    </div>
  );
}
