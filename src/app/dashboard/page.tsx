"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IOSNavBar,
  IOSSection,
  IOSRow,
  IOSSheet,
  IOSTextField,
  IOSButton,
  IOSEmptyState,
  IOSBadge,
} from "@/components/IOSComponents";

interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  _count: { qrCodes: number; mealSlots: number };
}

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [creating, setCreating] = useState(false);
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

  const handleCreate = async () => {
    if (!name || !startDate || !endDate) return;
    setCreating(true);
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, startDate, endDate }),
    });
    setShowCreate(false);
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setCreating(false);
    fetchEvents();
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div>
      <IOSNavBar
        title="Events"
        large
        rightButton={
          <button
            onClick={() => setShowCreate(true)}
            className="text-ios-blue text-[17px]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        }
      />

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
            title="No Events"
            description="Create your first event to get started with meal management."
            action={
              <IOSButton onClick={() => setShowCreate(true)} fullWidth={false}>
                Create Event
              </IOSButton>
            }
          />
        ) : (
          <IOSSection header="All Events">
            {events.map((event, i) => (
              <IOSRow
                key={event.id}
                label={event.name}
                detail={`${formatDate(event.startDate)} - ${formatDate(event.endDate)}`}
                value={
                  <div className="flex gap-1.5">
                    <IOSBadge color="blue">{event._count.qrCodes} QR</IOSBadge>
                    <IOSBadge color="green">{event._count.mealSlots} meals</IOSBadge>
                  </div>
                }
                chevron
                onClick={() => router.push(`/dashboard/events/${event.id}`)}
                last={i === events.length - 1}
              />
            ))}
          </IOSSection>
        )}
      </div>

      <IOSSheet open={showCreate} onClose={() => setShowCreate(false)} title="New Event">
        <IOSSection>
          <IOSTextField label="Name" value={name} onChange={setName} placeholder="Event name" />
          <IOSTextField label="About" value={description} onChange={setDescription} placeholder="Optional" />
          <IOSTextField label="Start" value={startDate} onChange={setStartDate} type="date" />
          <IOSTextField label="End" value={endDate} onChange={setEndDate} type="date" last />
        </IOSSection>
        <div className="px-0 mt-2">
          <IOSButton onClick={handleCreate} loading={creating} disabled={!name || !startDate || !endDate}>
            Create Event
          </IOSButton>
        </div>
      </IOSSheet>
    </div>
  );
}
