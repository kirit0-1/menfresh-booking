/**
 * config.js — Configuración centralizada de la app
 *
 * Un solo lugar para credenciales, horarios y feature flags.
 * Al escalar, este archivo puede leerse desde variables de entorno
 * o un endpoint /api/config en runtime.
 */

export const APP_CONFIG = {
  name: 'Menfresh',
  location: 'Barbería Menfresh, Melipilla, Chile',
  whatsapp: '56900000000',

  businessHours: {
    open: 10,
    close: 19,
    slotInterval: 15,
    closedDays: [0],
  },

  storage: {
    stateKey: 'menfresh_booking_state',
    stateVersion: 2,
    stateTtlMs: 30 * 60 * 1000,
    bookingsKey: 'menfresh_bookings',
  },

  features: {
    useMockAvailability: true,
    useEmailJS: true,
    useResendBackend: false,
    useQStashBackend: false,
  },

  emailjs: {
    serviceId: 'REEMPLAZAR_ESTO',
    templateClienteId: 'REEMPLAZAR_ESTO',
    templateBarberoId: 'REEMPLAZAR_ESTO',
    publicKey: 'REEMPLAZAR_ESTO',
  },

  api: {
    availability: '/api/availability',
    sendEmail: '/api/send-booking-email',
    scheduleReminder: '/api/schedule-reminder',
  },
};

export function isEmailConfigured() {
  const { emailjs, features } = APP_CONFIG;
  return features.useEmailJS
    && emailjs.publicKey !== 'REEMPLAZAR_ESTO'
    && emailjs.serviceId !== 'REEMPLAZAR_ESTO';
}
