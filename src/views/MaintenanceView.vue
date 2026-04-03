<template>
  <div class="container">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    </div>
    <h1>Under Maintenance</h1>
    <p>We're currently performing scheduled maintenance to improve your experience. Please check back soon.</p>
    <div class="status">
      <span class="dot"></span>
      Service in Progress
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #ffffff;
}

.icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f4f9f4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  color: #2c5f2e;
}

h1 {
  font-size: 28px;
  font-weight: 700;
  color: #111;
  margin-bottom: 12px;
}

p {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  max-width: 400px;
  margin-bottom: 32px;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f4f9f4;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #2c5f2e;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2c5f2e;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>