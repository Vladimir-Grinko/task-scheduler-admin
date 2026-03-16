<script setup lang="ts">
defineProps<{
  title?: string;
  subtitle?: string;
  fullWidth?: boolean;
}>();
</script>

<template>
  <div class="settings-card" :class="{ 'full-width': fullWidth }">
    <div class="flex items-start justify-between w-full">
      <div class="flex-1">
        <div class="flex items-start gap-4">
          <div class="icon-wrapper flex-shrink-0">
            <slot name="icon"></slot>
          </div>
          <div class="text-content flex-1">
            <h2 class="text-xl font-semibold mb-1">
              <slot name="title">{{ title }}</slot>
            </h2>
            <p class="text-secondary text-sm">
              <slot name="subtitle">{{ subtitle }}</slot>
            </p>
          </div>
        </div>
      </div>
      <div class="actions flex-shrink-0 ml-6">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-card {
  background: var(--card-bg);
  border: 1px solid var(--win-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--win-shadow);
  transition: all 0.2s ease;
  width: 100%;
  max-width: 100%;
}

.settings-card:hover {
  box-shadow: var(--win-shadow-hover);
  transform: translateY(-1px);
}

.settings-card.full-width {
  width: 100%;
  max-width: 100%;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
}

.text-content h2 {
  color: var(--win-text-primary);
}

.text-content p {
  color: var(--win-text-secondary);
  line-height: 1.5;
}
</style>
