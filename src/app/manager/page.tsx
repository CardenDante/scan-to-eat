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

interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  _count: { qrCodes: number; mealSlots: number };
}

export default function ManagerPage() {
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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div>
      <IOSNavBar title="My Events" large />

      <div className="pt-2">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-3 border-ios-blue/20 border-t-ios-blue rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <IOSEmptyState
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            title="No Events Assigned"
            description="You haven't been assigned to any events yet."
          />
        ) : (
          <IOSSection>
            {events.map((event, i) => (
              <IOSRow
                key={event.id}
                label={event.name}
                detail={`${formatDate(event.startDate)} - ${formatDate(event.endDate)}`}
                value={<IOSBadge color="green">{event._count.mealSlots} meals</IOSBadge>}
                chevron
                onClick={() => router.push(`/manager/${event.id}`)}
                last={i === events.length - 1}
              />
            ))}
          </IOSSection>
        )}
      </div>
    </div>
  );
}
