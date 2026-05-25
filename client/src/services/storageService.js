const USER_KEY = 'examapp_current_user';

export const storageService = {
  saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  clearUser() {
    localStorage.removeItem(USER_KEY);
  },
};