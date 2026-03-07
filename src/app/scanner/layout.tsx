"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function ScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "STAFF")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-dvh bg-ios-bg flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-ios-blue/20 border-t-ios-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-ios-bg pb-20">
      {children}
      <div className="fixed bottom-0 left-0 right-0 bg-ios-card/80 backdrop-blur-xl border-t border-ios-separator/30 safe-bottom z-50">
        <div className="flex justify-around items-center h-[50px] max-w-lg mx-auto">
          <button
            onClick={() => router.push("/scanner")}
            className="flex flex-col items-center gap-0.5 py-1 px-6 text-ios-blue"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span className="text-[10px] font-medium">Scan</span>
          </button>
          <button
            onClick={logout}
            className="flex flex-col items-center gap-0.5 py-1 px-6 text-ios-secondary"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span className="text-[10px] font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
