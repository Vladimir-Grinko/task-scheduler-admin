<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAppStore } from "@/stores/appStore";
import {
  NIcon,
  NCard,
  NSwitch,
  NDivider,
  NInput,
  NFormItem,
  NButton,
  NRadioGroup,
  NRadio,
  NCheckboxGroup,
  NCheckbox,
  NAlert,
} from "naive-ui";
import {
  SettingsOutline,
  FolderOpenOutline,
  CheckmarkCircleOutline,
  TimeOutline,
} from "@vicons/ionicons5";
import SettingsCard from "../common/SettingsCard.vue";

const appStore = useAppStore();

// Реактивное состояние переключателя
const scheduleEnabled = computed({
  get: () => appStore.scheduleConfig.enabled,
  set: (value) => {
    appStore.toggleSchedule(value);
    appStore.checkForChanges();
  },
});

// Реактивное состояние пути к сетевому каталогу
const networkPath = computed({
  get: () => appStore.scheduleConfig.networkPath,
  set: (value) => {
    appStore.updateNetworkPath(value);
    appStore.checkForChanges();
  },
});

// Периодичность
const frequency = computed({
  get: () => appStore.scheduleConfig.frequency,
  set: (value) => {
    appStore.updateFrequency(value);
    appStore.checkForChanges();
  },
});

// Дни недели
const selectedDays = computed({
  get: () => appStore.scheduleConfig.selectedDays,
  set: (value) => {
    appStore.updateSelectedDays(value);
    appStore.checkForChanges();
  },
});

// Реактивное состояние переключателя
const tecList = computed(() => appStore.scheduleConfig.tecList);

// Контент второго блока зависит от состояния переключателя
const showAdvancedSettings = computed(() => appStore.scheduleConfig.enabled);

// Состояние кнопки сохранения
const hasChanges = ref(false);
const isSaving = ref(false);

// Проверка изменений
watch(
  () => appStore.scheduleConfig.hasUnsavedChanges,
  (newValue) => {
    hasChanges.value = newValue;
  },
  { immediate: true },
);

// Сохранение настроек
const saveSettings = async () => {
  isSaving.value = true;
  try {
    await appStore.saveScheduleConfig();
    // Показать уведомление об успехе
    hasChanges.value = false;
  } catch (error) {
    console.error(error);
  } finally {
    isSaving.value = false;
  }
};

// Отмена изменений
const cancelChanges = () => {
  appStore.resetScheduleConfig();
  hasChanges.value = false;
  // window.$message?.info("Изменения отменены");
};
</script>

