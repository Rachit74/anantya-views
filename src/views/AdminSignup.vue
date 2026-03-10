<script setup>
import axios from 'axios'
import { reactive, ref, watch } from 'vue'

const BASE_URL = 'https://anantya-api.onrender.com'

const form = reactive({
  member_id: '',
  admin_signup_key: '',
  password: '',
  confirm_password: '',
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showKey = ref(false)
const isSubmitting = ref(false)
const submitMessage = ref('')
const submitSuccess = ref(false)
const passwordError = ref('')

watch(() => form.confirm_password, (val) => {
  if (val && form.password && val !== form.password) {
    passwordError.value = 'Passwords do not match.'
  } else {
    passwordError.value = ''
  }
})

watch(() => form.password, (val) => {
  if (form.confirm_password && val !== form.confirm_password) {
    passwordError.value = 'Passwords do not match.'
  } else {
    passwordError.value = ''
  }
})

const handleSubmit = async () => {
  if (passwordError.value) return
  isSubmitting.value = true
  submitMessage.value = ''
  submitSuccess.value = false
  try {
    const response = await axios.post(`${BASE_URL}/admin_signup`, { ...form })
    submitSuccess.value = true
    submitMessage.value = `Admin registered successfully! Your Admin ID: ${response.data.admin_id}`
  } catch (error) {
    submitMessage.value = error?.response?.data?.detail || error.message
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
            <p>Admin Registration</p>
          </div>
        </div>
        <div class="header-divider"></div>
        <p class="header-note">Restricted access. You must be an existing member to register as an admin.</p>
      </div>

      <form @submit.prevent="handleSubmit">

        <div class="section">
          <h2>Identity Verification</h2>

          <div class="field">
            <label>Member ID *</label>
            <input
              v-model="form.member_id"
              type="text"
              placeholder="e.g. MEM-00123"
              required
            />
            <p class="field-note">🪪 Your Member ID was sent to your email upon volunteer onboarding.</p>
          </div>

          <div class="field">
            <label>Admin Signup Key *</label>
            <div class="input-reveal">
              <input
                v-model="form.admin_signup_key"
                :type="showKey ? 'text' : 'password'"
                placeholder="Enter the secret signup key"
                required
              />
              <button type="button" class="reveal-btn" @click="showKey = !showKey">
                {{ showKey ? '🙈' : '👁️' }}
              </button>
            </div>
            <p class="field-note">🔑 This key is provided by the Anantya Foundation core team.</p>
          </div>
        </div>

        <div class="section">
          <h2>Set Password</h2>

          <div class="field">
            <label>Password *</label>
            <div class="input-reveal">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Create a strong password"
                required
              />
              <button type="button" class="reveal-btn" @click="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div class="field">
            <label>Confirm Password *</label>
            <div class="input-reveal">
              <input
                v-model="form.confirm_password"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Re-enter your password"
                required
              />
              <button type="button" class="reveal-btn" @click="showConfirmPassword = !showConfirmPassword">
                {{ showConfirmPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <p v-if="passwordError" class="field-error">{{ passwordError }}</p>
          </div>
        </div>

        <div class="section acknowledgement-section">
          <p class="ack-text">
            By registering, you confirm you are an authorised member of the Anantya Foundation and accept the responsibilities of admin access.
          </p>
        </div>

        <div class="submit-area">
          <button type="submit" :disabled="isSubmitting || !!passwordError">
            {{ isSubmitting ? 'Registering...' : 'Register as Admin' }}
          </button>
          <p class="login-link">Already an admin? <a href="/admin/login">Sign in here →</a></p>
          <p v-if="submitMessage" class="message" :class="{ success: submitSuccess }">
            {{ submitMessage }}
          </p>
        </div>

      </form>
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
  padding: 40px 16px 80px;
  font-family: sans-serif;
  font-size: 14px;
  color: #333;
}

.card {
  width: 100%;
  max-width: 520px;
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
  opacity: 0.8;
  line-height: 1.5;
}

/* ── Form body ── */
form { background: white; }

.section {
  padding: 24px 32px;
  border-bottom: 8px solid #f0ede8;
}

h2 {
  margin: 0 0 18px;
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

.field-note {
  margin: 6px 0 0;
  font-size: 12px;
  color: #5a7a5c;
  background: #f0f7f0;
  border-left: 3px solid #2c5f2e;
  padding: 7px 10px;
  border-radius: 0 4px 4px 0;
  line-height: 1.5;
}

.field-error {
  margin: 6px 0 0;
  font-size: 12px;
  color: #b94a3a;
  background: #fdf1ef;
  border-left: 3px solid #b94a3a;
  padding: 7px 10px;
  border-radius: 0 4px 4px 0;
  line-height: 1.5;
}

/* ── Inputs ── */
input[type="text"],
input[type="password"],
input[type="email"] {
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

/* ── Acknowledgement ── */
.acknowledgement-section { border-bottom: none; padding-bottom: 0; }

.ack-text {
  margin: 0;
  font-size: 12px;
  color: #777;
  line-height: 1.6;
  padding: 12px 14px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 4px;
}

/* ── Submit area ── */
.submit-area {
  padding: 20px 32px 28px;
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
}

button[type="submit"]:hover:not(:disabled) { background: #1e4520; }
button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }

.login-link {
  margin: 12px 0 0;
  text-align: center;
  font-size: 13px;
  color: #888;
}

.login-link a {
  color: #2c5f2e;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover { text-decoration: underline; }

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

@media (max-width: 480px) {
  .section { padding: 20px; }
  .submit-area { padding: 20px; }
}
</style>