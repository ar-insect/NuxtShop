import { computed } from 'vue'
import type { UserPublic } from '~/types/api'
import { useAuth } from '~/composables/useAuth'

export const useAdminPermission = () => {
  const { user } = useAuth()

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isSuperAdmin = computed(() => !!user.value?.isSuperAdmin)

  const canManageAdmins = computed(() => isSuperAdmin.value)
  const canManageSystemSettings = computed(() => isSuperAdmin.value)

  const canDeleteAdmin = (target: Pick<UserPublic, '_id'>) => {
    if (!isSuperAdmin.value || !user.value?._id) return false
    return target._id !== user.value._id
  }

  return {
    isAdmin,
    isSuperAdmin,
    canManageAdmins,
    canManageSystemSettings,
    canDeleteAdmin
  }
}

