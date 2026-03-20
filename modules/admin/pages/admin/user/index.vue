<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-[var(--text-color)]">
        用户管理
      </h1>
    </div>

    <BaseCard class="p-4 space-y-4">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <p class="text-sm text-[var(--text-secondary)]">
            共 {{ totalUsers }} 个用户
          </p>
          <BaseButton size="sm" variant="primary" @click="openCreate">
            新增用户
          </BaseButton>
        </div>

        <div class="rounded-md bg-[var(--muted-bg)]/40 px-3 py-3">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-6 items-end">
            <div class="md:col-span-1">
              <BaseSelect
                v-model="filterRole"
                :options="roleFilterOptions"
                placeholder="全部角色"
              />
            </div>
            <div class="md:col-span-1">
              <BaseSelect
                v-model="searchField"
                :options="searchFieldOptions"
                placeholder="搜索字段"
              />
            </div>
            <div class="md:col-span-3">
              <BaseInput
                v-model="searchKeywordInput"
                placeholder="请输入搜索关键字"
                @keyup.enter="applySearch"
              />
            </div>
            <div class="flex gap-2 justify-end md:col-span-1">
              <BaseButton size="sm" variant="primary" @click="applySearch">
                搜索
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="clearSearch">
                重置
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <AdminTable
        :columns="columns"
        :rows="filteredUsers"
        :loading="tableLoading"
        :page-size="pageSize"
        :total="totalUsers"
        server-side
        @update:page="handlePageChange"
        @update:pageSize="handlePageSizeChange"
      >
        <template #cell-role="{ value }">
          <AdminTag :label="value === 'admin' ? '管理员' : '用户'" :status="value === 'admin' ? 'primary' : 'muted'" size="sm" />
        </template>
        <template #cell-avatar="{ row }">
          <div class="flex items-center gap-2">
            <img
              v-if="row.avatar"
              :src="row.avatar"
              alt=""
              class="w-8 h-8 rounded-full border border-[var(--border-color)] object-cover"
            >
            <div
              v-else
              class="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-semibold bg-[var(--card-bg)]"
              :style="{ borderColor: 'var(--border-color)', color: 'var(--text-color)' }"
            >
              {{ (row.name || row.username).charAt(0).toUpperCase() }}
            </div>
          </div>
        </template>
        <template #cell-createdAt="{ value }">
          <span class="text-xs text-[var(--text-secondary)]">
            {{ formatDate(value) }}
          </span>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center gap-2">
            <BaseButton size="xs" variant="outline" @click.stop="openEdit(row)">
              编辑
            </BaseButton>
            <BaseButton
              size="xs"
              variant="outline"
              class="text-red-600 hover:bg-red-50 hover:border-red-200"
              :disabled="row._id === currentUserId || row.role === 'admin'"
              @click.stop="handleDelete(row)"
            >
              删除
            </BaseButton>
          </div>
        </template>
      </AdminTable>
    </BaseCard>

    <BaseModal
      v-model="modalOpen"
      :title="editing ? '编辑用户' : '新增用户'"
      :close-on-mask="false"
      draggable
      enable-fullscreen
    >
      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="handleSubmit">
        <AdminFormField
          v-model="form.username"
          required
          label="用户名"
          placeholder="请输入用户名"
          :disabled="!!editing"
        />
        <AdminFormField
          v-model="form.name"
          label="姓名"
          placeholder="请输入姓名"
        />
        <AdminFormField
          v-model="form.phone"
          label="手机号"
          placeholder="请输入手机号"
        />
        <AdminFormField
          v-model="form.role"
          required
          label="角色"
          component="select"
          :options="roleOptions"
        />
        <AdminFormField
          v-if="!editing"
          v-model="form.password"
          required
          type="password"
          label="密码"
          placeholder="至少 6 位密码"
        />
      </form>
      <template #footer>
        <BaseButton variant="secondary" size="sm" @click="modalOpen = false">
          取消
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="handleSubmit">
          {{ editing ? '保存修改' : '创建用户' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import AdminTable from '~/modules/admin/components/AdminTable.vue'
import AdminTag from '~/modules/admin/components/AdminTag.vue'
import AdminFormField from '~/modules/admin/components/AdminFormField.vue'
import BaseSelect from '~/components/ui/BaseSelect.vue'
import BaseInput from '~/components/ui/BaseInput.vue'
import { http } from '~/utils/http'
import type { UserPublic } from '~/types/api'
import { useToast } from '~/composables/useToast'
import { useConfirm } from '~/composables/useConfirm'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  name: 'AdminUserListPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})

interface AdminUser extends UserPublic {
  createdAt?: string
}

const { user } = useAuth()
const currentUserId = computed(() => user.value?._id)

const page = ref(1)
const pageSize = ref(10)
const filterRole = ref<'ALL' | 'admin' | 'user'>('ALL')

const buildFilterParams = () => {
  const params: Record<string, string | number> = {}
  if (filterRole.value !== 'ALL') {
    params.role = filterRole.value
  }
  params.page = page.value
  params.limit = pageSize.value
  return params
}

const { data, pending } = await useAsyncData(
  'admin-users',
  () => http.get<{ code: number; message: string; data: { items: AdminUser[]; total: number } }>('/admin/users', buildFilterParams()),
  { server: false }
)

const users = computed(() => data.value?.data.items || [])
const totalUsers = computed(() => data.value?.data.total || 0)

const toast = useToast()
const { confirm } = useConfirm()

const modalOpen = ref(false)
const listLoading = ref(false)
const tableLoading = computed(() => pending.value || listLoading.value)

const searchField = ref<'username' | 'name' | 'phone'>('username')
const searchKeyword = ref('')
const searchKeywordInput = ref('')

const searchFieldOptions = [
  { label: '用户名', value: 'username' },
  { label: '姓名', value: 'name' },
  { label: '手机号', value: 'phone' }
]

const roleFilterOptions = [
  { label: '全部角色', value: 'ALL' },
  { label: '管理员', value: 'admin' },
  { label: '普通用户', value: 'user' }
]

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '普通用户', value: 'user' }
]

