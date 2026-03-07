"use client";

import { useState, useRef, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { IOSNavBar, IOSSection, IOSRow, IOSButton } from "@/components/IOSComponents";

interface ScanResult {
  type: "success" | "error";
  message: string;
  attendee?: string;
  meal?: string;
}

export default function ScanPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [scanCount, setScanCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const router = useRouter();

  const processCode = useCallback(
    async (code: string) => {
      if (scanning) return;
      setScanning(true);
      setResult(null);

      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: code.trim(), eventId }),
        });
        const data = await res.json();

        const scanResult: ScanResult = res.ok
          ? {
              type: "success",
              message: data.message,
              attendee: data.scan?.attendee,
              meal: data.scan?.meal,
            }
          : { type: "error", message: data.error };

        setResult(scanResult);
        setHistory((prev) => [scanResult, ...prev].slice(0, 50));
        if (res.ok) setScanCount((c) => c + 1);

        // Vibrate on result
        if (navigator.vibrate) {
          navigator.vibrate(res.ok ? [100] : [100, 50, 100]);
        }
      } catch {
        setResult({ type: "error", message: "Connection error" });
      } finally {
        setScanning(false);
        setManualCode("");
      }
    },
    [eventId, scanning]
  );

  const startCamera = useCallback(async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);

      // Use BarcodeDetector if available
      if ("BarcodeDetector" in window) {
        const detector = new (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector({
          formats: ["qr_code"],
        });
        const scanLoop = async () => {
          if (!videoRef.current || !streamRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              if (code) {
                await processCode(code);
              }
            }
          } catch {
            // Ignore detection errors
          }
          if (streamRef.current) {
            requestAnimationFrame(scanLoop);
          }
        };
        requestAnimationFrame(scanLoop);
      } else {
        setCameraError("Camera QR scanning not supported in this browser. Use manual entry below.");
      }
    } catch {
      setCameraError("Camera access denied. Use manual entry below.");
    }
  }, [processCode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div>
      <IOSNavBar
        title="Scan QR Code"
        leftButton={
          <button
            onClick={() => {
              stopCamera();
              router.push("/scanner");
            }}
            className="text-ios-blue text-[17px] flex items-center gap-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        }
        rightButton={
          <span className="text-[15px] font-semibold text-ios-green">
            {scanCount} scanned
          </span>
        }
      />

      <div className="pt-2">
        {/* Camera Scanner */}
        <div className="mx-4 mb-4">
          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="w-full aspect-[4/3] bg-[#1c1c1e] rounded-2xl flex flex-col items-center justify-center gap-3"
            >
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-white/80 text-[17px] font-medium">Tap to Start Camera</span>
            </button>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full aspect-[4/3] bg-black rounded-2xl object-cover"
                playsInline
                muted
              />
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-white/50 rounded-2xl">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-ios-green rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-ios-green rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-ios-green rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-ios-green rounded-br-2xl" />
                </div>
              </div>
              <button
                onClick={stopCamera}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {cameraError && (
            <p className="text-[13px] text-ios-secondary text-center mt-2">
              {cameraError}
            </p>
          )}
        </div>

        {/* Scan Result */}
        {result && (
          <div className="mx-4 mb-4">
            <div
              className={`rounded-2xl p-5 ${
                result.type === "success"
                  ? "bg-ios-green/10 border-2 border-ios-green/20"
                  : "bg-ios-red/10 border-2 border-ios-red/20"
              }`}
            >
              <div className="flex items-center gap-3">
                {result.type === "success" ? (
                  <div className="w-12 h-12 rounded-full bg-ios-green flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-ios-red flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                <div>
                  <p
                    className={`text-[17px] font-semibold ${
                      result.type === "success" ? "text-ios-green" : "text-ios-red"
                    }`}
                  >
                    {result.type === "success" ? "Approved" : "Denied"}
                  </p>
                  <p className="text-[15px] text-[#1c1c1e]">{result.message}</p>
                  {result.attendee && (
                    <p className="text-[13px] text-ios-secondary mt-0.5">
                      {result.attendee} \u00B7 {result.meal}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Entry */}
        <IOSSection header="Manual Entry" footer="Enter the QR code value manually if camera scanning is unavailable.">
          <div className="flex items-center px-4 py-2 gap-3">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter QR code..."
              className="flex-1 text-[17px] py-2 bg-transparent placeholder:text-ios-secondary/50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && manualCode.trim()) {
                  processCode(manualCode);
                }
              }}
            />
            <IOSButton
              onClick={() => processCode(manualCode)}
              disabled={!manualCode.trim() || scanning}
              loading={scanning}
              fullWidth={false}
            >
              Scan
            </IOSButton>
          </div>
        </IOSSection>

        {/* Recent Scans */}
        {history.length > 0 && (
          <IOSSection header="Recent Scans">
            {history.map((scan, i) => (
              <IOSRow
                key={i}
                icon={
                  scan.type === "success" ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )
                }
                iconBg={scan.type === "success" ? "bg-ios-green" : "bg-ios-red"}
                label={scan.attendee || scan.message}
                detail={scan.meal || undefined}
                last={i === history.length - 1}
              />
            ))}
          </IOSSection>
        )}
      </div>
    </div>
  );
}
