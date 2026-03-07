"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IOSNavBar,
  IOSSection,
  IOSRow,
  IOSSheet,
  IOSTextField,
  IOSButton,
  IOSBadge,
  IOSEmptyState,
} from "@/components/IOSComponents";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EVENT_MANAGER");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async () => {
    setError("");
    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }
    setCreating(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setCreating(false);
      return;
    }
    setShowCreate(false);
    setName("");
    setEmail("");
    setPassword("");
    setRole("EVENT_MANAGER");
    setCreating(false);
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  const roleColors: Record<string, "blue" | "green" | "orange"> = {
    SUPER_ADMIN: "blue",
    EVENT_MANAGER: "orange",
    STAFF: "green",
  };

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "Admin",
    EVENT_MANAGER: "Manager",
    STAFF: "Staff",
  };

  return (
    <div>
      <IOSNavBar
        title="Users"
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
        ) : users.length === 0 ? (
          <IOSEmptyState
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
              </svg>
            }
            title="No Users"
            description="Add event managers and staff members."
            action={
              <IOSButton onClick={() => setShowCreate(true)} fullWidth={false}>
                Add User
              </IOSButton>
            }
          />
        ) : (
          <IOSSection header="All Users">
            {users.map((user, i) => (
              <IOSRow
                key={user.id}
                label={user.name}
                detail={user.email}
                value={
                  <div className="flex items-center gap-2">
                    <IOSBadge color={roleColors[user.role] || "gray"}>
                      {roleLabels[user.role] || user.role}
                    </IOSBadge>
                    {user.role !== "SUPER_ADMIN" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(user.id);
                        }}
                        className="text-ios-red text-[15px]"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                }
                last={i === users.length - 1}
              />
            ))}
          </IOSSection>
        )}
      </div>

      <IOSSheet open={showCreate} onClose={() => setShowCreate(false)} title="New User">
        <IOSSection>
          <IOSTextField label="Name" value={name} onChange={setName} placeholder="Full name" />
          <IOSTextField label="Email" value={email} onChange={setEmail} type="email" placeholder="email@example.com" />
          <IOSTextField label="Password" value={password} onChange={setPassword} type="password" placeholder="Password" />
          <div className="flex items-center px-4 min-h-[44px]">
            <label className="text-[17px] text-[#1c1c1e] w-28 shrink-0">Role</label>
            <div className="flex-1 flex justify-end gap-2">
              <button
                onClick={() => setRole("EVENT_MANAGER")}
                className={`px-3 py-1.5 rounded-full text-[15px] font-medium transition-colors ${
                  role === "EVENT_MANAGER"
                    ? "bg-ios-orange text-white"
                    : "bg-gray-100 text-ios-secondary"
                }`}
              >
                Manager
              </button>
              <button
                onClick={() => setRole("STAFF")}
                className={`px-3 py-1.5 rounded-full text-[15px] font-medium transition-colors ${
                  role === "STAFF"
                    ? "bg-ios-green text-white"
                    : "bg-gray-100 text-ios-secondary"
                }`}
              >
                Staff
              </button>
            </div>
          </div>
        </IOSSection>

        {error && (
          <div className="mx-0 mb-4 p-3 bg-ios-red/10 rounded-[10px]">
            <p className="text-[15px] text-ios-red text-center">{error}</p>
          </div>
        )}

        <div className="mt-2">
          <IOSButton onClick={handleCreate} loading={creating}>
            Create User
          </IOSButton>
        </div>
      </IOSSheet>
    </div>
  );
}
