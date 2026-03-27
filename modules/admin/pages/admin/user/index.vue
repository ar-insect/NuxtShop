<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-[var(--text-color)]">
        {{ t('admin.user.list.title') }}
      </h1>
    </div>

    <ClientOnly>
      <BaseCard class="p-4 space-y-4">
        <div class="flex flex-col">
        <div class="flex items-center justify-between">
          <p class="text-sm text-[var(--text-secondary)]">
            {{ t('admin.user.list.total', { count: totalUsers }) }}
          </p>
          <BaseButton size="sm" variant="primary" @click="openCreate">
            {{ t('admin.user.list.createButton') }}
          </BaseButton>
        </div>

        <AdminSearchPanel
          :search-label="t('admin.common.search')"
          :reset-label="t('admin.common.reset')"
          @search="applySearch"
          @reset="clearSearch"
        >
          <template #primary>
            <div class="md:w-40">
              <BaseSelect
                v-model="filterRole"
                :options="roleFilterOptions"
                :placeholder="t('admin.user.list.rolePlaceholder')"
                size="sm"
              />
            </div>
            <div class="md:w-40">
              <BaseSelect
                v-model="searchField"
                :options="searchFieldOptions"
                :placeholder="t('admin.user.list.searchFieldPlaceholder')"
                size="sm"
              />
            </div>
            <div class="flex-1 min-w-[220px]">
              <BaseInput
                v-model="searchKeywordInput"
                class="h-8 w-full"
                clearable
                :placeholder="t('admin.user.list.searchKeywordPlaceholder')"
                @keyup.enter="applySearch"
              />
            </div>
          </template>
        </AdminSearchPanel>
      </div>

      <AdminTable
        :columns="columns"
        :rows="filteredUsers"
        :loading="tableLoading"
        :page-size="pageSize"
        :total="totalUsers"
        server-side
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      >
        <template #cell-role="{ value }">
          <AdminTag
            :label="value === 'admin' ? t('admin.user.list.roleTagAdmin') : t('admin.user.list.roleTagUser')"
            :status="value === 'admin' ? 'primary' : 'muted'"
            size="sm"
          />
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
          <AdminRowActions>
            <BaseButton size="xs" variant="outline" class="px-2" @click.stop="openEdit(row)">
              {{ t('admin.common.edit') }}
            </BaseButton>
            <BaseTooltip
              :text="row._id === currentUserId || row.role === 'admin' ? t('admin.user.list.deleteDisabledHint') : ''"
            >
              <BaseButton
                size="xs"
                variant="outline"
                class="px-2 text-red-600 hover:bg-red-50 hover:border-red-200"
                :disabled="row._id === currentUserId || row.role === 'admin'"
                @click.stop="handleDelete(row)"
              >
                {{ t('admin.common.delete') }}
              </BaseButton>
            </BaseTooltip>
          </AdminRowActions>
        </template>
        </AdminTable>
      </BaseCard>

      <BaseModal
        v-model="modalOpen"
        :title="editing ? t('admin.user.list.modalTitleEdit') : t('admin.user.list.modalTitleCreate')"
        :close-on-mask="false"
        draggable
        enable-fullscreen
      >
      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="handleSubmit">
        <AdminFormField
          v-model="form.username"
          required
          :label="t('admin.user.list.fieldUsername')"
          :placeholder="t('admin.user.list.fieldUsernamePlaceholder')"
          :disabled="!!editing"
        />
        <AdminFormField
          v-model="form.name"
          :label="t('admin.user.list.fieldName')"
          :placeholder="t('admin.user.list.fieldNamePlaceholder')"
        />
        <AdminFormField
          v-model="form.phone"
          :label="t('admin.user.list.fieldPhone')"
          :placeholder="t('admin.user.list.fieldPhonePlaceholder')"
        />
        <AdminFormField
          v-model="form.role"
          required
          :label="t('admin.user.list.fieldRole')"
          component="select"
          :options="roleOptions"
        />
        <AdminFormField
          v-if="!editing"
          v-model="form.password"
          required
          type="password"
          :label="t('admin.user.list.fieldPassword')"
          :placeholder="t('admin.user.list.fieldPasswordPlaceholder')"
        />
      </form>
        <template #footer>
          <BaseButton
            variant="secondary"
            size="sm"
            :disabled="listLoading"
            @click="modalOpen = false"
          >
            {{ t('admin.user.list.modalCancel') }}
          </BaseButton>
          <BaseButton
            variant="primary"
            size="sm"
            :loading="listLoading"
            :disabled="listLoading"
            @click="handleSubmit"
          >
            {{ editing ? t('admin.user.list.modalSubmitEdit') : t('admin.user.list.modalSubmitCreate') }}
          </BaseButton>
        </template>
      </BaseModal>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import AdminTable from '~/modules/admin/components/AdminTable.vue'
