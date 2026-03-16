<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAppStore } from "@/stores/appStore";
import { NIcon } from "naive-ui";
import {
  CalendarOutline as ScheduleIcon,
  CloudUploadOutline as ManualIcon,
  NotificationsOutline as NotificationsIcon,
} from "@vicons/ionicons5";

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();

const tabs = computed(() => appStore.tabs);
// Определяем активный таб на основе текущего маршрута
const activeTabId = computed(() => {
  const currentPath = route.path;
  const currentTab = tabs.value.find((tab) => tab.route === currentPath);
  return currentTab?.id || "schedule";
});

// Иконки для табов
const getIconComponent = (iconName: string) => {
  const icons: any = {
    schedule: ScheduleIcon,
    manual: ManualIcon,
    notifications: NotificationsIcon,
  };
  return icons[iconName] || ScheduleIcon;
};

// Обработка клика по табу
const handleTabClick = (tab: any) => {
  router.push(tab.route);
};
</script>

<template>
  <div
    class="navigation-panel w-64 bg-primary border-r border-default h-full p-4"
  >
    <div class="logo-section mb-8">
      <h1 class="text-2xl font-bold text-accent"></h1>
      <p class="text-sm text-secondary mt-1">Панель управления</p>
    </div>

    <div class="tabs-grid">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item"
        :class="{
          active: activeTabId === tab.id,
          'hover-lift': true,
        }"
        @click="handleTabClick(tab)"
      >
        <div class="tab-icon">
          <NIcon :component="getIconComponent(tab.icon)" :size="48" />
        </div>
        <div class="tab-info">
          <h3 class="tab-title font-semibold">{{ tab.name }}</h3>
          <p
            v-if="tab.description"
            class="tab-description text-sm text-secondary"
          >
            {{ tab.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.navigation-panel {
  display: flex;
  flex-direction: column;
  background: var(--nav-bg);
  border-right: 1px solid var(--win-border);
  padding: 1.5rem;
}

.tabs-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--nav-item-bg);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.tab-item:hover {
  background: var(--nav-item-hover);
  transform: translateX(4px);
}

.tab-item.active {
  background: var(--nav-item-active);
  border-color: var(--win-accent);
  box-shadow: 0 2px 8px rgba(0, 120, 212, 0.2);
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  color: var(--win-accent);
}

.tab-info {
  flex: 1;
}

.tab-title {
  font-size: 1rem;
  color: var(--win-text-primary);
  margin-bottom: 0.25rem;
}

.tab-description {
  font-size: 0.875rem;
  line-height: 1.4;
}
</style>
