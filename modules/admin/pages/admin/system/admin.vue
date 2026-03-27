<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-[var(--text-color)]">
        {{ t('admin.system.admin.title') }}
      </h1>
    </div>

    <BaseCard class="p-4 space-y-4">
      <div class="flex flex-col">
        <div class="flex items-center justify-between">
          <p class="text-sm text-[var(--text-secondary)]">
            {{ t('admin.system.admin.total', { count: totalAdmins }) }}
          </p>
          <BaseButton
            v-if="isSuperAdmin"
            size="sm"
            variant="primary"
            @click="openCreate"
          >
            {{ t('admin.system.admin.createButton') }}
          </BaseButton>
        </div>

        <div class="rounded-md bg-[var(--muted-bg)]/40 px-3 py-3">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-4 items-end">
            <div class="md:col-span-3">
              <BaseInput
                v-model="searchKeywordInput"
                class="h-8"
                clearable
                :placeholder="t('admin.system.admin.searchPlaceholder')"
                @keyup.enter="applySearch"
              />
            </div>
            <div class="flex gap-2 justify-end md:col-span-1">
              <BaseButton size="sm" variant="primary" @click="applySearch">
                {{ t('admin.system.admin.search') }}
              </BaseButton>
              <BaseButton size="sm" variant="secondary" @click="clearSearch">
                {{ t('admin.system.admin.reset') }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <AdminTable
        :columns="columns"
        :rows="filteredAdmins"
        :loading="tableLoading"
        :page-size="pageSize"
        :total="totalAdmins"
        server-side
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      >
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
            <BaseButton
              v-if="isSuperAdmin"
              size="xs"
              variant="outline"
              class="px-2"
              @click.stop="openEdit(row)"
            >
              {{ t('admin.common.edit') }}
            </BaseButton>
            <BaseButton
              v-if="isSuperAdmin"
              size="xs"
              variant="outline"
              class="px-2"
              @click.stop="openResetPassword(row)"
            >
              {{ t('admin.system.admin.resetModalTitle') }}
            </BaseButton>
            <BaseTooltip
              v-if="isSuperAdmin"
              :text="!canDeleteAdmin(row) ? t('admin.system.admin.deleteDisabledHint') : ''"
            >
              <BaseButton
                size="xs"
                variant="outline"
                class="px-2 text-red-600 hover:bg-red-50 hover:border-red-200"
                :disabled="!canDeleteAdmin(row)"
                @click.stop="handleDelete(row)"
              >
                {{ t('admin.common.delete') }}
              </BaseButton>
            </BaseTooltip>
          </AdminRowActions>
        </template>
      </AdminTable>
    </BaseCard>

    <!-- 新增/编辑管理员 -->
    <BaseModal
      v-model="modalOpen"
      :title="editing ? t('admin.system.admin.modalTitleEdit') : t('admin.system.admin.modalTitleCreate')"
      :close-on-mask="false"
      draggable
      enable-fullscreen
    >
      <form class="grid gap-4 md:grid-cols-2" @submit.prevent="handleSubmit">
        <AdminFormField
          v-model="form.username"
          required
          :label="t('admin.system.admin.fieldUsername')"
          :placeholder="t('admin.system.admin.fieldUsernamePlaceholder')"
          :disabled="!!editing"
        />
        <AdminFormField
          v-model="form.name"
          :label="t('admin.system.admin.fieldName')"
          :placeholder="t('admin.system.admin.fieldNamePlaceholder')"
        />
        <AdminFormField
          v-model="form.phone"
          :label="t('admin.system.admin.fieldPhone')"
          :placeholder="t('admin.system.admin.fieldPhonePlaceholder')"
        />
        <AdminFormField
          v-if="!editing"
          v-model="form.password"
          required
          type="password"
          :label="t('admin.system.admin.fieldPassword')"
          :placeholder="t('admin.system.admin.fieldPasswordPlaceholder')"
        />
      </form>
      <template #footer>
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="listLoading"
          @click="modalOpen = false"
        >
          {{ t('admin.system.admin.modalCancel') }}
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :loading="listLoading"
          :disabled="listLoading"
          @click="handleSubmit"
        >
          {{ editing ? t('admin.system.admin.modalSubmitEdit') : t('admin.system.admin.modalSubmitCreate') }}
        </BaseButton>
      </template>
    </BaseModal>

    <!-- 重置密码 -->
    <BaseModal
      v-model="resetModalOpen"
      :title="t('admin.system.admin.resetModalTitle')"
      :close-on-mask="false"
      draggable
    >
      <form class="space-y-4" @submit.prevent="handleResetSubmit">
        <p class="text-sm text-[var(--text-secondary)]">
          {{ t('admin.system.admin.resetCurrentAccountPrefix') }}<span class="font-medium text-[var(--text-color)]">{{ resetTarget?.username }}</span>
        </p>
        <AdminFormField
          v-model="resetPassword"
          required
          type="password"
          :label="t('admin.system.admin.resetFieldPassword')"
          :placeholder="t('admin.system.admin.resetFieldPasswordPlaceholder')"
        />
      </form>
      <template #footer>
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="listLoading"
          @click="resetModalOpen = false"
        >
          {{ t('admin.system.admin.resetModalCancel') }}
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :loading="listLoading"
          :disabled="listLoading"
          @click="handleResetSubmit"
        >
          {{ t('admin.system.admin.resetModalSubmit') }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import AdminTable from '~/modules/admin/components/AdminTable.vue'
import AdminFormField from '~/modules/admin/components/AdminFormField.vue'
import AdminRowActions from '~/modules/admin/components/AdminRowActions.vue'
import BaseTooltip from '~/components/ui/BaseTooltip.vue'
import { http } from '~/utils/http'
import type { UserPublic } from '~/types/api'
import { useAdminPermission } from '~/modules/admin/composables/useAdminPermission'
import { useI18n } from '~/composables/useI18n'
import { useLocaleFormatter } from '~/composables/useLocaleFormatter'

definePageMeta({
  name: 'AdminSystemAdminPage',
  middleware: ['auth', 'admin' as never],
  layout: 'admin'
})

interface AdminUser extends UserPublic {
  createdAt?: string
}

const { isSuperAdmin, canDeleteAdmin } = useAdminPermission()
const { t } = useI18n()
const { formatDateTime } = useLocaleFormatter()

const page = ref(1)
const pageSize = ref(10)

const buildFilterParams = () => {
  const params: Record<string, string | number> = {
    role: 'admin',
    page: page.value,
    limit: pageSize.value
  }
  if (searchKeyword.value) {
    params.keyword = searchKeyword.value
  }
  return params
}

const { data, pending } = await useAsyncData(
  'admin-system-admins',
  () => http.get<{ code: number; message: string; data: { items: AdminUser[]; total: number } }>(
    '/admin/users',
    buildFilterParams()
  ),
  { server: false }
)

const admins = computed(() => data.value?.data.items || [])
const totalAdmins = computed(() => data.value?.data.total || 0)

const toast = useToast()
const { confirm } = useConfirm()

const modalOpen = ref(false)
const resetModalOpen = ref(false)
const listLoading = ref(false)
const tableLoading = computed(() => pending.value || listLoading.value)

const searchKeyword = ref('')
const searchKeywordInput = ref('')

const filteredAdmins = computed(() => {
  const list = admins.value
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return list

  return list.filter((user) => {
    const candidates = [user.username, user.name, user.phone]
    return candidates.some((v) => v && String(v).toLowerCase().includes(keyword))
  })
})

const clearSearch = async () => {
  searchKeywordInput.value = ''
  searchKeyword.value = ''
  page.value = 1
  await reloadAdmins()
}

const applySearch = async () => {
  searchKeyword.value = searchKeywordInput.value.trim()
  page.value = 1
  await reloadAdmins()
}

const reloadAdmins = async () => {
  const res = await http.get<{ code: number; message: string; data: { items: AdminUser[]; total: number } }>(
    '/admin/users',
    buildFilterParams()
  )
  ;(data.value as any) = res
}

onMounted(async () => {
  if (!admins.value.length && !pending.value) {
    try {
      listLoading.value = true
      await reloadAdmins()
    } finally {
      listLoading.value = false
    }
  }
})

const handlePageChange = async (value: number) => {
  page.value = value
  try {
    listLoading.value = true
    await reloadAdmins()
  } finally {
    listLoading.value = false
  }
}

const handlePageSizeChange = async (value: number) => {
  pageSize.value = value
  page.value = 1
  try {
    listLoading.value = true
    await reloadAdmins()
  } finally {
    listLoading.value = false
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  return formatDateTime(dateStr)
}

const form = reactive({
  username: '',
  name: '',
  phone: '',
  password: ''
})

const editing = ref<AdminUser | null>(null)

const openCreate = () => {
  editing.value = null
  form.username = ''
  form.name = ''
  form.phone = ''
  form.password = ''
  modalOpen.value = true
}

const openEdit = (row: AdminUser) => {
  editing.value = row
  form.username = row.username
  form.name = row.name || ''
  form.phone = row.phone || ''
  form.password = ''
  modalOpen.value = true
}

const handleSubmit = async () => {
  if (listLoading.value) return
  if (!form.username) {
    toast.error(t('admin.system.admin.errorUsernameRequired'))
    return
  }
  if (!editing.value && (!form.password || form.password.length < 6)) {
    toast.error(t('admin.system.admin.errorPasswordShort'))
    return
  }

  const payload: any = {
    username: form.username,
    name: form.name,
    phone: form.phone,
    role: 'admin'
  }
  if (!editing.value) payload.password = form.password

  try {
    listLoading.value = true
    if (!editing.value) {
      await http.post('/admin/users', payload)
      toast.success(t('admin.system.admin.createSuccess'))
    } else {
      await http.put(`/admin/users/${editing.value._id}`, {
        name: payload.name,
        phone: payload.phone
      })
      toast.success(t('admin.system.admin.updateSuccess'))
    }
    modalOpen.value = false
    await reloadAdmins()
  } finally {
    listLoading.value = false
  }
}

const handleDelete = async (row: AdminUser) => {
  if (listLoading.value) return
  const ok = await confirm(t('admin.system.admin.deleteConfirm'))
  if (!ok) return

  try {
    listLoading.value = true
    await http.delete(`/admin/users/${row._id}`)
    toast.success(t('admin.system.admin.deleteSuccess'))
    await reloadAdmins()
  } finally {
    listLoading.value = false
  }
}

const resetTarget = ref<AdminUser | null>(null)
const resetPassword = ref('')

const openResetPassword = (row: AdminUser) => {
  resetTarget.value = row
  resetPassword.value = ''
  resetModalOpen.value = true
}

const handleResetSubmit = async () => {
  if (listLoading.value) return
  if (!resetTarget.value) return
  if (!resetPassword.value || resetPassword.value.length < 6) {
    toast.error(t('admin.system.admin.resetErrorPasswordShort'))
    return
  }

  try {
    listLoading.value = true
    await http.put(`/admin/users/${resetTarget.value._id}`, {
      password: resetPassword.value
    })
    toast.success(t('admin.system.admin.resetSuccess'))
    resetModalOpen.value = false
  } finally {
    listLoading.value = false
  }
}

const columns = computed(() => [
  { key: 'username', label: t('admin.system.admin.tableColumnUsername'), sortable: true, width: 180 },
  { key: 'name', label: t('admin.system.admin.tableColumnName'), sortable: true, width: 160 },
  { key: 'phone', label: t('admin.system.admin.tableColumnPhone'), sortable: false, width: 160 },
  { key: 'createdAt', label: t('admin.system.admin.tableColumnCreatedAt'), sortable: true, width: 200 }
])
</script>
