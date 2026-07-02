/**
 * data.js — Catálogo de servicios, barberos y métodos de pago
 *
 * Los IDs son strings para escalar sin colisiones al sincronizar con backend.
 * El email del barbero vive en el mismo objeto (no en un mapa aparte).
 */

export const SERVICES = [
  {
    id: 'combo-full',
    name: 'Todo corte de cabello + arreglo de barba',
    desc: 'Líneas y arreglo de cejas gratis',
    price: 18000,
    dur: 45,
    icon: 'combo-full',
    featured: true,
  },
  {
    id: 'corte',
    name: 'Todo corte de cabello',
    desc: 'Líneas y arreglo de cejas gratis',
    price: 12000,
    dur: 30,
    icon: 'corte',
  },
  {
    id: 'barba',
    name: 'Arreglo de barba',
    desc: 'Perfilado, rebaje y estructura',
    price: 7000,
    dur: 15,
    icon: 'barba',
  },
];

export const BARBERS = [
  {
    id: 'nicolas',
    name: 'Nicolás C.',
    tag: 'Fundador · 10 años',
    color: '#C5622D',
    letter: 'N',
    email: 'nicolas@menfresh.cl',
    isAssignable: true,
  },
  {
    id: 'carlos',
    name: 'Carlos M.',
    tag: 'Especialista en fades',
    color: '#5B7B8C',
    letter: 'C',
    email: 'carlos@menfresh.cl',
    isAssignable: true,
  },
  {
    id: 'any',
    name: 'Sin preferencia',
    tag: 'Primer disponible',
    color: '#A67C3D',
    letter: '✦',
    email: 'reservas@menfresh.cl',
    isAssignable: false,
  },
];

export const PAYMENT_METHODS = [
  { id: 'efectivo', name: 'Efectivo', desc: 'Pagas al llegar al local', icon: 'cash' },
  { id: 'transferencia', name: 'Transferencia', desc: 'Te enviamos los datos por correo', icon: 'transfer' },
  { id: 'tarjeta', name: 'Tarjeta', desc: 'Débito o crédito en el local', icon: 'card' },
];

export function getRealBarberIds() {
  return BARBERS.filter((b) => b.isAssignable).map((b) => b.id);
}

export function getBarberEmail(barberId) {
  return BARBERS.find((b) => b.id === barberId)?.email ?? 'reservas@menfresh.cl';
}

export function findServiceById(id) {
  return SERVICES.find((s) => s.id === id) ?? null;
}

export function findBarberById(id) {
  return BARBERS.find((b) => b.id === id) ?? null;
}

export function findPaymentById(id) {
  return PAYMENT_METHODS.find((p) => p.id === id) ?? null;
}
