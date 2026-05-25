export const loggerService = {
  info(message, data = null) {
    console.log(`[INFO] ${message}`, data);
  },

  warning(message, data = null) {
    console.warn(`[WARNING] ${message}`, data);
  },

  error(message, data = null) {
    console.error(`[ERROR] ${message}`, data);
  },
};