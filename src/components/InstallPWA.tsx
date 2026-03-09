"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Check if dismissed before
    if (sessionStorage.getItem("pwa-dismissed")) {
      setDismissed(true);
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);

    // Listen for install prompt (Chrome/Android/Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa-dismissed", "1");
    setShowIOSGuide(false);
  };

  // Don't show if already installed or dismissed
  if (isStandalone || dismissed) return null;

  // Don't show if no install prompt and not iOS
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      {/* Install Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[90] safe-bottom">
        <div className="mx-3 mb-3 bg-ios-card rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex items-center gap-3 p-3">
            {/* App Icon */}
            <div className="w-[48px] h-[48px] bg-ios-blue rounded-[12px] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,122,255,0.3)]">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-[#1c1c1e] leading-[20px]">
                Install Scan to Eat
              </p>
              <p className="text-[13px] text-ios-secondary leading-[18px]">
                Add to home screen for the best experience
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDismiss}
                className="w-[28px] h-[28px] rounded-full bg-[#e5e5ea] flex items-center justify-center"
              >
                <svg className="w-3 h-3 text-ios-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                onClick={isIOS ? () => setShowIOSGuide(true) : handleInstall}
                className="bg-ios-blue text-white text-[15px] font-semibold px-4 py-[7px] rounded-full active:bg-[#0062cc] transition-colors"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Install Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-black/40 animate-ios-fade-in"
            onClick={() => setShowIOSGuide(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 animate-ios-slide-up">
            <div className="bg-ios-bg rounded-t-[14px] safe-bottom">
              {/* Handle bar */}
              <div className="flex justify-center pt-[6px] pb-[2px]">
                <div className="w-[36px] h-[5px] rounded-full bg-[#c7c7cc]" />
              </div>
              <div className="px-6 pt-4 pb-8">
                <h2 className="text-[22px] font-bold text-[#1c1c1e] text-center mb-6">
                  Install Scan to Eat
                </h2>

                <div className="space-y-5">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4">
                    <div className="w-[32px] h-[32px] bg-ios-blue rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white text-[15px] font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-[17px] font-medium text-[#1c1c1e] leading-[22px]">
                        Tap the Share button
                      </p>
                      <p className="text-[15px] text-ios-secondary leading-[20px] mt-0.5">
                        Look for{" "}
                        <svg className="inline w-[18px] h-[18px] text-ios-blue -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>{" "}
                        at the bottom of Safari
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4">
                    <div className="w-[32px] h-[32px] bg-ios-blue rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white text-[15px] font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-[17px] font-medium text-[#1c1c1e] leading-[22px]">
                        Scroll down and tap
                      </p>
                      <p className="text-[15px] text-ios-secondary leading-[20px] mt-0.5">
                        &quot;Add to Home Screen&quot;
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4">
                    <div className="w-[32px] h-[32px] bg-ios-blue rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white text-[15px] font-bold">3</span>
                    </div>
                    <div>
                      <p className="text-[17px] font-medium text-[#1c1c1e] leading-[22px]">
                        Tap &quot;Add&quot;
                      </p>
                      <p className="text-[15px] text-ios-secondary leading-[20px] mt-0.5">
                        The app will appear on your home screen
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full mt-8 bg-ios-blue text-white text-[17px] font-semibold py-[14px] rounded-[14px] active:bg-[#0062cc] transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