<template>
  <div class="schedule-tab w-full">
    <h1 class="text-3xl font-bold mb-6 text-accent">Планировка загрузки</h1>
    <p class="text-secondary mb-8">
      Настройка автоматической загрузки данных с ТЭЦ
    </p>

    <div class="settings-container w-full">
      <!-- Блок 1: Тонкая настройка -->
      <SettingsCard full-width>
        <template #icon>
          <NIcon :component="SettingsOutline" :size="32" color="#0078d4" />
        </template>
        <template #title> Тонкая настройка </template>
        <template #subtitle>
          Индивидуальное планирование загрузки данных по каждой ТЭЦ
        </template>
        <template #actions>
          <div class="flex items-center gap-3">
            <span
              class="text-sm font-medium"
              :class="{
                'text-green-600': scheduleEnabled,
                'text-red-600': !scheduleEnabled,
              }"
              style="margin-right: 5px"
            >
              {{ scheduleEnabled ? "Вкл." : "Откл." }}
            </span>
            <NSwitch v-model:value="scheduleEnabled" size="large" />
          </div>
        </template>
      </SettingsCard>

      <NDivider />

      <!-- Блок 2: Путь к сетевому каталогу (показывается всегда) -->
      <NCard :bordered="false" embedded class="network-path-card">
        <div class="card-header">
          <h2 class="text-2xl font-semibold">Сетевой каталог</h2>
        </div>
        <div class="card-subtitle text-secondary mb-4">
          Укажите путь к корневому каталогу, где находятся файлы для загрузки
        </div>

        <NFormItem label="Путь к сетевому каталогу" label-placement="top">
          <div class="path-input-wrapper">
            <NIcon
              :component="FolderOpenOutline"
              :size="20"
              class="path-icon"
            />
            <NInput
              v-model:value="networkPath"
              placeholder="\\server\shared\reports или /mnt/network/reports"
              size="large"
              clearable
              @update:value="hasChanges = true"
            />
          </div>
          <template #feedback>
            <span class="text-xs text-secondary">
              Пример: \\server\shared\reports (Windows) или /mnt/network/reports
              (Linux)
            </span>
          </template>
        </NFormItem>
      </NCard>

      <NDivider />

      <!-- Блок 3: Время запуска и периодичность (показывается всегда) -->
      <NCard :bordered="false" embedded class="schedule-time-card">
        <div class="card-header">
          <h2 class="text-2xl font-semibold">Расписание загрузки</h2>
        </div>
        <div class="card-subtitle text-secondary mb-4">
          Настройте время и периодичность автоматической загрузки
        </div>

        <div class="schedule-settings">
          <!-- Выбор периодичности -->
          <NFormItem label="Периодичность" label-placement="top" class="mb-4">
            <NRadioGroup
              v-model:value="frequency"
              @update:value="hasChanges = true"
            >
              <div class="flex flex-wrap gap-4">
                <NRadio value="daily" class="radio-option">
                  <div class="radio-content">
                    <NIcon :component="TimeOutline" :size="16" />
                    <span class="radio-label">Ежедневно</span>
                  </div>
                </NRadio>
                <NRadio value="weekly" class="radio-option">
                  <div class="radio-content">
                    <NIcon :component="TimeOutline" :size="16" />
                    <span class="radio-label">По дням недели</span>
                  </div>
                </NRadio>
              </div>
            </NRadioGroup>
          </NFormItem>

          <!-- Выбор дней недели (показывается только при недельной периодичности) -->
          <NFormItem
            v-if="frequency === 'weekly'"
            label="Выберите дни недели"
            label-placement="top"
            class="mb-4"
          >
            <NCheckboxGroup
              v-model:value="selectedDays"
              @update:value="hasChanges = true"
            >
              <div class="days-grid">
                <NCheckbox value="mon" label="Пн" />
                <NCheckbox value="tue" label="Вт" />
                <NCheckbox value="wed" label="Ср" />
                <NCheckbox value="thu" label="Чт" />
                <NCheckbox value="fri" label="Пт" />
                <NCheckbox value="sat" label="Сб" />
                <NCheckbox value="sun" label="Вс" />
              </div>
            </NCheckboxGroup>
            <template #feedback>
              <span class="text-xs text-secondary">
                Выберите хотя бы один день недели
              </span>
            </template>
          </NFormItem>

          <!-- Время выполнения -->
          <NFormItem label="Время выполнения" label-placement="top">
            <div class="time-input-wrapper">
              <input
                type="time"
                v-model="appStore.scheduleConfig.scheduleTime"
                class="time-input"
                @change="hasChanges = true"
              />
              <span class="timezone-label text-secondary"
                >по Московскому времени</span
              >
            </div>
          </NFormItem>
        </div>
      </NCard>

      <NDivider v-if="showAdvancedSettings" />

      <!-- Блок 4: Настройки ТЭЦ (показывается только при включённом переключателе) -->
      <NCard
        v-if="showAdvancedSettings"
        :bordered="false"
        embedded
        class="advanced-settings-card"
      >
        <div class="card-header">
          <h2 class="text-2xl font-semibold">Настройки ТЭЦ</h2>
        </div>
        <div class="card-subtitle text-secondary mb-6">
          Выберите ТЭЦ для автоматической загрузки данных
        </div>

        <div class="tec-list space-y-3">
          <NCard
            v-for="tec in tecList"
            :key="tec.id"
            :bordered="false"
            embedded
            class="tec-card hover-lift transition-all"
          >
            <div class="flex items-center justify-between">
              <div class="tec-info">
                <h3 class="font-semibold">{{ tec.name }}</h3>
                <p class="text-sm text-secondary mt-1">{{ tec.code }}</p>
              </div>
              <NSwitch
                :value="tec.enabled"
                @update:value="
                  () => {
                    appStore.toggleTEC(tec.id);
                    hasChanges = true;
                  }
                "
              />
            </div>
          </NCard>
        </div>
      </NCard>

      <!-- <NDivider /> -->

      <NAlert v-if="hasChanges" type="warning" class="warning-alert" closable>
        У вас есть несохранённые изменения. Не забудьте сохранить настройки!
      </NAlert>

      <!-- Блок кнопок сохранения -->
      <div class="action-buttons" v-if="hasChanges">
        <NButton
          type="primary"
          :loading="isSaving"
          @click="saveSettings"
          class="save-button"
        >
          <template #icon>
            <NIcon :component="CheckmarkCircleOutline" />
          </template>
          Сохранить
        </NButton>
        <NButton type="default" @click="cancelChanges" class="cancel-button">
          Отменить
        </NButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-tab {
  min-height: calc(100vh - 4rem);
  width: 100%;
}

