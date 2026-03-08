"use client";

import React from "react";

// iOS Settings-style navigation bar
export function IOSNavBar({
  title,
  subtitle,
  leftButton,
  rightButton,
  large = false,
}: {
  title: string;
  subtitle?: string;
  leftButton?: React.ReactNode;
  rightButton?: React.ReactNode;
  large?: boolean;
}) {
  return (
    <div className="sticky top-0 z-50 bg-ios-bg/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 h-11">
        <div className="w-20 flex justify-start">{leftButton}</div>
        {!large && (
          <div className="flex-1 text-center">
            <h1 className="text-[17px] font-semibold truncate">{title}</h1>
            {subtitle && (
              <p className="text-[11px] text-ios-secondary">{subtitle}</p>
            )}
          </div>
        )}
        <div className="w-20 flex justify-end">{rightButton}</div>
      </div>
      {large && (
        <div className="px-4 pb-2">
          <h1 className="text-[34px] font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-[15px] text-ios-secondary mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}

// iOS Settings-style grouped section
export function IOSSection({
  header,
  footer,
  children,
}: {
  header?: string;
  footer?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      {header && (
        <div className="px-5 pb-1.5">
          <h3 className="text-[13px] font-normal text-ios-secondary uppercase tracking-wide">
            {header}
          </h3>
        </div>
      )}
      <div className="mx-4 bg-ios-card rounded-[10px] overflow-hidden">
        {children}
      </div>
      {footer && (
        <div className="px-5 pt-1.5">
          <p className="text-[13px] text-ios-secondary">{footer}</p>
        </div>
      )}
    </div>
  );
}

// iOS Settings-style row
export function IOSRow({
  icon,
  iconBg,
  label,
  value,
  detail,
  chevron = false,
  toggle,
  onToggle,
  destructive = false,
  onClick,
  last = false,
}: {
  icon?: React.ReactNode;
  iconBg?: string;
  label: string;
  value?: string | React.ReactNode;
  detail?: string;
  chevron?: boolean;
  toggle?: boolean;
  onToggle?: (val: boolean) => void;
  destructive?: boolean;
  onClick?: () => void;
  last?: boolean;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className={`w-full flex items-center px-4 min-h-[44px] py-2.5 ${
        onClick ? "active:bg-gray-100 md:hover:bg-gray-50 transition-colors cursor-pointer" : ""
      } ${!last ? "border-b border-ios-separator/30" : ""}`}
    >
      {icon && (
        <div
          className={`w-[29px] h-[29px] rounded-[6.5px] flex items-center justify-center mr-3 text-white text-[15px] ${
            iconBg || "bg-ios-blue"
          }`}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 flex items-center justify-between min-w-0">
        <div className="flex-1 min-w-0">
          <span
            className={`text-[17px] ${
              destructive ? "text-ios-red" : "text-[#1c1c1e]"
            }`}
          >
            {label}
          </span>
          {detail && (
            <p className="text-[13px] text-ios-secondary mt-0.5 truncate">
              {detail}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {value && (
            <span className="text-[17px] text-ios-secondary">{value}</span>
          )}
          {toggle !== undefined && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle?.(!toggle);
              }}
              className={`relative w-[51px] h-[31px] rounded-full transition-colors duration-200 ${
                toggle ? "bg-ios-green" : "bg-gray-200"
              }`}
            >
              <div
                className={`absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-md transition-transform duration-200 ${
                  toggle ? "translate-x-[22px]" : "translate-x-[2px]"
                }`}
              />
            </button>
          )}
          {chevron && (
            <svg
              className="w-3.5 h-3.5 text-ios-separator"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

// iOS-style text field
export function IOSTextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  last = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center px-4 min-h-[44px] ${
        !last ? "border-b border-ios-separator/30" : ""
      }`}
    >
      <label className="text-[17px] text-[#1c1c1e] w-28 shrink-0">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-[17px] py-3 bg-transparent text-right placeholder:text-ios-secondary/50"
      />
    </div>
  );
}

// iOS-style button
export function IOSButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  loading = false,
  fullWidth = true,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "destructive";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}) {
  const base = "rounded-[12px] text-[17px] font-semibold py-3.5 px-6 transition-all duration-150 active:scale-[0.98]";
  const variants = {
    primary: "bg-ios-blue text-white disabled:opacity-40",
    secondary: "bg-ios-card text-ios-blue disabled:opacity-40",
    destructive: "bg-ios-red text-white disabled:opacity-40",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""}`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// iOS-style badge/chip
export function IOSBadge({
  children,
  color = "blue",
}: {
  children: React.ReactNode;
  color?: "blue" | "green" | "red" | "orange" | "gray";
}) {
  const colors = {
    blue: "bg-ios-blue/10 text-ios-blue",
    green: "bg-ios-green/10 text-ios-green",
    red: "bg-ios-red/10 text-ios-red",
    orange: "bg-ios-orange/10 text-ios-orange",
    gray: "bg-gray-100 text-ios-secondary",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[13px] font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}

// iOS-style modal/sheet
export function IOSSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Mobile: bottom sheet / Desktop: centered modal */}
      <div className="absolute bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-[90%] md:rounded-[14px] bg-ios-bg rounded-t-[14px] max-h-[90vh] overflow-auto animate-slide-up md:animate-fade-scale safe-bottom md:shadow-2xl">
        <div className="sticky top-0 bg-ios-bg/80 backdrop-blur-xl z-10">
          <div className="flex items-center justify-between p-4">
            <div className="w-16" />
            <h2 className="text-[17px] font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="w-16 text-right text-ios-blue text-[17px]"
            >
              Done
            </button>
          </div>
          <div className="h-px bg-ios-separator/30" />
        </div>
        <div className="p-4">{children}</div>
      </div>
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes fade-scale {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        @media (min-width: 768px) {
          .animate-fade-scale {
            animation: fade-scale 0.2s ease-out;
          }
          .animate-slide-up {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

// iOS-style empty state
export function IOSEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="text-5xl mb-4 text-ios-secondary/50">{icon}</div>
      <h3 className="text-[20px] font-semibold text-[#1c1c1e] mb-1">
        {title}
      </h3>
      <p className="text-[15px] text-ios-secondary mb-6">{description}</p>
      {action}
    </div>
  );
}

// iOS status indicator dot
export function StatusDot({ active }: { active: boolean }) {
  return (
    <div
      className={`w-2.5 h-2.5 rounded-full ${
        active ? "bg-ios-green" : "bg-ios-secondary/30"
      }`}
    />
  );
}
