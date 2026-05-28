import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { login as loginRequest, refreshToken as refreshTokenRequest, type UserProfile, useMockData } from '../api';

const ACCESS_TOKEN_KEY = 'fira_access_token';
const REFRESH_TOKEN_KEY = 'fira_refresh_token';
const USER_KEY = 'fira_user';

function readStoredUser(): UserProfile | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(readStoredUser());
  const accessToken = ref(localStorage.getItem(ACCESS_TOKEN_KEY) ?? '');
  const refreshToken = ref(localStorage.getItem(REFRESH_TOKEN_KEY) ?? '');
  const loading = ref(false);
  const error = ref('');
  const isAuthenticated = computed(() => Boolean(accessToken.value));

  function persist(): void {
    if (user.value) localStorage.setItem(USER_KEY, JSON.stringify(user.value));
    else localStorage.removeItem(USER_KEY);
    if (accessToken.value) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken.value);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
    if (refreshToken.value) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken.value);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  async function login(username: string, password: string): Promise<void> {
    loading.value = true;
    error.value = '';
    try {
      const response = await loginRequest(username, password);
      user.value = response.user;
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;
      persist();
    } catch (issue) {
      error.value = issue instanceof Error ? issue.message : 'Unable to sign in.';
      throw issue;
    } finally {
      loading.value = false;
    }
  }

  async function refresh(): Promise<void> {
    if (useMockData) {
      persist();
      return;
    }
    if (!refreshToken.value) {
      logout();
      return;
    }
    const response = await refreshTokenRequest(refreshToken.value);
    accessToken.value = response.accessToken;
    refreshToken.value = response.refreshToken;
    persist();
  }

  function logout(): void {
    user.value = null;
    accessToken.value = '';
    refreshToken.value = '';
    error.value = '';
    persist();
  }

  return { user, accessToken, refreshToken, loading, error, isAuthenticated, useMockData, login, refresh, logout };
});