const filteredUsers = computed(() => {
  const list = users.value

  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return list
  }

  return list.filter((user) => {
    const field = searchField.value
    const value = (user as any)[field]
    if (value === null || value === undefined) return false
    return String(value).toLowerCase().includes(keyword)
  })
})

const clearSearch = async () => {
  searchKeywordInput.value = ''
  searchKeyword.value = ''
  filterRole.value = 'ALL'
  page.value = 1
  await reloadUsers()
}

watch(filterRole, async () => {
  try {
    listLoading.value = true
    await reloadUsers()
  } finally {
    listLoading.value = false
  }
})

const applySearch = () => {
  searchKeyword.value = searchKeywordInput.value.trim()
}

const formatDate = (value?: string) => {
  if (!value) return ''
  try {
    const d = new Date(value)
    return d.toLocaleString()
  } catch {
    return value
  }
}

const form = reactive<{
  id?: string
  username: string
  name: string
  phone: string
  role: 'admin' | 'user'
  password: string
}>({
  id: undefined,
  username: '',
  name: '',
  phone: '',
  role: 'user',
  password: ''
})

const editing = ref<AdminUser | null>(null)

const resetForm = () => {
  if (editing.value) {
    form.id = editing.value._id
    form.username = editing.value.username
    form.name = editing.value.name || ''
    form.phone = editing.value.phone || ''
    form.role = editing.value.role
    form.password = ''
  } else {
    form.id = undefined
    form.username = ''
    form.name = ''
    form.phone = ''
    form.role = 'user'
    form.password = ''
  }
}

const openCreate = () => {
  editing.value = null
  resetForm()
  modalOpen.value = true
}

const openEdit = (row: AdminUser) => {
  editing.value = row
  resetForm()
  modalOpen.value = true
}

const reloadUsers = async () => {
  const res = await http.get<{ code: number; message: string; data: { items: AdminUser[]; total: number } }>(
    '/admin/users',
    buildFilterParams()
  )
  ;(data.value as any) = res
}

const handlePageChange = async (value: number) => {
  page.value = value
  try {
    listLoading.value = true
    await reloadUsers()
  } finally {
    listLoading.value = false
  }
}

const handlePageSizeChange = async (value: number) => {
  pageSize.value = value
  page.value = 1
  try {
    listLoading.value = true
    await reloadUsers()
  } finally {
    listLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!form.username || (!editing.value && !form.password)) {
    toast.error('请填写必填字段')
    return
  }

  try {
    listLoading.value = true
    const payload = {
      username: form.username,
      name: form.name || undefined,
      phone: form.phone || undefined,
      role: form.role,
      password: editing.value ? undefined : form.password
    }

    if (editing.value && form.id) {
      await http.put('/admin/users/' + form.id, {
        name: payload.name,
        phone: payload.phone,
        role: payload.role
      })
      toast.success(`用户已更新：${form.username}`)
    } else {
      await http.post('/admin/users', payload)
      toast.success(`用户已创建：${form.username}`)
    }

    await reloadUsers()
    editing.value = null
    resetForm()
    modalOpen.value = false
  } finally {
    listLoading.value = false
  }
}

const handleDelete = async (row: AdminUser) => {
  if (row._id === currentUserId.value) {
    toast.error('不能删除当前登录的管理员')
    return
  }

  const ok = await confirm('确定要删除该用户吗？')
  if (!ok) return

  try {
    listLoading.value = true
    await http.delete('/admin/users/' + row._id)
    toast.success(`用户已删除：${row.username}`)
    await reloadUsers()
  } finally {
    listLoading.value = false
  }
}

watch(filterRole, async () => {
  try {
    page.value = 1
    listLoading.value = true
    await reloadUsers()
  } finally {
    listLoading.value = false
  }
})

const columns = [
  { key: 'username', label: '用户名', sortable: true, width: 160 },
  { key: 'name', label: '姓名', sortable: true, width: 140 },
  { key: 'role', label: '角色', sortable: true, width: 120 },
  { key: 'phone', label: '手机号', sortable: false, width: 160 },
  { key: 'createdAt', label: '创建时间', sortable: true, width: 200 }
]
</script>
