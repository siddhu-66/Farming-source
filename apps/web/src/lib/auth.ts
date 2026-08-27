export const setToken = (token: string) => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state) {
        parsed.state.token = token;
        localStorage.setItem('auth-storage', JSON.stringify(parsed));
      }
    }
  } catch {
    // auth-storage not initialized yet
  }
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.token ?? null;
    }
  } catch {
    // parse error
  }
  return null;
};

export const removeToken = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};
