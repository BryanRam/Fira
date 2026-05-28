<template>
  <main class="login-page">
    <div class="login-center">
      <div class="logo-row">
        <svg class="logo-icon" viewBox="0 0 48 48" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#1e40af"/>
          <rect x="26" y="2" width="20" height="20" rx="4" fill="#1e40af"/>
          <rect x="2" y="26" width="20" height="20" rx="4" fill="#1e40af"/>
          <rect x="26" y="26" width="20" height="20" rx="4" fill="#1e40af"/>
        </svg>
        <h1>JiraClone</h1>
      </div>
      <p class="subtitle">Welcome back. Sign in with your LDAP credentials.</p>

      <section class="login-card">
        <form @submit.prevent="submitLogin">
          <div class="field">
            <label for="username">Username</label>
            <input id="username" v-model="username" type="text" placeholder="Enter username" autocomplete="username" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" v-model="password" type="password" placeholder="Enter password" autocomplete="current-password" />
          </div>
          <button type="submit" :disabled="auth.loading">{{ auth.loading ? 'Signing In…' : 'Sign In' }}</button>
        </form>
        <p v-if="auth.error" class="error-msg">{{ auth.error }}</p>
      </section>

      <footer class="footer-links">
        <a href="#">Forgot password?</a>
        <span>•</span>
        <a href="#">Help</a>
        <span>•</span>
        <a href="#">Contact Admin</a>
      </footer>
    </div>
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
  try {
    await auth.login(username.value, password.value);
    await router.push('/dashboard');
  } catch {
    // error is shown via auth.error
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef0fb;
  padding: 1.5rem;
}
.login-center { width: min(420px, 100%); display: flex; flex-direction: column; align-items: center; }

.logo-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.65rem; }
.logo-icon { width: 44px; height: 44px; }
h1 { margin: 0; font-size: 1.65rem; font-weight: 800; color: #1e40af; }
.subtitle { margin: 0 0 1.75rem; color: #4b5563; font-size: 0.95rem; text-align: center; }

.login-card {
  width: 100%;
  background: #fafafa;
  border: 1px solid #c7d2e0;
  border-radius: 10px;
  padding: 1.75rem;
}
.field { margin-bottom: 1rem; }
.field label { display: block; margin-bottom: 0.4rem; font-size: 0.9rem; font-weight: 500; color: #1e293b; }
.field input {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font: inherit;
  font-size: 0.9rem;
  color: #1e293b;
  background: #ffffff;
  outline: none;
  box-sizing: border-box;
}
.field input::placeholder { color: #94a3b8; }
.field input:focus { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.25); }
button[type="submit"] {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.8rem;
  border: none;
  border-radius: 6px;
  background: #1e40af;
  color: #ffffff;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
button[type="submit"]:hover { background: #1d3a9e; }
button[type="submit"]:disabled { opacity: 0.7; cursor: default; }

.error-msg { margin: 0.9rem 0 0; text-align: center; color: #dc2626; font-size: 0.88rem; }

.footer-links {
  margin-top: 1.5rem;
  display: flex;
  gap: 0.6rem;
  align-items: center;
  color: #64748b;
  font-size: 0.88rem;
}
.footer-links a { color: #475569; text-decoration: none; }
.footer-links a:hover { color: #1e40af; }
.footer-links span { color: #94a3b8; }
</style>
