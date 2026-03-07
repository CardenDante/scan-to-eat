"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role === "SUPER_ADMIN") router.push("/dashboard");
    else if (user.role === "EVENT_MANAGER") router.push("/manager");
    else router.push("/scanner");
  }, [user, loading, router]);

  return (
    <div className="min-h-dvh bg-ios-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-3 border-ios-blue/20 border-t-ios-blue rounded-full animate-spin" />
        <p className="text-[15px] text-ios-secondary">Loading...</p>
      </div>
    </div>
  );
}
