/**
 * availability.js — Motor de disponibilidad con detección de solapamiento
 *
 * Exporta:
 *   generateTimeSlots() — Grilla base de horarios
 *   fetchBookings(barberoId, fecha) — Reservas existentes
 *   getAvailableSlots(barberoId, fecha, durationMin) — Slots libres
 *   saveBooking(booking) — Persiste reserva (mock local / API)
 *
 * Corrige el bug del prototipo: slots fijos de 45 min sin importar el servicio.
 */

import { APP_CONFIG } from './config.js';
import { BARBERS, getRealBarberIds } from './data.js';
import { parseTime, formatTime } from './utils.js';

const { bookingsKey } = APP_CONFIG.storage;
const { open, close, slotInterval } = APP_CONFIG.businessHours;

/** Grilla base cada 15 min (mínimo común de 15, 30 y 45 min) */
export function generateTimeSlots() {
  const slots = [];
  const start = open * 60;
  const end = close * 60;

  for (let t = start; t < end; t += slotInterval) {
    slots.push(formatTime(t));
  }
  return slots;
}

export const ALL_SLOTS = generateTimeSlots();

function rangesOverlap(aStart, aDur, bStart, bDur) {
  const aEnd = aStart + aDur;
  const bEnd = bStart + bDur;
  return aStart < bEnd && bStart < aEnd;
}

function fitsBusinessHours(slotStart, durationMin) {
  const end = slotStart + durationMin;
  return slotStart >= open * 60 && end <= close * 60;
}

function getLocalBookings() {
  try {
    return JSON.parse(localStorage.getItem(bookingsKey) ?? '[]');
  } catch {
    return [];
  }
}

function setLocalBookings(bookings) {
  localStorage.setItem(bookingsKey, JSON.stringify(bookings));
}

/** Reservas mock iniciales para demostración */
const SEED_BOOKINGS = [
  { barberId: 'nicolas', fecha: '2026-07-03', time: '10:00', duration: 45 },
  { barberId: 'carlos', fecha: '2026-07-03', time: '10:00', duration: 30 },
];

function ensureSeedData() {
  if (!localStorage.getItem(bookingsKey)) {
    setLocalBookings(SEED_BOOKINGS);
  }
}

/**
 * @returns {Promise<Array<{barberId, fecha, time, duration}>>}
 */
export async function fetchBookings(barberoId, fecha) {
  ensureSeedData();

  if (!APP_CONFIG.features.useMockAvailability) {
    try {
      const res = await fetch(
        `${APP_CONFIG.api.availability}?barbero=${barberoId}&fecha=${fecha}&detail=bookings`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.bookings ?? [];
    } catch (err) {
      console.error('[availability] Error API:', err);
      return [];
    }
  }

  const all = getLocalBookings();
  const realIds = barberoId === 'any' ? getRealBarberIds() : [barberoId];
  return all.filter((b) => b.fecha === fecha && realIds.includes(b.barberId));
}

/**
 * Slots donde cabe el servicio completo sin solaparse.
 */
export async function getAvailableSlots(barberoId, fecha, durationMin) {
  if (barberoId === 'any') {
    const realIds = getRealBarberIds();
    const available = await Promise.all(
      realIds.map((id) => getAvailableSlotsForBarber(id, fecha, durationMin)),
    );
    const union = new Set(available.flat());
    return ALL_SLOTS.filter((s) => union.has(s)).sort();
  }
  return getAvailableSlotsForBarber(barberoId, fecha, durationMin);
}

async function getAvailableSlotsForBarber(barberoId, fecha, durationMin) {
  const bookings = await fetchBookings(barberoId, fecha);

  return ALL_SLOTS.filter((slot) => {
    const slotStart = parseTime(slot);
    if (!fitsBusinessHours(slotStart, durationMin)) return false;

    return !bookings.some((b) => {
      if (b.barberId !== barberoId && barberoId !== 'any') return false;
      return rangesOverlap(slotStart, durationMin, parseTime(b.time), b.duration);
    });
  });
}

/**
 * Slots ocupados (inicio) para compatibilidad con API simple.
 */
export async function fetchTakenSlots(barberoId, fecha, durationMin) {
  const available = new Set(await getAvailableSlots(barberoId, fecha, durationMin));
  return ALL_SLOTS.filter((s) => !available.has(s));
}

/**
 * Persiste la reserva. En mock, guarda en localStorage y bloquea slots reales.
 */
export async function saveBooking(booking) {
  const assignedBarberId = booking.barberId === 'any'
    ? await pickAvailableBarber(booking.fecha, booking.time, booking.duration)
    : booking.barberId;

  const record = { ...booking, barberId: assignedBarberId };

  if (!APP_CONFIG.features.useMockAvailability) {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error(`Error al guardar reserva: HTTP ${res.status}`);
    return record;
  }

  const all = getLocalBookings();
  all.push(record);
  setLocalBookings(all);
  return record;
}

async function pickAvailableBarber(fecha, time, duration) {
  const realIds = getRealBarberIds();
  for (const id of realIds) {
    const available = await getAvailableSlotsForBarber(id, fecha, duration);
    if (available.includes(time)) return id;
  }
  throw new Error('No hay barbero disponible en ese horario');
}

export function getBarberNameById(id) {
  return BARBERS.find((b) => b.id === id)?.name ?? id;
}
