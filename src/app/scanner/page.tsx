"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IOSNavBar,
  IOSSection,
  IOSRow,
  IOSBadge,
  IOSEmptyState,
} from "@/components/IOSComponents";

interface MealSlot {
  id: string;
  name: string;
  isActive: boolean;
}

interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  mealSlots: MealSlot[];
}

export default function ScannerPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div>
      <IOSNavBar title="Scanner" large />

      <div className="pt-2">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-ios-blue/20 border-t-ios-blue rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <IOSEmptyState
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            }
            title="No Events Assigned"
            description="You haven't been assigned to any events yet. Ask your admin to assign you."
          />
        ) : (
          <IOSSection header="Your Events">
            {events.map((event, i) => {
              const activeMeal = event.mealSlots.find((m) => m.isActive);
              return (
                <IOSRow
                  key={event.id}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                  iconBg={activeMeal ? "bg-ios-green" : "bg-ios-secondary"}
                  label={event.name}
                  detail={activeMeal ? `Active: ${activeMeal.name}` : "No active meal"}
                  value={
                    activeMeal ? (
                      <IOSBadge color="green">Ready</IOSBadge>
                    ) : (
                      <IOSBadge color="gray">Waiting</IOSBadge>
                    )
                  }
                  chevron
                  onClick={() =>
                    activeMeal
                      ? router.push(`/scanner/${event.id}`)
                      : undefined
                  }
                  last={i === events.length - 1}
                />
              );
            })}
          </IOSSection>
        )}
      </div>
    </div>
  );
}
