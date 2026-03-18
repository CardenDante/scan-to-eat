import { prisma } from "@/lib/db";

type CachedQRCode = { id: string; eventId: string; label: string };
type CachedMealSlot = { id: string; name: string; eventId: string };

// In-memory caches — avoid repeated DB lookups for data that rarely changes
const qrCodeCache = new Map<string, CachedQRCode>(); // key: "code:eventId"
const activeMealCache = new Map<string, { slot: CachedMealSlot; cachedAt: number }>(); // key: eventId

const MEAL_CACHE_TTL = 5_000; // 5 seconds — short enough to catch meal slot toggles

export async function lookupQRCode(code: string, eventId: string): Promise<CachedQRCode | null> {
  const key = `${code}:${eventId}`;
  const cached = qrCodeCache.get(key);
  if (cached) return cached;

  const qr = await prisma.qRCode.findFirst({
    where: { code, eventId },
    select: { id: true, eventId: true, label: true },
  });

  if (qr) {
    qrCodeCache.set(key, qr);
  }
  return qr;
}

export async function lookupActiveMeal(eventId: string): Promise<CachedMealSlot | null> {
  const cached = activeMealCache.get(eventId);
  if (cached && Date.now() - cached.cachedAt < MEAL_CACHE_TTL) {
    return cached.slot;
  }

  const slot = await prisma.mealSlot.findFirst({
    where: { eventId, isActive: true },
    select: { id: true, name: true, eventId: true },
  });

  if (slot) {
    activeMealCache.set(eventId, { slot, cachedAt: Date.now() });
  } else {
    activeMealCache.delete(eventId);
  }
  return slot;
}

export function invalidateMealCache(eventId: string) {
  activeMealCache.delete(eventId);
}

export function preloadQRCodes(eventId: string) {
  // Fire and forget — warm up cache in background
  prisma.qRCode.findMany({
    where: { eventId },
    select: { id: true, eventId: true, code: true, label: true },
  }).then((codes) => {
    for (const qr of codes) {
      qrCodeCache.set(`${qr.code}:${qr.eventId}`, { id: qr.id, eventId: qr.eventId, label: qr.label });
    }
  }).catch(() => {});
}
