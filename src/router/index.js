import { createRouter, createWebHistory } from 'vue-router'
import OnboardingView from '../views/OnboardingView.vue'
import NotFound from '../views/NotFound.vue'
import AdminSignup from '@/views/AdminSignup.vue'
import AdminLogin from '@/views/AdminLogin.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import MaintenanceView from '@/views/MaintenanceView.vue'
import { MAINTENANCE_MODE } from '@/config.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/onboarding',
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: OnboardingView,
    },
    {
      path: '/admin/signup',
      name: 'admin-signup',
      component: AdminSignup,
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: AdminLogin,
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: AdminDashboard,
    },
    {
      path: '/maintenance',
      name: 'maintenance',
      component: MaintenanceView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
    },
  ],
})

// Navigation guard for maintenance mode
router.beforeEach((to, _from, next) => {
  if (MAINTENANCE_MODE && to.path !== '/maintenance') {
    next('/maintenance')
  } else if (!MAINTENANCE_MODE && to.path === '/maintenance') {
    next('/')
  } else {
    next()
  }
})

export default router
