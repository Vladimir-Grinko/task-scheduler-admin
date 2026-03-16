<script setup lang="ts">
import { RouterView } from "vue-router";
import NavigationPanel from "./NavigationPanel.vue";
import ContentArea from "./ContentArea.vue";
</script>

<template>
  <div class="app-layout h-full flex bg-primary">
    <!-- Левая навигационная панель -->
    <NavigationPanel />

    <!-- Основная область контента -->
    <ContentArea>
      <RouterView />
    </ContentArea>
  </div>
</template>

<style scoped>
.app-layout {
  height: 100vh;
  overflow: hidden;
  width: 90vw;
}
</style>
