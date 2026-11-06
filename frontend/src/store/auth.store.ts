import { create } from 'zustand';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
}

interface AuthState {
  token: string | null;
  user: UserSession | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: UserSession) => void;
  logout: () => void;
}

const LOCAL_STORAGE_TOKEN_KEY = 'alusdesk_token';
const LOCAL_STORAGE_USER_KEY = 'alusdesk_user';

const getStorageItem = (key: string): string | null => {
  if (typeof window !== 'undefined' && window.localStorage?.getItem) {
    return window.localStorage.getItem(key);
  }
  return null;
};

const setStorageItem = (key: string, value: string): void => {
  if (typeof window !== 'undefined' && window.localStorage?.setItem) {
    window.localStorage.setItem(key, value);
  }
};

const removeStorageItem = (key: string): void => {
  if (typeof window !== 'undefined' && window.localStorage?.removeItem) {
    window.localStorage.removeItem(key);
  }
};

export const useAuthStore = create<AuthState>((set) => {
  const storedToken = getStorageItem(LOCAL_STORAGE_TOKEN_KEY);
  const storedUserRaw = getStorageItem(LOCAL_STORAGE_USER_KEY);
  let initialUser: UserSession | null = null;
  if (storedUserRaw) {
    try {
      initialUser = JSON.parse(storedUserRaw);
    } catch {
      initialUser = null;
    }
  }

  return {
    token: storedToken,
    user: initialUser,
    isAuthenticated: Boolean(storedToken),

    setSession: (token: string, user: UserSession) => {
      setStorageItem(LOCAL_STORAGE_TOKEN_KEY, token);
      setStorageItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },

    logout: () => {
      removeStorageItem(LOCAL_STORAGE_TOKEN_KEY);
      removeStorageItem(LOCAL_STORAGE_USER_KEY);
      set({ token: null, user: null, isAuthenticated: false });
    },
  };
});
