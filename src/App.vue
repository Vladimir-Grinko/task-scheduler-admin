<script setup lang="ts">
import {
  NConfigProvider,
  NMessageProvider,
  NNotificationProvider,
  NDialogProvider,
  NLoadingBarProvider,
} from "naive-ui";
import AppLayout from "./components/layout/AppLayout.vue";
import { onMounted } from "vue";
import { useAppStore } from "@/stores/appStore";

const appStore = useAppStore();

// Загружаем конфигурацию при монтировании приложения
onMounted(() => {
  appStore.loadConfigFromStorage();

  appStore.loadNotificationsFromStorage();
});
</script>

<template>
  <NConfigProvider>
    <NDialogProvider>
      <NNotificationProvider>
        <NMessageProvider>
          <NLoadingBarProvider>
            <AppLayout />
          </NLoadingBarProvider>
        </NMessageProvider>
      </NNotificationProvider>
    </NDialogProvider>
  </NConfigProvider>
</template>
