<script setup>
import { reactive } from 'vue'

const form = reactive({
  email: '',
  fullname: '',
  age: null,
  gender: '',
  location: '',
  phone_number: null,
  profession: '',
  place_of_profession: '',
  department: '',
  volunteered_before: '',
})

const handleSubmit = () => {
  console.log('Onboarding form submitted:', { ...form })
}
</script>

<template>
  <main class="onboarding">
    <section class="card">
      <h1>Anantya Onboarding Form</h1>
      <form @submit.prevent="handleSubmit">
        <label>
          Email
          <input v-model="form.email" type="email" required />
        </label>

        <label>
          Full Name
          <input v-model="form.fullname" type="text" required />
        </label>

        <label>
          Age
          <input v-model.number="form.age" type="number" min="0" required />
        </label>

        <label>
          Gender
          <input v-model="form.gender" type="text" required />
        </label>

        <label>
          Location
          <input v-model="form.location" type="text" required />
        </label>

        <label>
          Phone Number
          <input v-model.number="form.phone_number" type="number" min="0" required />
        </label>

        <label>
          Profession
          <input v-model="form.profession" type="text" required />
        </label>

        <label>
          Place of Profession
          <input v-model="form.place_of_profession" type="text" required />
        </label>

        <label>
          Department
          <input v-model="form.department" type="text" required />
        </label>

        <label>
          Volunteered Before
          <input v-model="form.volunteered_before" type="text" required />
        </label>

        <button type="submit">Submit</button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.onboarding {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #f6f7fb;
}

.card {
  width: min(700px, 100%);
  padding: 24px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

h1 {
  margin: 0 0 16px;
}

form {
  display: grid;
  gap: 12px;
}

label {
  display: grid;
  gap: 6px;
  font-size: 14px;
}

input {
  height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0 12px;
}

button {
  margin-top: 8px;
  height: 40px;
  border: 0;
  border-radius: 8px;
  background: #111827;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
}
</style>
