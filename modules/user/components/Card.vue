<template>
  <div class="user-card">
    <h3>{{ user.name }}</h3>
    <p>Role: {{ user.role }}</p>
  </div>
</template>

<script setup lang="ts">
const user = useUser()
</script>

<style scoped>
.user-card {
  border: 1px solid var(--border-color);
  padding: 1rem;
  border-radius: 8px;
  background-color: var(--card-bg);
  color: var(--text-color);
}
</style>
