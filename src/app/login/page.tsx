"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IOSButton, IOSSection, IOSTextField } from "@/components/IOSComponents";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Auto-seed admin on first load (silently)
    fetch("/api/auth/seed", { method: "POST" }).finally(() => setReady(true));
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid email or password");
        return;
      }
      const role = data.user.role;
      if (role === "SUPER_ADMIN") router.push("/dashboard");
      else if (role === "EVENT_MANAGER") router.push("/manager");
      else router.push("/scanner");
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-dvh bg-ios-bg flex items-center justify-center">
        <div className="w-[28px] h-[28px] border-[3px] border-ios-blue/20 border-t-ios-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-ios-bg flex flex-col items-center justify-center px-0">
      <div className="w-full max-w-[420px]">
        {/* App Icon & Title */}
        <div className="pt-[20px] pb-[36px] text-center">
          <div className="w-[80px] h-[80px] bg-ios-blue rounded-[20px] mx-auto mb-[16px] flex items-center justify-center shadow-[0_4px_16px_rgba(0,122,255,0.3)]">
            <svg className="w-[40px] h-[40px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-[28px] font-bold text-[#1c1c1e] tracking-[-0.4px]">Scan to Eat</h1>
          <p className="text-[15px] text-ios-secondary mt-[4px]">Sign in to continue</p>
        </div>

        {/* Login Form */}
        <IOSSection>
          <IOSTextField
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="your@email.com"
          />
          <IOSTextField
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="Required"
            last
          />
        </IOSSection>

        {error && (
          <div className="mx-[16px] mb-[20px] px-[16px] py-[12px] bg-ios-red/8 rounded-[10px] border border-ios-red/15">
            <p className="text-[14px] text-ios-red text-center leading-[19px]">{error}</p>
          </div>
        )}

        <div className="px-[16px]">
          <IOSButton onClick={handleLogin} loading={loading} disabled={!email || !password}>
            Sign In
          </IOSButton>
        </div>

        <p className="text-[13px] text-ios-secondary text-center mt-[32px] px-[32px] leading-[18px]">
          Contact your administrator if you don&apos;t have an account.
        </p>
      </div>
    </div>
  );
}
