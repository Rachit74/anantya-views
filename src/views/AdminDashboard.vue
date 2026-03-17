<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/config'

const router = useRouter()

// ── Auth guard ──────────────────────────────────────────────
const token = localStorage.getItem('admin_token')
const tokenType = localStorage.getItem('token_type') || 'bearer'

if (!token) {
  router.replace('/admin/login')
}

const authHeaders = {
  Authorization: `${tokenType} ${token}`,
}

// ── State ────────────────────────────────────────────────────
const members        = ref([])
const loading        = ref(true)
const fetchError     = ref('')
const searchQuery    = ref('')
const filterGender   = ref('')
const filterDept     = ref('')
const filterAdmin    = ref('')
const sortKey        = ref('fullname')
const sortDir        = ref('asc')
const currentPage    = ref(1)
const pageSize       = ref(10)
const selectedMember = ref(null)
const adminInfo      = ref(null)
const sidebarOpen    = ref(false)

// ── Fetch admin info ─────────────────────────────────────────
const fetchAdminInfo = async () => {
  try {
    const { data } = await api.get('/admin/dashboard', { headers: authHeaders })
    adminInfo.value = data
  } catch (e) {
    if (e?.response?.status === 401) {
      localStorage.removeItem('admin_token')
      router.replace('/admin/login')
    }
  }
}

// ── Fetch members ─────────────────────────────────────────────
const fetchMembers = async () => {
  loading.value = true
  fetchError.value = ''
  try {
    const { data } = await api.get('/members', { headers: authHeaders })
    members.value = data
  } catch (e) {
    if (e?.response?.status === 401) {
      localStorage.removeItem('admin_token')
      router.replace('/admin/login')
    } else {
      fetchError.value = e?.response?.data?.detail || e.message
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchAdminInfo()
  await fetchMembers()
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

const handleEscape = (e) => {
  if (e.key === 'Escape') {
    selectedMember.value = null
    sidebarOpen.value = false
  }
}

// ── Logout ────────────────────────────────────────────────────
const logout = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('token_type')
  router.replace('/admin/login')
}

// ── Computed: unique departments ──────────────────────────────
const allDepartments = computed(() => {
  const depts = new Set()
  members.value.forEach(m => {
    if (Array.isArray(m.department)) m.department.forEach(d => depts.add(d))
    else if (m.department) depts.add(m.department)
  })
  return [...depts].sort()
})

// ── Stats ─────────────────────────────────────────────────────
const stats = computed(() => ({
  total:      members.value.length,
  admins:     members.value.filter(m => m.is_admin).length,
  canAttend:  members.value.filter(m => m.can_attend_events).length,
  experienced: members.value.filter(m => m.volunteered_before === 'Yes').length,
}))

// ── Filtered + sorted ─────────────────────────────────────────
const filtered = computed(() => {
  let list = [...members.value]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(m =>
      m.fullname?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.member_id?.toLowerCase().includes(q) ||
      m.location?.toLowerCase().includes(q) ||
      m.profession?.toLowerCase().includes(q)
    )
  }

  if (filterGender.value)
    list = list.filter(m => m.gender === filterGender.value)

  if (filterDept.value)
    list = list.filter(m =>
      Array.isArray(m.department)
        ? m.department.includes(filterDept.value)
        : m.department === filterDept.value
    )

  if (filterAdmin.value !== '')
    list = list.filter(m => String(m.is_admin) === filterAdmin.value)

  list.sort((a, b) => {
    let av = a[sortKey.value] ?? ''
    let bv = b[sortKey.value] ?? ''
    if (typeof av === 'string') av = av.toLowerCase()
    if (typeof bv === 'string') bv = bv.toLowerCase()
    if (av < bv) return sortDir.value === 'asc' ? -1 : 1
    if (av > bv) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })

  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))

const paginated = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

// ── Sort toggle ───────────────────────────────────────────────
const setSort = (key) => {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
  currentPage.value = 1
}

const sortIcon = (key) => {
  if (sortKey.value !== key) return '⇅'
  return sortDir.value === 'asc' ? '↑' : '↓'
}

// ── Reset filters ─────────────────────────────────────────────
const resetFilters = () => {
  searchQuery.value = ''
  filterGender.value = ''
  filterDept.value = ''
  filterAdmin.value = ''
  currentPage.value = 1
}

// ── Initials avatar ───────────────────────────────────────────
const initials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}
</script>

