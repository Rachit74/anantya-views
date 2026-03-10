<script setup>
import axios from 'axios'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const BASE_URL = 'https://anantya-api.onrender.com'

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

// ── Fetch admin info ─────────────────────────────────────────
const fetchAdminInfo = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/admin/dashboard`, { headers: authHeaders })
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
    const { data } = await axios.get(`${BASE_URL}/members`, { headers: authHeaders })
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
})

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

// ── Department display ────────────────────────────────────────
const deptLabel = (dept) => {
  if (!dept) return '—'
  if (Array.isArray(dept)) return dept.join(', ') || '—'
  return dept
}

// ── Initials avatar ───────────────────────────────────────────
const initials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}
</script>

<template>
  <div class="dashboard">

    <!-- ── Sidebar ─────────────────────────────────────── -->
    <aside class="sidebar">
      <div class="sidebar-logo">
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
          <span class="nav-icon">👥</span>
          <span>Members</span>
        </div>
        <div class="nav-item" @click="logout">
          <span class="nav-icon">🚪</span>
          <span>Sign Out</span>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="admin-pill">
          <div class="admin-avatar">A</div>
          <div class="admin-meta">
            <span class="admin-label">Admin</span>
            <span class="admin-id">{{ adminInfo?.admin_id?.slice(0, 8) || '...' }}</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- ── Main ───────────────────────────────────────── -->
    <main class="main">

      <!-- Top bar -->
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="page-title">Members</h1>
          <span class="page-sub">Registered volunteers</span>
        </div>
        <button class="refresh-btn" @click="fetchMembers" :disabled="loading">
          <span :class="{ spinning: loading }">↻</span>
          Refresh
        </button>
      </header>

      <!-- Stat cards -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total Members</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.admins }}</div>
          <div class="stat-label">Admins</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.canAttend }}</div>
          <div class="stat-label">Can Attend Events</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.experienced }}</div>
          <div class="stat-label">Previously Volunteered</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, email, ID, location…"
            @input="currentPage = 1"
          />
        </div>

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
          <option value="true">Admins only</option>
          <option value="false">Members only</option>
        </select>

        <button class="reset-btn" @click="resetFilters">✕ Clear</button>
      </div>

      <!-- Error -->
      <div v-if="fetchError" class="error-banner">
        ⚠️ {{ fetchError }}
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="skeleton-wrap">
        <div v-for="i in 6" :key="i" class="skeleton-row"></div>
      </div>

      <!-- Table -->
      <div v-else-if="members.length" class="table-wrap">
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
              class="member-row"
            >
              <td>
                <div class="member-cell">
                  <div class="avatar">
                    <img
                      v-if="member.member_picture"
                      :src="member.member_picture"
                      :alt="member.fullname"
                    />
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
                <div class="dept-chips">
                  <span
                    v-for="d in (Array.isArray(member.department) ? member.department.slice(0,2) : [member.department])"
                    :key="d"
                    class="dept-chip"
                  >{{ d }}</span>
                  <span
                    v-if="Array.isArray(member.department) && member.department.length > 2"
                    class="dept-chip more"
                  >+{{ member.department.length - 2 }}</span>
                </div>
              </td>
              <td>{{ member.gender || '—' }}</td>
              <td>
                <span class="role-badge" :class="{ admin: member.is_admin }">
                  {{ member.is_admin ? 'Admin' : 'Member' }}
                </span>
              </td>
              <td>
                <span class="attend-badge" :class="{ yes: member.can_attend_events }">
                  {{ member.can_attend_events ? 'Yes' : 'No' }}
                </span>
              </td>
              <td>
                <button class="view-btn" @click.stop="selectedMember = member">View</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination">
          <span class="pag-info">
            Showing {{ Math.min((currentPage - 1) * pageSize + 1, filtered.length) }}–{{ Math.min(currentPage * pageSize, filtered.length) }} of {{ filtered.length }}
          </span>
          <div class="pag-controls">
            <button @click="currentPage--" :disabled="currentPage === 1">‹ Prev</button>
            <span class="pag-current">{{ currentPage }} / {{ totalPages }}</span>
            <button @click="currentPage++" :disabled="currentPage === totalPages">Next ›</button>
          </div>
          <select v-model.number="pageSize" @change="currentPage = 1" class="page-size">
            <option :value="10">10 / page</option>
            <option :value="25">25 / page</option>
            <option :value="50">50 / page</option>
          </select>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="empty-state">
        <p>🌿 No members found.</p>
      </div>

    </main>

    <!-- ── Member Detail Drawer ───────────────────────── -->
    <transition name="drawer">
      <div v-if="selectedMember" class="drawer-overlay" @click.self="selectedMember = null">
        <aside class="drawer">
          <button class="drawer-close" @click="selectedMember = null">✕</button>

          <div class="drawer-header">
            <div class="drawer-avatar">
              <img
                v-if="selectedMember.member_picture"
                :src="selectedMember.member_picture"
                :alt="selectedMember.fullname"
              />
              <span v-else>{{ initials(selectedMember.fullname) }}</span>
            </div>
            <div>
              <h2>{{ selectedMember.fullname }}</h2>
              <code class="id-code">{{ selectedMember.member_id }}</code>
            </div>
          </div>

          <div class="drawer-badges">
            <span class="role-badge" :class="{ admin: selectedMember.is_admin }">
              {{ selectedMember.is_admin ? 'Admin' : 'Member' }}
            </span>
            <span class="attend-badge" :class="{ yes: selectedMember.can_attend_events }">
              {{ selectedMember.can_attend_events ? 'Attends Events' : 'Remote Only' }}
            </span>
            <span class="attend-badge" :class="{ yes: selectedMember.volunteered_before === 'Yes' }">
              {{ selectedMember.volunteered_before === 'Yes' ? 'Experienced' : 'First-time' }}
            </span>
          </div>

          <div class="drawer-section">
            <div class="drawer-row">
              <span class="dr-label">Email</span>
              <span class="dr-value">{{ selectedMember.email }}</span>
            </div>
            <div class="drawer-row">
              <span class="dr-label">Phone</span>
              <span class="dr-value">{{ selectedMember.phone_number || '—' }}</span>
            </div>
            <div class="drawer-row">
              <span class="dr-label">Age</span>
              <span class="dr-value">{{ selectedMember.age ?? '—' }}</span>
            </div>
            <div class="drawer-row">
              <span class="dr-label">Date of Birth</span>
              <span class="dr-value">{{ selectedMember.dob || '—' }}</span>
            </div>
            <div class="drawer-row">
              <span class="dr-label">Gender</span>
              <span class="dr-value">{{ selectedMember.gender || '—' }}</span>
            </div>
            <div class="drawer-row">
              <span class="dr-label">Location</span>
              <span class="dr-value">{{ selectedMember.location || '—' }}</span>
            </div>
          </div>

          <div class="drawer-section">
            <div class="drawer-row">
              <span class="dr-label">Profession</span>
              <span class="dr-value">{{ selectedMember.profession || '—' }}</span>
            </div>
            <div class="drawer-row">
              <span class="dr-label">Organisation</span>
              <span class="dr-value">{{ selectedMember.place_of_profession || '—' }}</span>
            </div>
          </div>

          <div class="drawer-section">
            <p class="dr-label" style="margin-bottom:8px">Departments</p>
            <div class="dept-chips">
              <span
                v-for="d in (Array.isArray(selectedMember.department) ? selectedMember.department : [selectedMember.department])"
                :key="d"
                class="dept-chip"
              >{{ d }}</span>
            </div>
          </div>

          <div v-if="selectedMember.government_id_picture" class="drawer-section">
            <p class="dr-label" style="margin-bottom:8px">Government ID</p>
            <a :href="selectedMember.government_id_picture" target="_blank" class="doc-link">
              🪪 View Government ID →
            </a>
          </div>
        </aside>
      </div>
    </transition>

  </div>
</template>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.dashboard {
  display: flex;
  min-height: 100vh;
  background: #f0ede8;
  font-family: sans-serif;
  font-size: 14px;
  color: #333;
}

/* ── Sidebar ─────────────────────────────────────────────── */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #2c5f2e;
  display: flex;
  flex-direction: column;
  padding: 0;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.12);
}

.logo-mark {
  width: 36px;
  height: 36px;
  border-radius: 7px;
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
.logo-name { font-size: 14px; font-weight: 600; color: white; line-height: 1.2; }
.logo-sub  { font-size: 11px; color: rgba(255,255,255,0.6); }

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  color: rgba(255,255,255,0.7);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
.nav-item.active { background: rgba(255,255,255,0.15); color: white; font-weight: 500; }

.nav-icon { font-size: 16px; }

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid rgba(255,255,255,0.12);
}

.admin-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(0,0,0,0.15);
  border-radius: 8px;
}

.admin-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.admin-meta { display: flex; flex-direction: column; overflow: hidden; }
.admin-label { font-size: 10px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px; }
.admin-id { font-size: 12px; color: rgba(255,255,255,0.8); font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ── Main ────────────────────────────────────────────────── */
.main {
  flex: 1;
  padding: 32px;
  overflow: auto;
  min-width: 0;
}

.topbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
}

.topbar-left { display: flex; flex-direction: column; gap: 2px; }

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}

.page-sub { font-size: 13px; color: #888; }

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #dadce0;
  border-radius: 6px;
  background: white;
  font-size: 13px;
  font-family: inherit;
  color: #444;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.refresh-btn:hover:not(:disabled) { border-color: #2c5f2e; color: #2c5f2e; background: #f4f9f4; }
.refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.spinning { display: inline-block; animation: spin 0.7s linear infinite; }

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Stats ───────────────────────────────────────────────── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  border-left: 4px solid #2c5f2e;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #2c5f2e;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label { font-size: 12px; color: #888; }

/* ── Filters ─────────────────────────────────────────────── */
.filters-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.search-wrap {
  flex: 1;
  min-width: 200px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  font-size: 14px;
}

.search-wrap input {
  width: 100%;
  height: 38px;
  border: 1px solid #dadce0;
  border-radius: 6px;
  padding: 0 12px 0 34px;
  font-size: 13px;
  font-family: inherit;
  color: #333;
  outline: none;
  background: white;
  transition: border-color 0.15s;
}

.search-wrap input:focus { border-color: #2c5f2e; }

.filters-bar select {
  height: 38px;
  border: 1px solid #dadce0;
  border-radius: 6px;
  padding: 0 10px;
  font-size: 13px;
  font-family: inherit;
  color: #333;
  background: white;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}

.filters-bar select:focus { border-color: #2c5f2e; }

.reset-btn {
  height: 38px;
  padding: 0 14px;
  border: 1px solid #e0d8d0;
  border-radius: 6px;
  background: white;
  font-size: 12px;
  font-family: inherit;
  color: #888;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.reset-btn:hover { border-color: #b94a3a; color: #b94a3a; background: #fdf1ef; }

/* ── Error ───────────────────────────────────────────────── */
.error-banner {
  padding: 12px 16px;
  background: #fdecea;
  border: 1px solid #f5c6c2;
  border-left: 4px solid #c0392b;
  border-radius: 6px;
  color: #c0392b;
  font-size: 13px;
  margin-bottom: 16px;
}

/* ── Skeleton ────────────────────────────────────────────── */
.skeleton-wrap {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-row {
  height: 44px;
  background: linear-gradient(90deg, #f0ede8 25%, #e8e4de 50%, #f0ede8 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Table ───────────────────────────────────────────────── */
.table-wrap {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead tr {
  background: #f7f6f3;
  border-bottom: 2px solid #ebebeb;
}

th {
  padding: 12px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
  white-space: nowrap;
}

th.sortable {
  cursor: pointer;
  user-select: none;
  transition: color 0.15s;
}

th.sortable:hover { color: #2c5f2e; }

.member-row {
  border-bottom: 1px solid #f0ede8;
  cursor: pointer;
  transition: background 0.12s;
}

.member-row:hover { background: #fafaf8; }
.member-row:last-child { border-bottom: none; }

td {
  padding: 12px 14px;
  font-size: 13px;
  color: #333;
  vertical-align: middle;
}

/* Member cell */
.member-cell { display: flex; align-items: center; gap: 10px; }

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #e8f0e8;
  border: 1px solid #d0e0d0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #2c5f2e;
  flex-shrink: 0;
  overflow: hidden;
}

.avatar img { width: 100%; height: 100%; object-fit: cover; }

.member-info { display: flex; flex-direction: column; gap: 2px; }
.member-name { font-weight: 500; color: #1a1a1a; font-size: 13px; }
.member-email { font-size: 11px; color: #999; }

.id-code {
  font-family: monospace;
  font-size: 11px;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  color: #555;
}

/* Dept chips */
.dept-chips { display: flex; flex-wrap: wrap; gap: 4px; }

.dept-chip {
  padding: 2px 8px;
  border-radius: 999px;
  background: #e8f0e8;
  color: #2c5f2e;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.dept-chip.more {
  background: #f0ede8;
  color: #888;
}

/* Badges */
.role-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: #f0ede8;
  color: #888;
}

.role-badge.admin { background: #2c5f2e; color: white; }

.attend-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  background: #fdecea;
  color: #c0392b;
}

.attend-badge.yes { background: #e8f0e8; color: #2c5f2e; }

/* View btn */
.view-btn {
  padding: 4px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  font-family: inherit;
  color: #444;
  cursor: pointer;
  transition: all 0.12s;
  white-space: nowrap;
}

.view-btn:hover { border-color: #2c5f2e; color: #2c5f2e; background: #f4f9f4; }

/* ── Pagination ──────────────────────────────────────────── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-top: 1px solid #f0ede8;
  gap: 12px;
  flex-wrap: wrap;
}

.pag-info { font-size: 12px; color: #888; }

.pag-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pag-controls button {
  padding: 5px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  font-family: inherit;
  color: #444;
  cursor: pointer;
  transition: all 0.12s;
}

.pag-controls button:hover:not(:disabled) { border-color: #2c5f2e; color: #2c5f2e; }
.pag-controls button:disabled { opacity: 0.4; cursor: not-allowed; }

.pag-current { font-size: 13px; color: #555; min-width: 50px; text-align: center; }

.page-size {
  height: 30px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 12px;
  font-family: inherit;
  color: #444;
  background: white;
  outline: none;
  cursor: pointer;
}

/* ── Empty state ─────────────────────────────────────────── */
.empty-state {
  background: white;
  border-radius: 8px;
  padding: 60px;
  text-align: center;
  color: #aaa;
  font-size: 15px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
}

/* ── Drawer ──────────────────────────────────────────────── */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}

.drawer {
  width: 380px;
  max-width: 95vw;
  height: 100%;
  background: white;
  overflow-y: auto;
  padding: 28px 28px 40px;
  position: relative;
  box-shadow: -4px 0 24px rgba(0,0,0,0.12);
}

.drawer-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: 1px solid #dadce0;
  border-radius: 50%;
  background: white;
  font-size: 13px;
  cursor: pointer;
  color: #666;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-close:hover { border-color: #b94a3a; color: #b94a3a; }

.drawer-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  padding-right: 40px;
}

.drawer-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #e8f0e8;
  border: 2px solid #d0e0d0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #2c5f2e;
  flex-shrink: 0;
  overflow: hidden;
}

.drawer-avatar img { width: 100%; height: 100%; object-fit: cover; }

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

.drawer-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.drawer-row:last-child { margin-bottom: 0; }

.dr-label {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
  padding-top: 1px;
}

.dr-value {
  font-size: 13px;
  color: #333;
  text-align: right;
  word-break: break-word;
}

.doc-link {
  display: inline-block;
  font-size: 13px;
  color: #2c5f2e;
  text-decoration: none;
  padding: 8px 14px;
  border: 1px solid #d0e0d0;
  border-radius: 6px;
  background: #f4f9f4;
  transition: background 0.15s;
}

.doc-link:hover { background: #e8f0e8; }

/* ── Drawer transition ───────────────────────────────────── */
.drawer-enter-active,
.drawer-leave-active { transition: opacity 0.2s; }
.drawer-enter-from,
.drawer-leave-to { opacity: 0; }
.drawer-enter-active .drawer,
.drawer-leave-active .drawer { transition: transform 0.25s ease; }
.drawer-enter-from .drawer,
.drawer-leave-to .drawer { transform: translateX(100%); }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 900px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 700px) {
  .sidebar { display: none; }
  .main { padding: 16px; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}
</style>