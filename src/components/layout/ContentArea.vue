<script setup lang="ts"></script>

<template>
  <div class="content-area flex-1 overflow-auto p-6 bg-secondary">
    <div class="content-wrapper">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.content-area {
  overflow-y: auto;
  padding: 2rem;
  background: var(--content-bg);
  width: 100%;
}

.content-wrapper {
  min-height: calc(100vh - 4rem);
  width: 100%;
  max-width: 100%;
}
</style>