<template>
  <div class="dashboard">

    <!-- Mobile Header -->
    <header class="mobile-header">
      <button class="hamburger" @click="sidebarOpen = !sidebarOpen">
        <span></span><span></span><span></span>
      </button>
      <div class="mobile-title">Members</div>
      <button class="mobile-logout" @click="logout">Sign Out</button>
    </header>

    <!-- Mobile Overlay -->
    <div v-if="sidebarOpen" class="mobile-overlay" @click="sidebarOpen = false"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <div class="logo-mark">
          <img src="/favicon.ico" alt="AF" />
        </div>
        <div class="logo-text">
          <span class="logo-name">Anantya</span>
          <span class="logo-sub">Foundation</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-item active">
          <span>👥</span>
          <span>Members</span>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="admin-info">
          <div class="admin-avatar">A</div>
          <div class="admin-details">
            <span class="admin-label">Admin</span>
            <span class="admin-id">{{ adminInfo?.admin_id?.slice(0, 8) || '...' }}</span>
          </div>
        </div>
        <button class="logout-btn" @click="logout">
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main">

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-left">
          <h1>Members</h1>
          <p>Registered volunteers</p>
        </div>
        <button class="refresh-btn" @click="fetchMembers" :disabled="loading">
          <span :class="{ spinning: loading }">↻</span>
          Refresh
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-num">{{ stats.total }}</span>
          <span class="stat-label">Total Members</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">{{ stats.admins }}</span>
          <span class="stat-label">Admins</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">{{ stats.canAttend }}</span>
          <span class="stat-label">Can Attend</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">{{ stats.experienced }}</span>
          <span class="stat-label">Experienced</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search name, email, ID..."
            @input="currentPage = 1"
          />
        </div>

        <div class="filter-row">
          <select v-model="filterGender" @change="currentPage = 1">
            <option value="">All Genders</option>
            <option>Male</option>
            <option>Female</option>
            <option>Non-binary</option>
            <option>Prefer not to say</option>
          </select>

          <select v-model="filterDept" @change="currentPage = 1">
            <option value="">All Departments</option>
            <option v-for="d in allDepartments" :key="d">{{ d }}</option>
          </select>

          <select v-model="filterAdmin" @change="currentPage = 1">
            <option value="">All Roles</option>
            <option value="true">Admins</option>
            <option value="false">Members</option>
          </select>

          <button class="clear-btn" @click="resetFilters">✕ Clear</button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="fetchError" class="error-msg">
        ⚠️ {{ fetchError }}
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div v-for="i in 5" :key="i" class="skeleton-row"></div>
      </div>

      <!-- Members Table -->
      <div v-else-if="members.length" class="table-wrap">
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th class="sortable" @click="setSort('member_id')">ID {{ sortIcon('member_id') }}</th>
                <th class="sortable" @click="setSort('location')">Location {{ sortIcon('location') }}</th>
                <th class="sortable" @click="setSort('profession')">Profession {{ sortIcon('profession') }}</th>
                <th>Departments</th>
                <th class="sortable" @click="setSort('gender')">Gender {{ sortIcon('gender') }}</th>
                <th>Role</th>
                <th>Events</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="member in paginated"
                :key="member.member_id"
                @click="selectedMember = member"
              >
                <td>
                  <div class="member-cell">
                    <div class="avatar">
                      <img v-if="member.member_picture" :src="member.member_picture" :alt="member.fullname" />
                      <span v-else>{{ initials(member.fullname) }}</span>
                    </div>
                    <div class="member-info">
                      <span class="member-name">{{ member.fullname }}</span>
                      <span class="member-email">{{ member.email }}</span>
                    </div>
                  </div>
                </td>
                <td><code class="id-code">{{ member.member_id }}</code></td>
                <td>{{ member.location || '—' }}</td>
                <td>{{ member.profession || '—' }}</td>
                <td>
                  <div class="chips">
                    <span
                      v-for="d in (Array.isArray(member.department) ? member.department.slice(0,2) : [member.department])"
                      :key="d"
                      class="chip"
                    >{{ d }}</span>
                    <span v-if="Array.isArray(member.department) && member.department.length > 2" class="chip more">
                      +{{ member.department.length - 2 }}
                    </span>
                  </div>
                </td>
                <td>{{ member.gender || '—' }}</td>
                <td>
                  <span class="badge" :class="{ admin: member.is_admin }">
                    {{ member.is_admin ? 'Admin' : 'Member' }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="{ yes: member.can_attend_events }">
                    {{ member.can_attend_events ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td>
                  <button class="view-btn" @click.stop="selectedMember = member">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <span class="page-info">
            {{ Math.min((currentPage - 1) * pageSize + 1, filtered.length) }}–{{ Math.min(currentPage * pageSize, filtered.length) }} of {{ filtered.length }}
          </span>
          <div class="page-controls">
            <button @click="currentPage--" :disabled="currentPage === 1">‹ Prev</button>
            <span class="page-num">{{ currentPage }} / {{ totalPages }}</span>
            <button @click="currentPage++" :disabled="currentPage === totalPages">Next ›</button>
          </div>
          <select v-model.number="pageSize" @change="currentPage = 1">
            <option :value="10">10 / page</option>
            <option :value="25">25 / page</option>
            <option :value="50">50 / page</option>
          </select>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p>🌿 No members found.</p>
      </div>

    </main>

    <!-- Member Detail Drawer -->
    <div v-if="selectedMember" class="drawer-overlay" @click="selectedMember = null">
      <aside class="drawer" @click.stop>
        <button class="drawer-close" @click="selectedMember = null">✕</button>

        <div class="drawer-header">
          <div class="avatar large">
            <img v-if="selectedMember.member_picture" :src="selectedMember.member_picture" :alt="selectedMember.fullname" />
            <span v-else>{{ initials(selectedMember.fullname) }}</span>
          </div>
          <div>
            <h2>{{ selectedMember.fullname }}</h2>
            <code class="id-code">{{ selectedMember.member_id }}</code>
          </div>
        </div>

        <div class="drawer-badges">
          <span class="badge" :class="{ admin: selectedMember.is_admin }">
            {{ selectedMember.is_admin ? 'Admin' : 'Member' }}
          </span>
          <span class="badge" :class="{ yes: selectedMember.can_attend_events }">
            {{ selectedMember.can_attend_events ? 'Attends Events' : 'Remote Only' }}
          </span>
          <span class="badge" :class="{ yes: selectedMember.volunteered_before === 'Yes' }">
            {{ selectedMember.volunteered_before === 'Yes' ? 'Experienced' : 'First-time' }}
          </span>
        </div>

        <div class="drawer-section">
          <h3>Contact</h3>
          <div class="row"><span class="label">Email</span><span>{{ selectedMember.email }}</span></div>
          <div class="row"><span class="label">Phone</span><span>{{ selectedMember.phone_number || '—' }}</span></div>
        </div>

        <div class="drawer-section">
          <h3>Personal</h3>
          <div class="row"><span class="label">Age</span><span>{{ selectedMember.age ?? '—' }}</span></div>
          <div class="row"><span class="label">DOB</span><span>{{ selectedMember.dob || '—' }}</span></div>
          <div class="row"><span class="label">Gender</span><span>{{ selectedMember.gender || '—' }}</span></div>
          <div class="row"><span class="label">Location</span><span>{{ selectedMember.location || '—' }}</span></div>
        </div>

        <div class="drawer-section">
          <h3>Professional</h3>
          <div class="row"><span class="label">Profession</span><span>{{ selectedMember.profession || '—' }}</span></div>
          <div class="row"><span class="label">Organisation</span><span>{{ selectedMember.place_of_profession || '—' }}</span></div>
        </div>

        <div class="drawer-section">
          <h3>Departments</h3>
          <div class="chips">
            <span
              v-for="d in (Array.isArray(selectedMember.department) ? selectedMember.department : [selectedMember.department])"
              :key="d"
              class="chip"
            >{{ d }}</span>
          </div>
        </div>

        <div v-if="selectedMember.government_id_picture" class="drawer-section">
          <h3>Documents</h3>
          <a :href="selectedMember.government_id_picture" target="_blank" class="doc-link">
            🪪 View Government ID
          </a>
        </div>
      </aside>
    </div>

  </div>
</template>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

/* Layout */
.dashboard {
  display: flex;
  min-height: 100vh;
  background: #f0ede8;
  font-family: sans-serif;
  font-size: 14px;
  color: #333;
}

/* Mobile Header */
.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #2c5f2e;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
}

.hamburger {
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
}

.hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  background: white;
  border-radius: 1px;
}

.mobile-title {
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.mobile-logout {
  padding: 8px 12px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
}

.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 150;
}

/* Sidebar */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #2c5f2e;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo-mark {
  width: 40px;
  height: 40px;
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

.logo-text { display: flex; flex-direction: column; }
.logo-name { font-size: 15px; font-weight: 600; color: white; }
.logo-sub { font-size: 12px; color: rgba(255,255,255,0.65); }

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  color: rgba(255,255,255,0.7);
  font-size: 14px;
  cursor: pointer;
}

.nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
.nav-item.active { background: rgba(255,255,255,0.15); color: white; }

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(0,0,0,0.15);
  border-radius: 6px;
  margin-bottom: 8px;
}

.admin-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.admin-details { display: flex; flex-direction: column; }
.admin-label { font-size: 10px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px; }
.admin-id { font-size: 12px; color: rgba(255,255,255,0.8); font-family: monospace; }

.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  color: rgba(255,255,255,0.7);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
}

.logout-btn:hover { background: rgba(255,255,255,0.1); color: white; }

/* Main */
.main {
  flex: 1;
  padding: 32px;
  overflow: auto;
  min-width: 0;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
}

.page-header-left h1 {
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.page-header-left p {
  font-size: 13px;
  color: #888;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  font-size: 13px;
  font-family: inherit;
  color: #444;
  cursor: pointer;
}

.refresh-btn:hover:not(:disabled) { border-color: #2c5f2e; color: #2c5f2e; }
.refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.spinning { display: inline-block; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Stats */
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  flex: 1;
  background: white;
  border-radius: 6px;
  padding: 16px 20px;
  border-left: 3px solid #2c5f2e;
}

.stat-num {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #2c5f2e;
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

/* Filters */
.filters {
  background: white;
  border-radius: 6px;
  padding: 16px 20px;
  margin-bottom: 16px;
}

.search-box {
  position: relative;
  margin-bottom: 12px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
}

.search-box input {
  width: 100%;
  height: 40px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  padding: 0 12px 0 36px;
  font-size: 14px;
  font-family: inherit;
  color: #333;
  outline: none;
}

.search-box input:focus { border-color: #2c5f2e; border-bottom: 2px solid #2c5f2e; }

.filter-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-row select {
  height: 36px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 13px;
  font-family: inherit;
  color: #333;
  background: white;
  outline: none;
  cursor: pointer;
}

.filter-row select:focus { border-color: #2c5f2e; }

.clear-btn {
  height: 36px;
  padding: 0 14px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  font-family: inherit;
  color: #888;
  cursor: pointer;
}

.clear-btn:hover { border-color: #c0392b; color: #c0392b; }

/* Error */
.error-msg {
  padding: 12px 16px;
  background: #fdecea;
  border-left: 3px solid #c0392b;
  border-radius: 4px;
  color: #c0392b;
  font-size: 13px;
  margin-bottom: 16px;
}

/* Loading */
.loading-state {
  background: white;
  border-radius: 6px;
  padding: 16px;
}

.skeleton-row {
  height: 48px;
  background: linear-gradient(90deg, #f0ede8 25%, #e8e4de 50%, #f0ede8 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  margin-bottom: 8px;
  animation: shimmer 1.2s infinite;
}

.skeleton-row:last-child { margin-bottom: 0; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Table */
.table-wrap {
  background: white;
  border-radius: 6px;
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

thead tr { background: #f7f6f3; }

th {
  padding: 12px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
  border-bottom: 2px solid #ebebeb;
}

th.sortable { cursor: pointer; }
th.sortable:hover { color: #2c5f2e; }

tbody tr { border-bottom: 1px solid #f0ede8; cursor: pointer; }
tbody tr:hover { background: #fafaf8; }
tbody tr:last-child { border-bottom: none; }

td {
  padding: 12px 14px;
  font-size: 13px;
  vertical-align: middle;
}

/* Member cell */
.member-cell { display: flex; align-items: center; gap: 10px; }

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e8f0e8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #2c5f2e;
  flex-shrink: 0;
  overflow: hidden;
}

.avatar img { width: 100%; height: 100%; object-fit: cover; }

.member-info { display: flex; flex-direction: column; gap: 2px; }
.member-name { font-weight: 500; color: #1a1a1a; }
.member-email { font-size: 11px; color: #999; }

.id-code {
  font-family: monospace;
  font-size: 11px;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  color: #555;
}

/* Chips */
.chips { display: flex; flex-wrap: wrap; gap: 4px; }

.chip {
  padding: 2px 8px;
  border-radius: 999px;
  background: #e8f0e8;
  color: #2c5f2e;
  font-size: 11px;
  font-weight: 500;
}

.chip.more {
  background: #f0ede8;
  color: #888;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  background: #f0ede8;
  color: #888;
}

.badge.admin { background: #2c5f2e; color: white; }
.badge.yes { background: #e8f0e8; color: #2c5f2e; }

/* View button */
.view-btn {
  padding: 4px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  font-family: inherit;
  color: #444;
  cursor: pointer;
}

.view-btn:hover { border-color: #2c5f2e; color: #2c5f2e; }

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-top: 1px solid #f0ede8;
  gap: 12px;
  flex-wrap: wrap;
}

.page-info { font-size: 12px; color: #888; }

.page-controls { display: flex; align-items: center; gap: 8px; }

.page-controls button {
  padding: 5px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  font-family: inherit;
  color: #444;
  cursor: pointer;
}

.page-controls button:hover:not(:disabled) { border-color: #2c5f2e; color: #2c5f2e; }
.page-controls button:disabled { opacity: 0.4; cursor: not-allowed; }

.page-num { font-size: 13px; color: #555; }

.pagination select {
  height: 30px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 12px;
  font-family: inherit;
  color: #444;
  background: white;
}

/* Empty state */
.empty-state {
  background: white;
  border-radius: 6px;
  padding: 60px;
  text-align: center;
  color: #aaa;
}

/* Drawer */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 200;
  display: flex;
  justify-content: flex-end;
}

.drawer {
  width: 380px;
  max-width: 100%;
  height: 100%;
  background: white;
  overflow-y: auto;
  padding: 24px;
  position: relative;
}

.drawer-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: 1px solid #dadce0;
  border-radius: 50%;
  background: white;
  font-size: 14px;
  cursor: pointer;
  color: #666;
}

.drawer-close:hover { border-color: #c0392b; color: #c0392b; }

.drawer-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  padding-right: 36px;
}

.avatar.large {
  width: 56px;
  height: 56px;
  font-size: 18px;
  border: 2px solid #d0e0d0;
}

.drawer-header h2 {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.drawer-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
}

.drawer-section {
  padding: 16px 0;
  border-top: 1px solid #f0ede8;
}

.drawer-section h3 {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
  margin-bottom: 12px;
}

.drawer-section .row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.drawer-section .row:last-child { margin-bottom: 0; }

.drawer-section .label {
  font-size: 13px;
  color: #888;
}

.drawer-section .row span:last-child {
  font-size: 13px;
  color: #333;
  text-align: right;
}

.doc-link {
  display: inline-block;
  padding: 8px 14px;
  background: #f4f9f4;
  border: 1px solid #d0e0d0;
  border-radius: 4px;
  color: #2c5f2e;
  text-decoration: none;
  font-size: 13px;
}

.doc-link:hover { background: #e8f0e8; }

/* Responsive */
@media (max-width: 1024px) {
  .stats-row { flex-wrap: wrap; }
  .stat-item { min-width: calc(50% - 8px); }
}

@media (max-width: 768px) {
  .mobile-header { display: flex; }
  .mobile-overlay { display: block; }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    z-index: 200;
  }

  .sidebar.open { transform: translateX(0); }

  .main {
    padding: 72px 16px 24px;
  }

  .page-header { margin-bottom: 16px; }
  .page-header-left h1 { font-size: 18px; }
  .refresh-btn { padding: 6px 12px; font-size: 12px; }

  .stats-row { gap: 10px; }
  .stat-item { padding: 12px 16px; }
  .stat-num { font-size: 24px; }

  .filters { padding: 12px 16px; }
  .filter-row select { flex: 1; min-width: 0; }

  .drawer {
    width: 100%;
    padding: 72px 16px 24px;
  }
}

@media (max-width: 480px) {
  .stat-item { min-width: 100%; }

  .pagination {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .page-controls { justify-content: center; }
  .pagination select { align-self: center; }
}
</style>