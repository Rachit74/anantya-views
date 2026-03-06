<template>
  <div class="container">
    <div class="code">404</div>
    <div class="divider"></div>
    <h1>Page Not Found</h1>
    <p>The page you're looking for doesn't exist or has been moved.</p>
    <RouterLink to="/onboarding">Go back home</RouterLink>
  </div>
</template>

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

.code {
  font-size: 96px;
  font-weight: 700;
  color: #111;
  line-height: 1;
  letter-spacing: -2px;
}

.divider {
  width: 40px;
  height: 2px;
  background: #e0e0e0;
  margin: 24px auto;
}

h1 {
  font-size: 20px;
  font-weight: 600;
  color: #111;
  margin-bottom: 10px;
}

p {
  font-size: 14px;
  color: #888;
  line-height: 1.6;
  margin-bottom: 32px;
}

a {
  display: inline-block;
  padding: 10px 24px;
  background: #111;
  color: #fff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  transition: background 0.15s;
}

a:hover { background: #333; }
</style>