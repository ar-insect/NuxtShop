import { ref, computed } from 'vue'
import { http } from '~/utils/http'

interface UseAdminTableOptions {
  key: string
  endpoint: string
  getFilterParams?: () => Record<string, string | number>
  defaultPageSize?: number
}

export function useAdminTable<T>(options: UseAdminTableOptions) {
  const page = ref(1)
  const pageSize = ref(options.defaultPageSize || 10)

  const buildParams = () => {
    const params: Record<string, string | number> = {
      page: page.value,
      limit: pageSize.value
    }

    if (options.getFilterParams) {
      Object.assign(params, options.getFilterParams())
    }

    return params
  }

  const { data, pending } = useAsyncData(
    options.key,
    () =>
      http.get<{ code: number; message: string; data: { items: T[]; total: number } }>(
        options.endpoint,
        buildParams()
      ),
    {
      server: false,
      lazy: true
    }
  )

  const items = computed<T[]>(() => data.value?.data.items || [])
  const total = computed<number>(() => data.value?.data.total || 0)

  const listLoading = ref(false)
  const tableLoading = computed(() => listLoading.value)

  const reload = async () => {
    const res = await http.get<{ code: number; message: string; data: { items: T[]; total: number } }>(
      options.endpoint,
      buildParams()
    )
    ;(data.value as any) = res
  }

  const handlePageChange = async (value: number) => {
    page.value = value
    try {
      listLoading.value = true
      await reload()
    } finally {
      listLoading.value = false
    }
  }

  const handlePageSizeChange = async (value: number) => {
    pageSize.value = value
    page.value = 1
    try {
      listLoading.value = true
      await reload()
    } finally {
      listLoading.value = false
    }
  }

  return {
    page,
    pageSize,
    items,
    total,
    pending,
    listLoading,
    tableLoading,
    reload,
    handlePageChange,
    handlePageSizeChange
  }
}
