const keys = Object.freeze({
  token: 'examapp.auth.token',
  user: 'examapp.auth.user',
  mockDatabase: 'examapp.mock.database.v1',
});

function readJson(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storageService = {
  keys,

  getToken() {
    return localStorage.getItem(keys.token);
  },

  getUser() {
    return readJson(keys.user);
  },

  saveSession({ token, user }) {
    if (token) localStorage.setItem(keys.token, token);
    else localStorage.removeItem(keys.token);
    writeJson(keys.user, user);
  },

  clearSession() {
    localStorage.removeItem(keys.token);
    localStorage.removeItem(keys.user);
  },

  getMockDatabase() {
    return readJson(keys.mockDatabase);
  },

  saveMockDatabase(database) {
    writeJson(keys.mockDatabase, database);
  },

  clearMockDatabase() {
    localStorage.removeItem(keys.mockDatabase);
  },
};
