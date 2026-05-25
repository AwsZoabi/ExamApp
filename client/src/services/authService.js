import { mockDb } from '../api/mockDb';
import { storageService } from './storageService';
import { loggerService } from './loggerService';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async login(email, password) {
    await delay(500);

    const user = mockDb.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      loggerService.warning('Login failed', { email });
      throw new Error('Invalid email or password');
    }

    const safeUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };

    storageService.saveUser(safeUser);
    loggerService.info('User logged in', safeUser);

    return safeUser;
  },

  async register(fullName, email, password, role) {
    await delay(500);

    const exists = mockDb.users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (exists) {
      throw new Error('Email already exists');
    }

    const newUser = {
      id: Date.now(),
      fullName,
      email,
      password,
      role,
    };

    mockDb.users.push(newUser);

    const safeUser = {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
    };

    storageService.saveUser(safeUser);
    loggerService.info('User registered', safeUser);

    return safeUser;
  },

  logout() {
    storageService.clearUser();
    loggerService.info('User logged out');
  },

  getCurrentUser() {
    return storageService.getUser();
  },
};