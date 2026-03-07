"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  IOSNavBar,
  IOSSection,
  IOSRow,
  IOSSheet,
  IOSTextField,
  IOSButton,
  IOSBadge,
  StatusDot,
} from "@/components/IOSComponents";

interface MealSlot {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  _count?: { scans: number };
}

interface UserRef {
  user: { id: string; name: string; email: string };
}

interface EventDetail {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  mealSlots: MealSlot[];
  _count: { qrCodes: number };
  managers: UserRef[];
  staff: UserRef[];
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [mealName, setMealName] = useState("");
  const [mealDate, setMealDate] = useState("");
  const [mealStart, setMealStart] = useState("");
  const [mealEnd, setMealEnd] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const router = useRouter();

  const fetchEvent = useCallback(async () => {
    const res = await fetch(`/api/events/${id}`);
    const data = await res.json();
    setEvent(data.event);
    setSelectedManagers(data.event?.managers?.map((m: UserRef) => m.user.id) || []);
    setSelectedStaff(data.event?.staff?.map((s: UserRef) => s.user.id) || []);
    setLoading(false);
  }, [id]);

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setAllUsers(data.users || []);
  }, []);

  useEffect(() => {
    fetchEvent();
    fetchUsers();
  }, [fetchEvent, fetchUsers]);

  const handleAddMeal = async () => {
    if (!mealName || !mealDate || !mealStart || !mealEnd) return;
    setSaving(true);
    await fetch(`/api/events/${id}/meals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: mealName,
        date: mealDate,
        startTime: mealStart,
        endTime: mealEnd,
      }),
    });
    setShowAddMeal(false);
    setMealName("");
    setMealDate("");
    setMealStart("");
    setMealEnd("");
    setSaving(false);
    fetchEvent();
  };

  const handleDeleteMeal = async (mealId: string) => {
    await fetch(`/api/events/${id}/meals/${mealId}`, { method: "DELETE" });
    fetchEvent();
  };

  const handleAssign = async () => {
    setSaving(true);
    await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        managerIds: selectedManagers,
        staffIds: selectedStaff,
      }),
    });
    setSaving(false);
    setShowAssign(false);
    fetchEvent();
  };

  const handleDeleteEvent = async () => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  const toggleUser = (list: string[], setList: (v: string[]) => void, userId: string) => {
    setList(list.includes(userId) ? list.filter((u) => u !== userId) : [...list, userId]);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (loading || !event) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-3 border-ios-blue/20 border-t-ios-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <IOSNavBar
        title={event.name}
        leftButton={
          <button onClick={() => router.push("/dashboard")} className="text-ios-blue text-[17px] flex items-center gap-0.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        }
      />

      <div className="pt-2">
        {/* Event Info */}
        <IOSSection header="Event Details">
          <IOSRow label="Name" value={event.name} />
          <IOSRow label="Start" value={formatDate(event.startDate)} />
          <IOSRow label="End" value={formatDate(event.endDate)} />
          <IOSRow label="QR Codes" value={String(event._count.qrCodes)} last />
        </IOSSection>

        {/* QR Codes */}
        <IOSSection header="QR Code Management">
          <IOSRow
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            }
            iconBg="bg-ios-blue"
            label="View & Generate QR Codes"
            chevron
            onClick={() => router.push(`/dashboard/events/${id}/qrcodes`)}
            last
          />
        </IOSSection>

        {/* Meal Slots */}
        <IOSSection
          header="Meal Slots"
          footer="Meal slots define when attendees can scan for meals."
        >
          {event.mealSlots.length === 0 ? (
            <IOSRow label="No meal slots configured" last />
          ) : (
            event.mealSlots.map((meal, i) => (
              <IOSRow
                key={meal.id}
                icon={<StatusDot active={meal.isActive} />}
                label={meal.name}
                detail={`${formatDate(meal.date)} \u00B7 ${meal.startTime} - ${meal.endTime}`}
                value={
                  <div className="flex items-center gap-2">
                    {meal.isActive && <IOSBadge color="green">Active</IOSBadge>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMeal(meal.id);
                      }}
                      className="text-ios-red text-[15px]"
                    >
                      Delete
                    </button>
                  </div>
                }
                last={i === event.mealSlots.length - 1}
              />
            ))
          )}
        </IOSSection>

        <div className="px-4 mb-6">
          <IOSButton onClick={() => setShowAddMeal(true)} variant="secondary">
            Add Meal Slot
          </IOSButton>
        </div>

        {/* Team Assignment */}
        <IOSSection header="Team">
          <IOSRow
            label="Managers"
            value={String(event.managers.length)}
            chevron
            onClick={() => {
              setShowAssign(true);
            }}
          />
          <IOSRow
            label="Staff"
            value={String(event.staff.length)}
            chevron
            onClick={() => {
              setShowAssign(true);
            }}
            last
          />
        </IOSSection>

        {/* Danger Zone */}
        <IOSSection>
          <IOSRow
            label="Delete Event"
            destructive
            onClick={handleDeleteEvent}
            last
          />
        </IOSSection>
      </div>

      {/* Add Meal Sheet */}
      <IOSSheet open={showAddMeal} onClose={() => setShowAddMeal(false)} title="Add Meal Slot">
        <IOSSection>
          <IOSTextField label="Name" value={mealName} onChange={setMealName} placeholder="e.g. Breakfast" />
          <IOSTextField label="Date" value={mealDate} onChange={setMealDate} type="date" />
          <IOSTextField label="Start" value={mealStart} onChange={setMealStart} type="time" />
          <IOSTextField label="End" value={mealEnd} onChange={setMealEnd} type="time" last />
        </IOSSection>
        <div className="mt-2">
          <IOSButton onClick={handleAddMeal} loading={saving} disabled={!mealName || !mealDate || !mealStart || !mealEnd}>
            Add Meal Slot
          </IOSButton>
        </div>
      </IOSSheet>

      {/* Assign Team Sheet */}
      <IOSSheet open={showAssign} onClose={() => setShowAssign(false)} title="Assign Team">
        <IOSSection header="Event Managers">
          {allUsers
            .filter((u) => u.role === "EVENT_MANAGER")
            .map((user, i, arr) => (
              <IOSRow
                key={user.id}
                label={user.name}
                detail={user.email}
                toggle={selectedManagers.includes(user.id)}
                onToggle={() => toggleUser(selectedManagers, setSelectedManagers, user.id)}
                last={i === arr.length - 1}
              />
            ))}
          {allUsers.filter((u) => u.role === "EVENT_MANAGER").length === 0 && (
            <IOSRow label="No event managers created yet" last />
          )}
        </IOSSection>

        <IOSSection header="Staff Members">
          {allUsers
            .filter((u) => u.role === "STAFF")
            .map((user, i, arr) => (
              <IOSRow
                key={user.id}
                label={user.name}
                detail={user.email}
                toggle={selectedStaff.includes(user.id)}
                onToggle={() => toggleUser(selectedStaff, setSelectedStaff, user.id)}
                last={i === arr.length - 1}
              />
            ))}
          {allUsers.filter((u) => u.role === "STAFF").length === 0 && (
            <IOSRow label="No staff members created yet" last />
          )}
        </IOSSection>

        <div className="mt-2">
          <IOSButton onClick={handleAssign} loading={saving}>
            Save Assignments
          </IOSButton>
        </div>
      </IOSSheet>
    </div>
  );
}