import AdminTag from '~/modules/admin/components/AdminTag.vue'
import AdminFormField from '~/modules/admin/components/AdminFormField.vue'
import AdminSearchPanel from '~/modules/admin/components/AdminSearchPanel.vue'
import AdminRowActions from '~/modules/admin/components/AdminRowActions.vue'
import BaseTooltip from '~/components/ui/BaseTooltip.vue'
import { useAdminTable } from '~/modules/admin/composables/useAdminTable'
import type { AdminSearchQuery } from '~/types/admin'
import type { ApiResponse } from '~/types/common'
import { http } from '~/utils/http'
import type { UserPublic } from '~/types/api'
import { useI18n } from '~/composables/useI18n'

definePageMeta({
  name: 'AdminUserListPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})

interface AdminUser extends UserPublic {
  createdAt?: string
  orderCount?: number
  totalSpent?: number
}

const { user } = useAuth()
const currentUserId = computed(() => user.value?._id)
const { t } = useI18n()

const filterRole = ref<'ALL' | 'admin' | 'user'>('ALL')

const searchField = ref<'username' | 'name' | 'phone'>('username')
const searchKeyword = ref('')
const searchKeywordInput = ref('')

const {
  page,
  pageSize,
  items: users,
  total: totalUsers,
  listLoading,
  tableLoading,
  reload,
  handlePageChange,
  handlePageSizeChange
} = useAdminTable<AdminUser>({
  key: 'admin-users',
  endpoint: '/admin/users',
  getFilterParams: () => {
    const params: AdminSearchQuery & Record<string, string | number> = {}
    if (filterRole.value !== 'ALL') {
      params.role = filterRole.value
    }
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.trim()
      const field = searchField.value
      params.keyword = keyword
      params.field = field
    }
    return params
  }
})

const toast = useToast()
const { confirm } = useConfirm()

const modalOpen = ref(false)

const searchFieldOptions = computed(() => [
  { label: t('admin.user.list.searchFieldUsername'), value: 'username' },
  { label: t('admin.user.list.searchFieldName'), value: 'name' },
  { label: t('admin.user.list.searchFieldPhone'), value: 'phone' }
])

const roleFilterOptions = computed(() => [
  { label: t('admin.user.list.roleAll'), value: 'ALL' },
  { label: t('admin.user.list.roleAdmin'), value: 'admin' },
  { label: t('admin.user.list.roleUser'), value: 'user' }
])

const roleOptions = computed(() => [
  { label: t('admin.user.list.roleAdmin'), value: 'admin' },
  { label: t('admin.user.list.roleUser'), value: 'user' }
])

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
  await reload()
}

const applySearch = () => {
  searchKeyword.value = searchKeywordInput.value.trim()
  page.value = 1
  reload()
}

const formatDate = (value?: string) => {
  if (!value) return ''
  try {
    const iso = String(value)
    return iso.replace('T', ' ').slice(0, 16)
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

const handleSubmit = async () => {
  if (!form.username || (!editing.value && !form.password)) {
    toast.error(t('admin.user.list.errorRequired'))
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
      toast.success(t('admin.user.list.updateSuccess', { username: form.username }))
    } else {
      await http.post('/admin/users', payload)
      toast.success(t('admin.user.list.createSuccess', { username: form.username }))
    }

    await reload()
    editing.value = null
    resetForm()
    modalOpen.value = false
  } finally {
    listLoading.value = false
  }
}

const handleDelete = async (row: AdminUser) => {
  if (row._id === currentUserId.value) {
    toast.error(t('admin.user.list.errorDeleteSelf'))
    return
  }

  const ok = await confirm(t('admin.user.list.deleteConfirm'))
  if (!ok) return

  try {
    listLoading.value = true
    await http.delete<ApiResponse<{ deleted: boolean }>>('/admin/users/' + row._id)
    toast.success(t('admin.user.list.deleteSuccess', { username: row.username }))
    await reload()
  } finally {
    listLoading.value = false
  }
}

watch(filterRole, async () => {
  try {
    page.value = 1
    listLoading.value = true
    await reload()
  } finally {
    listLoading.value = false
  }
})

const columns = computed(() => [
  { key: 'username', label: t('admin.user.list.tableColumnUsername'), sortable: true, width: 180 },
  { key: 'name', label: t('admin.user.list.tableColumnName'), sortable: true, width: 160 },
  { key: 'role', label: t('admin.user.list.tableColumnRole'), sortable: true, width: 120 },
  { key: 'phone', label: t('admin.user.list.tableColumnPhone'), sortable: false, width: 160 },
  { key: 'orderCount', label: t('admin.user.list.tableColumnOrderCount'), sortable: false, width: 120, align: 'right' as const, minWidth: 100 },
  { key: 'totalSpent', label: t('admin.user.list.tableColumnTotalSpent'), sortable: false, width: 140, align: 'right' as const, minWidth: 120 },
  { key: 'createdAt', label: t('admin.user.list.tableColumnCreatedAt'), sortable: true, width: 200 }
])
</script>
