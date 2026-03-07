<script setup>
import axios from 'axios'
import { reactive, ref, watch } from 'vue'

const BASE_URL = 'https://anantya-api.onrender.com'

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const form = reactive({
  email: '',
  fullname: '',
  age: null,
  dob: '',
  gender: '',
  location: '',
  phone_number: '',
  profession: '',
  place_of_profession: '',
  department: [],
  volunteered_before: '',
  acknowledgement: false,
  can_attend_events: false,
  government_id_picture: '',
  member_picture: '',
})

const govIdFile = ref(null)
const memberPicFile = ref(null)
const govIdUploading = ref(false)
const memberPicUploading = ref(false)
const govIdDone = ref(false)
const memberPicDone = ref(false)

const ageError = ref('')

const departmentOptions = [
  'People & Culture',
  'Events & Fundraising',
  'Programs & Field Team',
  'Media & Content',
  'Finance & Compliance',
  'Outreach & Partnerships',
  'Strategy & Projects',
  'Mental Wellbeing',
  'Tech',
]

const isSubmitting = ref(false)
const submitMessage = ref('')
const submitSuccess = ref(false)

const toggleDepartment = (dept) => {
  const idx = form.department.indexOf(dept)
  if (idx === -1) form.department.push(dept)
  else form.department.splice(idx, 1)
}

watch(() => form.dob, (dob) => {
  ageError.value = ''
  if (!dob) { form.age = null; return }
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  const notHadBirthdayYet =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  if (notHadBirthdayYet) age--
  form.age = age
  if (age < 16) ageError.value = 'You must be at least 16 years old to volunteer.'
})

const uploadToCloudinary = async (file, formField, uploading, done) => {
  uploading.value = true
  done.value = false
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    const { data } = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      formData
    )
    form[formField] = data.secure_url
    done.value = true
  } catch (err) {
    alert(`Upload failed: ${err.message}`)
  } finally {
    uploading.value = false
  }
}

const handleGovIdChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  govIdFile.value = file
  uploadToCloudinary(file, 'government_id_picture', govIdUploading, govIdDone)
}

const handleMemberPicChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  memberPicFile.value = file
  uploadToCloudinary(file, 'member_picture', memberPicUploading, memberPicDone)
}

