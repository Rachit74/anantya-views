<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/config'

const router = useRouter()

const form = reactive({
  member_id: '',
  password: '',
})

const showPassword = ref(false)
const isSubmitting = ref(false)
const submitMessage = ref('')
const submitSuccess = ref(false)

const handleSubmit = async () => {
  isSubmitting.value = true
  submitMessage.value = ''
  submitSuccess.value = false
  try {
    const response = await api.post('/admin_login', { ...form })
    const { access_token, token_type } = response.data

    // Store token in localStorage for subsequent authenticated requests
    localStorage.setItem('admin_token', access_token)
    localStorage.setItem('token_type', token_type)

    submitSuccess.value = true
    submitMessage.value = 'Login successful! Redirecting to dashboard...'

    setTimeout(() => {
      router.push('/admin/dashboard')
    }, 1200)
  } catch (error) {
    submitMessage.value = error?.response?.data?.detail || 'Login failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main>
    <div class="card">

      <div class="card-header">
        <div class="header-top">
          <div class="logo-mark">
          <img src="/favicon.ico" alt="AF" />
        </div>
          <div>
            <h1>Anantya Foundation</h1>
            <p>Admin Portal</p>
          </div>
        </div>
        <div class="header-divider"></div>
        <p class="header-note">Authorised personnel only. Unauthorised access is prohibited.</p>
      </div>

      <form @submit.prevent="handleSubmit">

        <div class="section">
          <h2>Sign In</h2>

          <div class="field">
            <label>Member ID *</label>
            <input
              v-model="form.member_id"
              type="text"
              placeholder="e.g. MEM-00123"
              autocomplete="username"
              required
            />
          </div>

          <div class="field">
            <label>Password *</label>
            <div class="input-reveal">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Your admin password"
                autocomplete="current-password"
                required
              />
              <button type="button" class="reveal-btn" @click="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>
        </div>

        <div class="submit-area">
          <button type="submit" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="spinner"></span>
            {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
          </button>

          <p class="signup-link">Not yet an admin? <a href="/admin/signup">Register here →</a></p>

          <p v-if="submitMessage" class="message" :class="{ success: submitSuccess }">
            {{ submitMessage }}
          </p>
        </div>

      </form>

      <div class="card-footer">
        <span>🔒 Secured connection</span>
        <span>Anantya Foundation © {{ new Date().getFullYear() }}</span>
      </div>

    </div>
  </main>
</template>

<style scoped>
* { box-sizing: border-box; }

main {
  min-height: 100vh;
  background: #f0ede8;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 16px;
  font-family: sans-serif;
  font-size: 14px;
  color: #333;
}

.card {
  width: 100%;
  max-width: 440px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.14);
}

/* ── Header ── */
.card-header {
  background: #2c5f2e;
  padding: 28px 32px;
  color: white;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.logo-mark {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.logo-mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-header h1 { margin: 0 0 3px; font-size: 20px; font-weight: 600; }
.card-header p  { margin: 0; font-size: 13px; opacity: 0.75; }

.header-divider {
  height: 1px;
  background: rgba(255,255,255,0.18);
  margin-bottom: 14px;
}

.header-note {
  margin: 0;
  font-size: 12px;
  opacity: 0.75;
  line-height: 1.5;
}

/* ── Form body ── */
form { background: white; }

.section {
  padding: 28px 32px 20px;
}

h2 {
  margin: 0 0 20px;
  font-size: 15px;
  font-weight: 600;
  color: #2c5f2e;
}

.field { margin-bottom: 16px; }
.field:last-child { margin-bottom: 0; }
.field > label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #555;
}

/* ── Inputs ── */
input[type="text"],
input[type="password"] {
  width: 100%;
  height: 40px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  padding: 0 12px;
  font-size: 14px;
  font-family: inherit;
  color: #333;
  outline: none;
  transition: border-color 0.15s;
  background: white;
}

input:focus {
  border-color: #2c5f2e;
  border-bottom: 2px solid #2c5f2e;
}

/* ── Password reveal ── */
.input-reveal {
  position: relative;
  display: flex;
  align-items: center;
}

.input-reveal input {
  padding-right: 44px;
}

.reveal-btn {
  position: absolute;
  right: 0;
  top: 0;
  height: 40px;
  width: 40px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.reveal-btn:hover { opacity: 1; }

/* ── Submit area ── */
.submit-area {
  padding: 8px 32px 28px;
  background: white;
}

button[type="submit"] {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 4px;
  background: #2c5f2e;
  color: white;
  font-size: 15px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

button[type="submit"]:hover:not(:disabled) { background: #1e4520; }
button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.signup-link {
  margin: 14px 0 0;
  text-align: center;
  font-size: 13px;
  color: #888;
}

.signup-link a {
  color: #2c5f2e;
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover { text-decoration: underline; }

.message {
  margin: 12px 0 0;
  padding: 10px 14px;
  border-radius: 4px;
  font-size: 13px;
  background: #fdecea;
  color: #c0392b;
  border-left: 3px solid #c0392b;
  line-height: 1.5;
}

.message.success {
  background: #f4f9f4;
  color: #2c5f2e;
  border-left-color: #2c5f2e;
}

/* ── Footer ── */
.card-footer {
  background: #f7f7f7;
  border-top: 1px solid #ebebeb;
  padding: 12px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #aaa;
}

@media (max-width: 480px) {
  .section { padding: 20px 20px 16px; }
  .submit-area { padding: 8px 20px 24px; }
  .card-footer { padding: 12px 20px; }
}
</style>