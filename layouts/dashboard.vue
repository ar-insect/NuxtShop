<template>
  <div class="min-h-screen font-sans" :style="{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }">
    <div class="flex h-screen overflow-hidden">
      <!-- Sidebar -->
      <aside
        class="hidden w-64 flex-col overflow-y-auto border-r md:flex"
        :style="{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }"
      >
        <div class="flex h-16 items-center justify-center border-b px-6" :style="{ borderColor: 'var(--border-color)' }">
          <NuxtLink to="/" class="text-xl font-bold" :style="{ color: 'var(--primary-color)' }">NuxtShop</NuxtLink>
        </div>
        <div class="flex flex-1 flex-col overflow-y-auto">
          <nav class="flex-1 space-y-1 px-2 py-4">
            <NuxtLink
              to="/"
              class="group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-black/5"
              :style="{ color: 'var(--text-secondary)' }"
              active-class="bg-[var(--primary-color)]/10 text-[var(--primary-color)]"
            >
              <SvgIcon name="home" class="mr-3 h-6 w-6 flex-shrink-0" :style="{ color: 'var(--text-secondary)' }" />
              首页
            </NuxtLink>

            <NuxtLink
              to="/profile"
              class="group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-black/5"
              :style="{ color: 'var(--text-secondary)' }"
              active-class="bg-[var(--primary-color)]/10 text-[var(--primary-color)]"
            >
              <SvgIcon name="user" class="mr-3 h-6 w-6 flex-shrink-0" :style="{ color: 'var(--text-secondary)' }" />
              个人中心
            </NuxtLink>

            <NuxtLink
              to="/cart"
              class="group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-black/5"
              :style="{ color: 'var(--text-secondary)' }"
              active-class="bg-[var(--primary-color)]/10 text-[var(--primary-color)]"
            >
              <SvgIcon name="shopping-cart" class="mr-3 h-6 w-6 flex-shrink-0" :style="{ color: 'var(--text-secondary)' }" />
              购物车
            </NuxtLink>

            <NuxtLink
              to="/wishlist"
              class="group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-black/5"
              :style="{ color: 'var(--text-secondary)' }"
              active-class="bg-[var(--primary-color)]/10 text-[var(--primary-color)]"
            >
              <SvgIcon name="heart" class="mr-3 h-6 w-6 flex-shrink-0" :style="{ color: 'var(--text-secondary)' }" />
              收藏夹
            </NuxtLink>
          </nav>
        </div>
      </aside>

      <!-- Main content -->
      <div class="flex flex-1 flex-col overflow-hidden">
        <header class="flex h-16 items-center justify-between border-b px-6" :style="{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }">
          <div class="flex items-center md:hidden">
            <button class="focus:outline-none lg:hidden" :style="{ color: 'var(--text-secondary)' }">
              <SvgIcon name="bars-3" class="h-6 w-6" />
            </button>
            <span class="ml-4 text-lg font-bold">NuxtShop</span>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6" :style="{ backgroundColor: 'var(--bg-color)' }">
          <slot />
        </main>
      </div>
    </div>
    
    <BaseToast />
    <BaseModal />
  </div>
</template>