const handleSubmit = async () => {
  if (ageError.value) return
  if (!govIdDone.value || !memberPicDone.value) {
    submitMessage.value = 'Please wait for file uploads to finish.'
    return
  }
  isSubmitting.value = true
  submitMessage.value = ''
  submitSuccess.value = false
  try {
    const response = await axios.post(`${BASE_URL}/onboard`, {
      ...form,
      age: Number(form.age),
    })

    // Debug: log the backend response
    console.log('Backend response:', response.data)

    // Send confirmation email with member_id from backend response
    // Use fullname from response if available, otherwise from form
    const member_id = response.data.member_id
    const fullname = response.data.fullname || form.fullname

    if (!member_id) {
      console.error('No member_id in response:', response.data)
    }

    try {
      await axios.post('/api/send-email', {
        email: form.email,
        fullname: fullname,
        member_id: member_id,
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the whole submission if email fails
    }

    submitSuccess.value = true
    submitMessage.value = 'Submitted successfully. Welcome to Anantya Foundation!'
  } catch (error) {
    submitMessage.value = `Submission failed: ${error?.response?.data?.detail || error.message}`
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main>
    <div class="card">

      <div class="card-header">
        <h1>Anantya Foundation</h1>
        <p>Volunteer Onboarding Form</p>
      </div>

      <form @submit.prevent="handleSubmit">

        <div class="section">
          <h2>Personal Information</h2>

          <div class="field">
            <label>Full Name *</label>
            <input v-model="form.fullname" type="text" placeholder="Your full name" required />
          </div>

          <div class="field">
            <label>Email Address *</label>
            <input v-model="form.email" type="email" placeholder="you@example.com" required />
            <p class="field-note">📬 A confirmation email with your Member ID will be sent within 5–10 minutes of successful onboarding.</p>
          </div>

          <div class="row">
            <div class="field">
              <label>Date of Birth *</label>
              <input v-model="form.dob" type="date" required />
              <p v-if="ageError" class="field-error">{{ ageError }}</p>
            </div>
            <div class="field">
              <label>Age *</label>
              <input v-model.number="form.age" type="number" placeholder="Auto-calculated" readonly />
            </div>
          </div>

          <div class="field">
            <label>Gender *</label>
            <select v-model="form.gender" required>
              <option value="" disabled>Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Non-binary</option>
              <option>Prefer not to say</option>
            </select>
          </div>

          <div class="field">
            <label>Location *</label>
            <input v-model="form.location" type="text" placeholder="City, State" required />
          </div>

          <div class="field">
            <label>Phone Number *</label>
            <input
              v-model="form.phone_number"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              placeholder="9876543210"
              @input="form.phone_number = form.phone_number.replace(/\D/g, '')"
              required
            />
          </div>
        </div>

        <div class="section">
          <h2>Professional Details</h2>

          <div class="field">
            <label>Profession *</label>
            <input v-model="form.profession" type="text" placeholder="e.g. Software Engineer" required />
          </div>

          <div class="field">
            <label>Place of Profession *</label>
            <input v-model="form.place_of_profession" type="text" placeholder="Organisation or Institution" required />
          </div>
        </div>

        <div class="section">
          <h2>Department Preference *</h2>
          <p class="hint">Select all that apply.</p>
          <div class="chips">
            <button
              v-for="dept in departmentOptions"
              :key="dept"
              type="button"
              class="chip"
              :class="{ active: form.department.includes(dept) }"
              @click="toggleDepartment(dept)"
            >{{ dept }}</button>
          </div>
        </div>

        <div class="section">
          <h2>Background &amp; Commitment</h2>

          <div class="field">
            <label>Volunteered before? *</label>
            <div class="radio-group">
              <label class="radio"><input type="radio" v-model="form.volunteered_before" value="Yes" required /> Yes</label>
              <label class="radio"><input type="radio" v-model="form.volunteered_before" value="No" /> No</label>
            </div>
          </div>

          <div class="field">
            <label class="checkbox">
              <input type="checkbox" v-model="form.can_attend_events" />
              I can attend in-person events
            </label>
          </div>
        </div>

        <div class="section">
          <h2>Documents</h2>
          <p class="hint">Files are uploaded securely via Cloudinary.</p>

          <div class="field">
            <label>Government ID *</label>
            <div
              class="upload-box"
              :class="{ done: govIdDone, loading: govIdUploading }"
              @click="!govIdUploading && $refs.govIdInput.click()"
            >
              <span class="upload-icon">
                <template v-if="govIdUploading">⏳</template>
                <template v-else-if="govIdDone">✅</template>
                <template v-else>⬆️</template>
              </span>
              <span v-if="govIdUploading" class="upload-text">Uploading...</span>
              <span v-else-if="govIdFile" class="upload-name">{{ govIdFile.name }}</span>
              <span v-else class="upload-text">Click to upload</span>
              <span v-if="govIdDone" class="upload-badge">Uploaded</span>
              <span v-else-if="govIdFile && !govIdUploading" class="upload-change">Change</span>
            </div>
            <input ref="govIdInput" type="file" accept="image/*,.pdf" style="display:none" @change="handleGovIdChange" />
          </div>

          <div class="field">
            <label>Your Photo *</label>
            <div
              class="upload-box"
              :class="{ done: memberPicDone, loading: memberPicUploading }"
              @click="!memberPicUploading && $refs.memberPicInput.click()"
            >
              <span class="upload-icon">
                <template v-if="memberPicUploading">⏳</template>
                <template v-else-if="memberPicDone">✅</template>
                <template v-else>⬆️</template>
              </span>
              <span v-if="memberPicUploading" class="upload-text">Uploading...</span>
              <span v-else-if="memberPicFile" class="upload-name">{{ memberPicFile.name }}</span>
              <span v-else class="upload-text">Click to upload</span>
              <span v-if="memberPicDone" class="upload-badge">Uploaded</span>
              <span v-else-if="memberPicFile && !memberPicUploading" class="upload-change">Change</span>
            </div>
            <input ref="memberPicInput" type="file" accept="image/*" style="display:none" @change="handleMemberPicChange" />
          </div>
        </div>

        <div class="section">
          <label class="checkbox">
            <input type="checkbox" v-model="form.acknowledgement" required />
            I confirm that all information provided is accurate and I agree to uphold the values of Anantya Foundation.
          </label>
        </div>

        <div class="submit-area">
          <button type="submit" :disabled="isSubmitting || form.department.length === 0 || !!ageError">
            {{ isSubmitting ? 'Submitting...' : 'Submit Application' }}
          </button>
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
  padding: 40px 16px 80px;
  font-family: sans-serif;
  font-size: 14px;
  color: #333;
}

.card {
  width: 100%;
  max-width: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.14);
}

.card-header { background: #2c5f2e; padding: 28px 32px; color: white; }
.card-header h1 { margin: 0 0 4px; font-size: 22px; font-weight: 600; }
.card-header p { margin: 0; font-size: 14px; opacity: 0.8; }

form { background: white; }

.section { padding: 24px 32px; border-bottom: 8px solid #f0ede8; }
.section:last-of-type { border-bottom: none; }

h2 { margin: 0 0 18px; font-size: 15px; font-weight: 600; color: #2c5f2e; }
.hint { margin: -12px 0 14px; font-size: 12px; color: #888; }

.field { margin-bottom: 16px; }
.field:last-child { margin-bottom: 0; }
.field > label { display: block; margin-bottom: 6px; font-size: 13px; color: #555; }

/* Email confirmation note */
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

/* Age validation error */
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

.row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

input[type="text"],
input[type="email"],
input[type="number"],
input[type="date"],
select {
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

input:focus, select:focus {
  border-color: #2c5f2e;
  border-bottom: 2px solid #2c5f2e;
}

.chips { display: flex; flex-wrap: wrap; gap: 8px; }

.chip {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid #dadce0;
  background: white;
  font-size: 13px;
  font-family: inherit;
  color: #444;
  cursor: pointer;
  transition: all 0.12s;
}

.chip:hover { border-color: #2c5f2e; color: #2c5f2e; }
.chip.active { background: #2c5f2e; border-color: #2c5f2e; color: white; }

.radio-group { display: flex; gap: 20px; }
.radio { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 14px; }
.radio input { accent-color: #2c5f2e; }

.checkbox { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: #444; cursor: pointer; line-height: 1.5; }
.checkbox input { margin-top: 2px; accent-color: #2c5f2e; flex-shrink: 0; }

.upload-box {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px dashed #b0b8b0;
  border-radius: 6px;
  padding: 12px 16px;
  cursor: pointer;
  background: #fafafa;
  transition: border-color 0.15s, background 0.15s;
}

.upload-box:hover:not(.loading) { border-color: #2c5f2e; background: #f4f9f4; }
.upload-box.done { border-color: #2c5f2e; border-style: solid; background: #f4f9f4; cursor: default; }
.upload-box.loading { cursor: default; opacity: 0.7; }

.upload-icon { font-size: 18px; flex-shrink: 0; }
.upload-text { color: #777; font-size: 13px; }
.upload-name { font-size: 13px; color: #333; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.upload-change { font-size: 12px; color: #2c5f2e; margin-left: auto; flex-shrink: 0; }
.upload-badge { font-size: 12px; color: #2c5f2e; font-weight: 600; margin-left: auto; flex-shrink: 0; }

.submit-area { padding: 20px 32px 28px; background: white; }

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

.message {
  margin: 12px 0 0;
  padding: 10px 14px;
  border-radius: 4px;
  font-size: 13px;
  background: #fdecea;
  color: #c0392b;
  border-left: 3px solid #c0392b;
}

.message.success { background: #f4f9f4; color: #2c5f2e; border-left-color: #2c5f2e; }

@media (max-width: 480px) {
  .row { grid-template-columns: 1fr; }
  .section { padding: 20px; }
  .submit-area { padding: 20px; }
}

input[readonly] {
  background: #f5f5f5;
  color: #888;
  cursor: default;
}
</style>