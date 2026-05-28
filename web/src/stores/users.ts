import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getUserProfile, updateUserProfile, type UserProfile } from '../api';
import { useAuthStore } from './auth';

export const useUsersStore = defineStore('users', () => {
  const users = ref<Record<string, UserProfile>>({});

  async function fetchUser(userId: string): Promise<UserProfile> {
    const auth = useAuthStore();
    const user = await getUserProfile(userId, auth.accessToken);
    users.value[user.id] = user;
    return user;
  }

  async function updateProfile(userId: string, payload: Partial<UserProfile>): Promise<UserProfile> {
    const auth = useAuthStore();
    const user = await updateUserProfile(userId, payload, auth.accessToken);
    users.value[user.id] = user;
    if (auth.user?.id === user.id) auth.user = user;
    return user;
  }

  return { users, fetchUser, updateProfile };
});
