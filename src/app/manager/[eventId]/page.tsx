"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  IOSNavBar,
  IOSSection,
  IOSRow,
  IOSBadge,
  StatusDot,
} from "@/components/IOSComponents";

interface MealStat {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  scannedCount: number;
  totalQRCodes: number;
}

interface Stats {
  totalQRCodes: number;
  totalScans: number;
  mealSlots: MealStat[];
}

export default function ManagerEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const router = useRouter();

  const fetchStats = useCallback(async () => {
    const res = await fetch(`/api/events/${eventId}/stats`);
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, [fetchStats]);

  const toggleMeal = async (mealId: string, isActive: boolean) => {
    setToggling(mealId);
    await fetch(`/api/events/${eventId}/meals/${mealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    await fetchStats();
    setToggling(null);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-3 border-ios-blue/20 border-t-ios-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <IOSNavBar
        title="Event Control"
        leftButton={
          <button
            onClick={() => router.push("/manager")}
            className="text-ios-blue text-[17px] flex items-center gap-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Events
          </button>
        }
      />

      <div className="pt-2">
        {/* Overview Stats */}
        <IOSSection header="Overview">
          <IOSRow
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            }
            iconBg="bg-ios-blue"
            label="Total QR Codes"
            value={String(stats.totalQRCodes)}
          />
          <IOSRow
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconBg="bg-ios-green"
            label="Total Scans"
            value={String(stats.totalScans)}
            last
          />
        </IOSSection>

        {/* Meal Slots - Toggle Control */}
        <IOSSection
          header="Meal Control"
          footer="Toggle a meal slot to allow staff to scan QR codes for that meal. Only one meal should be active at a time."
        >
          {stats.mealSlots.length === 0 ? (
            <IOSRow label="No meal slots configured" last />
          ) : (
            stats.mealSlots.map((meal, i) => (
              <div key={meal.id}>
                <IOSRow
                  icon={<StatusDot active={meal.isActive} />}
                  label={meal.name}
                  detail={`${formatDate(meal.date)} \u00B7 ${meal.startTime} - ${meal.endTime}`}
                  toggle={meal.isActive}
                  onToggle={(val) => toggleMeal(meal.id, val)}
                  last={i === stats.mealSlots.length - 1}
                />
                {/* Progress bar below meal row */}
                {meal.isActive && (
                  <div className={`px-4 pb-3 ${i !== stats.mealSlots.length - 1 ? "border-b border-ios-separator/30" : ""}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] text-ios-secondary">
                        {meal.scannedCount} of {meal.totalQRCodes} scanned
                      </span>
                      <IOSBadge color="green">
                        {meal.totalQRCodes > 0
                          ? Math.round((meal.scannedCount / meal.totalQRCodes) * 100)
                          : 0}
                        %
                      </IOSBadge>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ios-green rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            meal.totalQRCodes > 0
                              ? (meal.scannedCount / meal.totalQRCodes) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </IOSSection>

        {/* Per-meal stats */}
        <IOSSection header="Attendance Statistics">
          {stats.mealSlots.map((meal, i) => (
            <IOSRow
              key={meal.id}
              label={meal.name}
              detail={formatDate(meal.date)}
              value={
                <div className="text-right">
                  <span className="text-[17px] font-semibold text-[#1c1c1e]">
                    {meal.scannedCount}
                  </span>
                  <span className="text-[15px] text-ios-secondary">
                    /{meal.totalQRCodes}
                  </span>
                </div>
              }
              last={i === stats.mealSlots.length - 1}
            />
          ))}
        </IOSSection>
      </div>
    </div>
  );
}
