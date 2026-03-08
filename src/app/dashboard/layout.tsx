"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== "SUPER_ADMIN")) {
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

  const tabs = [
    {
      label: "Events",
      path: "/dashboard",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Users",
      path: "/dashboard/users",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
    },
  ];

  const isActive = (path: string) =>
    pathname === path || (path !== "/dashboard" && pathname.startsWith(path));

  return (
    <div className="min-h-dvh bg-ios-bg lg:flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 lg:fixed lg:inset-y-0 bg-ios-card border-r border-ios-separator/30">
        <div className="p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ios-blue rounded-[10px] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#1c1c1e]">Scan to Eat</h2>
              <p className="text-[12px] text-ios-secondary">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-colors text-[15px] ${
                isActive(tab.path)
                  ? "bg-ios-blue/10 text-ios-blue font-medium"
                  : "text-[#1c1c1e] hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-ios-separator/30">
          <div className="px-3 py-2 mb-2">
            <p className="text-[13px] font-medium text-[#1c1c1e] truncate">{user.name}</p>
            <p className="text-[11px] text-ios-secondary truncate">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-ios-red text-[15px] hover:bg-ios-red/5 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 pb-20 lg:pb-6 lg:ml-64 xl:ml-72">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-ios-card/80 backdrop-blur-xl border-t border-ios-separator/30 safe-bottom z-50 lg:hidden">
        <div className="flex justify-around items-center h-[50px] max-w-lg mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center gap-0.5 py-1 px-6 ${
                isActive(tab.path) ? "text-ios-blue" : "text-ios-secondary"
              }`}
            >
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
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
