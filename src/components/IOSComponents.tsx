"use client";

import React, { useState } from "react";

/* ─── iOS 18 Navigation Bar ─── */
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
    <div className="sticky top-0 z-50 bg-ios-bg/80 backdrop-blur-xl border-b border-ios-separator/20">
      <div className="flex items-center justify-between px-4 h-[44px]">
        <div className="min-w-[70px] flex justify-start">{leftButton}</div>
        {!large && (
          <div className="flex-1 text-center mx-2 overflow-hidden">
            <h1 className="text-[17px] font-semibold leading-tight truncate">{title}</h1>
            {subtitle && (
              <p className="text-[11px] text-ios-secondary leading-tight">{subtitle}</p>
            )}
          </div>
        )}
        <div className="min-w-[70px] flex justify-end">{rightButton}</div>
      </div>
      {large && (
        <div className="px-4 pb-3 border-t-0">
          <h1 className="text-[34px] font-bold tracking-[-0.4px] leading-[41px]">{title}</h1>
          {subtitle && (
            <p className="text-[15px] text-ios-secondary mt-1">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── iOS Settings Grouped Section ─── */
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
    <div className="mb-[35px]">
      {header && (
        <div className="px-[20px] pb-[7px]">
          <h3 className="text-[13px] font-normal text-ios-secondary uppercase tracking-[-0.08px]">
            {header}
          </h3>
        </div>
      )}
      <div className="mx-[16px] bg-ios-card rounded-[10px] overflow-hidden shadow-[0_0_0_0.5px_rgba(0,0,0,0.04)]">
        {children}
      </div>
      {footer && (
        <div className="px-[20px] pt-[7px]">
          <p className="text-[13px] text-ios-secondary leading-[18px]">{footer}</p>
        </div>
      )}
    </div>
  );
}

/* ─── iOS Settings Row ─── */
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
      className={`w-full flex items-center min-h-[44px] text-left ${
        onClick ? "active:bg-[#d1d1d6]/40 md:hover:bg-[#d1d1d6]/20 transition-colors duration-100 cursor-pointer" : ""
      }`}
    >
      {/* Left padding or icon area */}
      {icon && (
        <div className="pl-[16px] pr-[12px] py-[8px] flex items-center self-stretch">
          <div
            className={`w-[29px] h-[29px] rounded-[6px] flex items-center justify-center text-white ${
              iconBg || "bg-ios-blue"
            }`}
          >
            {icon}
          </div>
        </div>
      )}
      {/* Content area with separator */}
      <div
        className={`flex-1 flex items-center min-w-0 pr-[16px] py-[11px] min-h-[44px] ${
          !icon ? "pl-[16px]" : ""
        } ${!last ? "border-b border-[#c6c6c8]/36" : ""}`}
      >
        <div className="flex-1 min-w-0">
          <span
            className={`text-[17px] leading-[22px] block ${
              destructive ? "text-ios-red" : "text-[#1c1c1e]"
            }`}
          >
            {label}
          </span>
          {detail && (
            <span className="text-[13px] leading-[18px] text-ios-secondary block mt-[2px]">
              {detail}
            </span>
          )}
        </div>
        <div className="flex items-center gap-[6px] ml-[8px] shrink-0">
          {value && (
            <span className="text-[17px] leading-[22px] text-ios-secondary">{value}</span>
          )}
          {toggle !== undefined && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle?.(!toggle);
              }}
              className={`relative w-[51px] h-[31px] rounded-full transition-colors duration-300 ${
                toggle ? "bg-ios-green" : "bg-[#e9e9ea]"
              }`}
            >
              <div
                className={`absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.06)] transition-transform duration-300 ${
                  toggle ? "translate-x-[22px]" : "translate-x-[2px]"
                }`}
              />
            </button>
          )}
          {chevron && (
            <svg
              className="w-[7px] h-[13px] text-[#c7c7cc]"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              viewBox="0 0 8 14"
            >
              <path d="M1 1l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

/* ─── iOS Text Field ─── */
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
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div
      className={`flex items-center min-h-[44px]`}
    >
      <label className="text-[17px] leading-[22px] text-[#1c1c1e] w-[100px] shrink-0 pl-[16px]">
        {label}
      </label>
      <div className={`flex-1 flex items-center pr-[16px] ${!last ? "border-b border-[#c6c6c8]/36" : ""}`}>
        <input
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-[17px] leading-[22px] py-[11px] bg-transparent placeholder:text-[#c7c7cc] outline-none"
        />
        {isPassword && value && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2 text-ios-secondary shrink-0"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── iOS Button (like system buttons) ─── */
export function IOSButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  loading = false,
  fullWidth = true,
  size = "large",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "destructive";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: "large" | "small";
}) {
  const sizeClass = size === "large" ? "py-[14px] px-[20px] text-[17px]" : "py-[8px] px-[16px] text-[15px]";
  const variants = {
    primary: "bg-ios-blue text-white active:bg-[#0062cc] disabled:opacity-35",
    secondary: "bg-ios-blue/10 text-ios-blue active:bg-ios-blue/20 disabled:opacity-35",
    destructive: "bg-ios-red text-white active:bg-[#d63027] disabled:opacity-35",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`rounded-[14px] font-semibold leading-[22px] transition-all duration-100 ${sizeClass} ${variants[variant]} ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-[8px]">
          <div className="w-[20px] h-[20px] border-[2.5px] border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </button>
  );
}

/* ─── iOS Badge/Chip ─── */
export function IOSBadge({
  children,
  color = "blue",
}: {
  children: React.ReactNode;
  color?: "blue" | "green" | "red" | "orange" | "gray";
}) {
  const colors = {
    blue: "bg-ios-blue/12 text-ios-blue",
    green: "bg-ios-green/12 text-ios-green",
    red: "bg-ios-red/12 text-ios-red",
    orange: "bg-ios-orange/12 text-ios-orange",
    gray: "bg-[#e5e5ea] text-ios-secondary",
  };
  return (
    <span
      className={`inline-flex items-center px-[8px] py-[3px] rounded-full text-[12px] font-semibold leading-[16px] ${colors[color]}`}
    >
      {children}
    </span>
  );
}

/* ─── iOS Sheet / Modal ─── */
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-ios-fade-in"
        onClick={onClose}
      />

      {/* Mobile: bottom sheet */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 animate-ios-slide-up">
        <div className="bg-ios-bg rounded-t-[14px] max-h-[85vh] overflow-auto safe-bottom">
          {/* Handle bar */}
          <div className="flex justify-center pt-[6px] pb-[2px]">
            <div className="w-[36px] h-[5px] rounded-full bg-[#c7c7cc]" />
          </div>
          <div className="flex items-center justify-between px-[16px] py-[8px]">
            <button
              onClick={onClose}
              className="text-ios-blue text-[17px] min-w-[60px]"
            >
              Cancel
            </button>
            <h2 className="text-[17px] font-semibold flex-1 text-center">{title}</h2>
            <div className="min-w-[60px]" />
          </div>
          <div className="h-[0.5px] bg-[#c6c6c8]/50" />
          <div className="px-0 py-[16px]">{children}</div>
        </div>
      </div>

      {/* Desktop: centered modal */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(480px,90vw)] animate-ios-scale-in">
        <div className="bg-ios-bg rounded-[14px] max-h-[85vh] overflow-auto shadow-[0_25px_50px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between px-[16px] py-[12px] border-b border-[#c6c6c8]/30">
            <button
              onClick={onClose}
              className="text-ios-blue text-[17px] min-w-[60px]"
            >
              Cancel
            </button>
            <h2 className="text-[17px] font-semibold flex-1 text-center">{title}</h2>
            <div className="min-w-[60px]" />
          </div>
          <div className="px-0 py-[16px]">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── iOS Empty State ─── */
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
    <div className="flex flex-col items-center justify-center py-[60px] px-[32px] text-center">
      <div className="mb-[16px] text-ios-secondary/40">{icon}</div>
      <h3 className="text-[20px] font-semibold text-[#1c1c1e] mb-[4px] leading-[25px]">
        {title}
      </h3>
      <p className="text-[15px] text-ios-secondary leading-[20px] mb-[20px] max-w-[280px]">
        {description}
      </p>
      {action}
    </div>
  );
}

/* ─── iOS Status Indicator ─── */
export function StatusDot({ active }: { active: boolean }) {
  return (
    <div className="relative">
      <div
        className={`w-[10px] h-[10px] rounded-full ${
          active ? "bg-ios-green" : "bg-[#d1d1d6]"
        }`}
      />
      {active && (
        <div className="absolute inset-0 w-[10px] h-[10px] rounded-full bg-ios-green animate-ping opacity-40" />
      )}
    </div>
  );
}
