"use client";

import { useState, useCallback, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { IOSNavBar, IOSSection, IOSRow } from "@/components/IOSComponents";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  { ssr: false }
);

interface ScanResult {
  type: "success" | "error";
  message: string;
  attendee?: string;
  meal?: string;
}

interface MealStats {
  activeMeal: { name: string; scanned: number; total: number } | null;
  totalScans: number;
}

export default function ScanPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [stats, setStats] = useState<MealStats | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const router = useRouter();
  const lastScannedRef = useRef<string>("");
  const lastScannedTimeRef = useRef<number>(0);
  const processingRef = useRef(false);

  // Fetch real stats from DB
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/scan-stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Silently ignore
    }
  }, [eventId]);

  // Load stats on mount and poll every 10 seconds
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const playTone = useCallback((type: "success" | "error") => {
    try {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.value = 0.3;

      if (type === "success") {
        const osc1 = ctx.createOscillator();
        osc1.type = "sine";
        osc1.frequency.value = 880;
        osc1.connect(gain);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.12);

        const osc2 = ctx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.value = 1320;
        osc2.connect(gain);
        osc2.start(ctx.currentTime + 0.12);
        osc2.stop(ctx.currentTime + 0.25);

        gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.2);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
      } else {
        gain.gain.value = 1.0;

        // Beep 1
        const osc1 = ctx.createOscillator();
        osc1.type = "square";
        osc1.frequency.value = 2400;
        osc1.connect(gain);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.15);

        // Beep 2
        const osc2 = ctx.createOscillator();
        osc2.type = "square";
        osc2.frequency.value = 2400;
        osc2.connect(gain);
        osc2.start(ctx.currentTime + 0.25);
        osc2.stop(ctx.currentTime + 0.4);

        // Beep 3
        const osc3 = ctx.createOscillator();
        osc3.type = "square";
        osc3.frequency.value = 2400;
        osc3.connect(gain);
        osc3.start(ctx.currentTime + 0.5);
        osc3.stop(ctx.currentTime + 0.65);

        gain.gain.setValueAtTime(1.0, ctx.currentTime + 0.6);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.65);
      }
    } catch {
      // Audio not available
    }
  }, []);

  const processCode = useCallback(
    async (code: string) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setPaused(true); // Pause scanner while processing
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

        playTone(res.ok ? "success" : "error");
        if (navigator.vibrate) {
          navigator.vibrate(res.ok ? [100] : [100, 50, 100]);
        }

        // Refresh stats after each scan
        if (res.ok) fetchStats();
      } catch {
        playTone("error");
        setResult({ type: "error", message: "Connection error" });
      } finally {
        processingRef.current = false;
        // Stay paused — user taps "Continue" to resume
      }
    },
    [eventId, playTone, fetchStats]
  );

  const handleContinue = useCallback(() => {
    setResult(null);
    setPaused(false);
    lastScannedRef.current = "";
    lastScannedTimeRef.current = 0;
  }, []);

  const handleScan = useCallback(
    (detectedCodes: { rawValue: string }[]) => {
      if (!detectedCodes.length) return;
      const code = detectedCodes[0].rawValue;
      if (!code) return;

      const now = Date.now();
      if (code === lastScannedRef.current && now - lastScannedTimeRef.current < 2000) {
        return;
      }
      lastScannedRef.current = code;
      lastScannedTimeRef.current = now;
      processCode(code);
    },
    [processCode]
  );

  return (
    <div>
      <IOSNavBar
        title="Scan QR Code"
        leftButton={
          <button
            onClick={() => {
              setCameraActive(false);
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
          stats?.activeMeal ? (
            <span className="text-[13px] font-semibold text-ios-green">
              {stats.activeMeal.scanned}/{stats.activeMeal.total}
            </span>
          ) : (
            <span className="text-[13px] text-ios-secondary">No active meal</span>
          )
        }
      />

      {/* Active meal stats bar */}
      {stats?.activeMeal && (
        <div className="mx-4 mb-2 px-4 py-2.5 bg-ios-green/10 rounded-2xl flex items-center justify-between">
          <span className="text-[13px] font-medium text-ios-green">{stats.activeMeal.name}</span>
          <span className="text-[13px] text-ios-green">
            {stats.activeMeal.scanned} of {stats.activeMeal.total} scanned
          </span>
        </div>
      )}

      <div className="pt-1 lg:grid lg:grid-cols-2 lg:gap-6 lg:px-4">
        {/* Camera Scanner */}
        <div className="mx-4 mb-4 lg:mx-0">
          {!cameraActive ? (
            <button
              onClick={() => { setCameraError(""); setCameraActive(true); }}
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
            <div className="relative rounded-2xl overflow-hidden">
              <Scanner
                onScan={handleScan}
                onError={(err: unknown) => {
                  const msg = err instanceof Error ? err.message : typeof err === "string" ? err : "Camera error";
                  setCameraError(msg);
                }}
                paused={paused}
                allowMultiple={true}
                scanDelay={500}
                constraints={{ facingMode: "environment" }}
                styles={{
                  container: { width: "100%", aspectRatio: "4/3" },
                  video: { objectFit: "cover" as const },
                }}
                components={{
                  finder: false,
                }}
              />
              {/* Custom scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 relative">
                  <div className="absolute inset-0 border-2 border-white/30 rounded-2xl" />
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-ios-green rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-ios-green rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-ios-green rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-ios-green rounded-br-2xl" />
                </div>
              </div>
              <button
                onClick={() => setCameraActive(false)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center z-10"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {cameraError && (
            <p className="text-[13px] text-ios-red text-center mt-2">
              {cameraError}
            </p>
          )}
        </div>

        {/* Right column on desktop */}
        <div className="lg:space-y-4">
        {/* Scan Result + Continue Button */}
        {result && (
          <div className="mx-4 mb-4 lg:mx-0">
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
                <div className="flex-1">
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
                      {result.attendee} {"\u00B7"} {result.meal}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleContinue}
              className="w-full mt-3 py-3.5 bg-ios-blue text-white text-[17px] font-semibold rounded-2xl active:opacity-70 transition-opacity"
            >
              Continue Scanning
            </button>
          </div>
        )}

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
    </div>
  );
}