.settings-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0rem;
}

/* Общие стили для карточек на всю ширину */
:deep(.n-card) {
  width: 100% !important;
  max-width: 100% !important;
}

.network-path-card,
.schedule-time-card,
.advanced-settings-card {
  width: 100% !important;
  background: var(--card-bg);
  border: 1px solid var(--win-border);
  border-radius: 12px;
  padding: 0rem;
  box-shadow: var(--win-shadow);
  transition: all 0.2s ease;
}

.network-path-card:hover,
.schedule-time-card:hover,
.advanced-settings-card:hover {
  box-shadow: var(--win-shadow-hover);
}

.card-header {
  margin-bottom: 0.5rem;
}

.card-subtitle {
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Сетевой каталог */
.path-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.path-icon {
  color: var(--win-accent);
  flex-shrink: 0;
}

:deep(.n-input) {
  width: 100% !important;
}

/* Расписание */
.schedule-settings {
  width: 100%;
}

/* Радио кнопки периодичности */
:deep(.n-radio-group) {
  width: 100%;
}

.radio-option {
  margin-right: 1rem;
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.radio-label {
  font-size: 0.95rem;
}

/* Дни недели */
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
}

:deep(.n-checkbox) {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Время запуска */
.time-input-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

.time-input-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.time-input {
  padding: 0.75rem 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  border: 2px solid var(--win-border);
  border-radius: 8px;
  background: white;
  color: var(--win-text-primary);
  min-width: 120px;
  transition: all 0.2s ease;
  width: auto;
}

.time-input:focus {
  outline: none;
  border-color: var(--win-accent);
  box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
}

.time-input:disabled {
  background: var(--win-bg-tertiary);
  color: var(--win-text-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

.timezone-label {
  font-size: 0.875rem;
}

/* Настройки ТЭЦ */
.tec-list {
  width: 100%;
  max-width: 100%;
}

.tec-card {
  background: var(--card-bg);
  border: 1px solid var(--win-border);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
  width: 100%;
}

.tec-card:hover {
  border-color: var(--win-accent);
  box-shadow: var(--win-shadow-hover);
  transform: translateX(4px);
}

.tec-info h3 {
  font-size: 1.125rem;
}

/* Кнопки действий */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: absolute;
  top: 50%;
  left: 55px;
}

.save-button {
  width: 180px;
  height: 50px;
  align-self: flex-start;
}
.cancel-button {
  width: 100%;
  max-width: 300px;
  align-self: flex-start;
}

.warning-alert {
  max-width: 600px;
  align-self: flex-end;
  position: absolute;
  top: 3%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
