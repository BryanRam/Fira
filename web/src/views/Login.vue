<template>
  <main class="login-page">
    <section class="login-card">
      <div class="logo-row">
        <div class="logo-grid" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="4" y="4" width="18" height="18" rx="5" fill="#1E40AF" />
            <rect x="26" y="4" width="18" height="18" rx="5" fill="#4F46E5" />
            <rect x="4" y="26" width="18" height="18" rx="5" fill="#6366F1" />
            <rect x="26" y="26" width="18" height="18" rx="5" fill="#1E3A8A" />
          </svg>
        </div>
        <div>
          <h1>JiraClone</h1>
          <p>Welcome back. Sign in with your LDAP credentials.</p>
        </div>
      </div>
      <form class="login-form" @submit.prevent="submitLogin">
        <label>Username<input v-model="username" type="text" placeholder="alex" autocomplete="username" /></label>
        <label>Password<input v-model="password" type="password" placeholder="••••••••" autocomplete="current-password" /></label>
        <button type="submit" :disabled="auth.loading">{{ auth.loading ? 'Signing In...' : 'Sign In' }}</button>
      </form>
      <p v-if="auth.error" class="error">{{ auth.error }}</p>
      <footer>Forgot password? · Help · Contact Admin</footer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const username = ref('alex');
const password = ref('demo');
async function submitLogin(): Promise<void> {
  await auth.login(username.value, password.value);
  await router.push('/dashboard');
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: grid; place-items: center; padding: 1.5rem; background: #eef0fb; }
.login-card { width: min(460px, 100%); padding: 2.25rem; border-radius: 1.6rem; background: #ffffff; box-shadow: 0 24px 64px rgba(30, 64, 175, 0.12); }
.logo-row { display: flex; gap: 1rem; align-items: center; margin-bottom: 2rem; }
.logo-grid { width: 56px; height: 56px; }
svg { width: 100%; height: 100%; }
h1 { margin: 0; font-size: 1.6rem; }
p { margin: 0.45rem 0 0; color: #64748b; }
.login-form { display: grid; gap: 1rem; }
label { display: grid; gap: 0.45rem; font-weight: 600; color: #334155; }
input { width: 100%; padding: 0.92rem 1rem; border: 1px solid #cbd5e1; border-radius: 0.95rem; font: inherit; }
button { margin-top: 0.35rem; padding: 0.98rem 1rem; border: none; border-radius: 0.95rem; background: #1e40af; color: #ffffff; font: inherit; font-weight: 700; cursor: pointer; }
button:disabled { opacity: 0.7; }
footer { margin-top: 1.5rem; text-align: center; color: #64748b; font-size: 0.9rem; }
.error { margin-top: 1rem; color: #dc2626; }
</style>
