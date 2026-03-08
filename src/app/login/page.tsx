"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IOSButton, IOSSection, IOSTextField } from "@/components/IOSComponents";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
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
        setError(data.error || "Login failed");
        return;
      }
      const role = data.user.role;
      if (role === "SUPER_ADMIN") router.push("/dashboard");
      else if (role === "EVENT_MANAGER") router.push("/manager");
      else router.push("/scanner");
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/auth/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setEmail(data.email);
        setPassword(data.password);
      } else {
        setError(data.error || "Seed failed");
      }
    } catch {
      setError("Connection error");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-dvh bg-ios-bg flex flex-col md:items-center md:justify-center">
      <div className="md:w-full md:max-w-md">
      {/* Header */}
      <div className="pt-16 md:pt-8 pb-8 text-center px-8">
        <div className="w-20 h-20 bg-ios-blue rounded-[22px] mx-auto mb-5 flex items-center justify-center shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <h1 className="text-[28px] font-bold text-[#1c1c1e]">Scan to Eat</h1>
        <p className="text-[15px] text-ios-secondary mt-1">QR Meal Pass System</p>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-0">
        <IOSSection header="Sign In">
          <IOSTextField
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="email@example.com"
          />
          <IOSTextField
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="Enter password"
            last
          />
        </IOSSection>

        {error && (
          <div className="mx-4 mb-4 p-3 bg-ios-red/10 rounded-[10px]">
            <p className="text-[15px] text-ios-red text-center">{error}</p>
          </div>
        )}

        <div className="px-4 space-y-3">
          <IOSButton onClick={handleLogin} loading={loading}>
            Sign In
          </IOSButton>
        </div>

        <div className="px-4 mt-8">
          <IOSButton onClick={handleSeed} variant="secondary" loading={seeding}>
            {seeding ? "Creating..." : "Create Default Admin"}
          </IOSButton>
          <p className="text-[13px] text-ios-secondary text-center mt-2">
            First time? Tap to create the default admin account.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
