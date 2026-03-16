<script setup lang="ts">
import { ref, computed } from "vue";
import { useAppStore } from "@/stores/appStore";
import {
  NIcon,
  NCard,
  NDivider,
  NInput,
  NFormItem,
  NButton,
  NCheckbox,
  NAlert,
  useLoadingBar,
  NTag,
} from "naive-ui";
import {
  FolderOpenOutline,
  CloudUploadOutline,
  CheckmarkCircleOutline,
  ReloadOutline,
} from "@vicons/ionicons5";

const appStore = useAppStore();
const loadingBar = useLoadingBar();

// Состояние пути к сетевому каталогу
const networkPath = ref("\\server\shared\reports");

// Выбранные ТЭЦ для загрузки
const selectedTECs = ref<number[]>([]);

// Состояние загрузки
const isLoading = ref(false);
const uploadResult = ref<{ success: boolean; message: string } | null>(null);

// Все ТЭЦ с учётом статуса загрузки
const tecList = computed(() => appStore.getTECsForManualUpload);

// Проверка, выбраны ли ТЭЦ
const hasSelectedTECs = computed(() => selectedTECs.value.length > 0);

// Обработчик выбора/снятия выбора ТЭЦ
const toggleTECSelection = (tecId: number) => {
  // Нельзя выбрать уже загруженную ТЭЦ
  if (appStore.isTECLoaded(tecId)) return;

  const index = selectedTECs.value.indexOf(tecId);
  if (index > -1) {
    selectedTECs.value.splice(index, 1);
  } else {
    selectedTECs.value.push(tecId);
  }
};

// Проверка, выбрана ли конкретная ТЭЦ
const isTECSelected = (tecId: number) => {
  return selectedTECs.value.includes(tecId);
};

// Загрузка данных
const uploadData = async () => {
  if (!hasSelectedTECs.value) return;

  isLoading.value = true;
  uploadResult.value = null;

  loadingBar.start();

  try {
    // Имитация загрузки (заменить на реальный вызов API)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Здесь будет реальная логика загрузки
    console.log("Загрузка данных для ТЭЦ:", selectedTECs.value);
    console.log("Путь к сетевому каталогу:", networkPath.value);

    // Помечаем ТЭЦ как загруженные
    appStore.markTECsAsLoaded(selectedTECs.value);
    // Добавляем уведомление
    appStore.addUploadNotification(
      {
        totalFiles: 8,
        successful: 8,
        failed: 0,
        totalSize: 25600000,
        duration: 4500,
      },
      selectedTECs.value,
      tecList.value,
    );

    uploadResult.value = {
      success: true,
      message: `Данные успешно загружены для ${selectedTECs.value.length} ТЭЦ`,
    };

    // Очистка после успешной загрузки
    selectedTECs.value = [];

    loadingBar.finish();
  } catch (error) {
    uploadResult.value = {
      success: false,
      message:
        "Ошибка при загрузке данных. Проверьте путь к сетевому каталогу.",
    };

    loadingBar.error();
  } finally {
    isLoading.value = false;
  }
};

// Выбор всех незагруженных ТЭЦ
const selectAllTECs = () => {
  selectedTECs.value = tecList.value
    .filter((tec) => !tec.isLoaded)
    .map((tec) => tec.id);
};

// Снятие выбора всех ТЭЦ
const deselectAllTECs = () => {
  selectedTECs.value = [];
};

// Сброс статуса загрузки для конкретной ТЭЦ
const resetTECLoadStatus = (tecId: number) => {
  appStore.unmarkTECAsLoaded(tecId);
};

// Сброс статуса загрузки для всех ТЭЦ
const resetAllLoadStatus = () => {
  appStore.unmarkAllTECsAsLoaded();
  selectedTECs.value = [];
};
</script>

<template>
  <div class="manual-upload-tab w-full">
    <h1 class="text-3xl font-bold mb-6 text-accent">Ручная загрузка</h1>
    <p class="text-secondary mb-8">Загрузка данных вручную по требованию</p>

    <div class="upload-container w-full space-y-6">
      <!-- Блок 1: Путь к сетевому каталогу -->
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

      <!-- Блок 2: Выбор ТЭЦ -->
      <NCard :bordered="false" embedded class="tec-selection-card">
        <div class="card-header flex items-center justify-between">
          <h2 class="text-2xl font-semibold">Выбор ТЭЦ</h2>
          <div class="selection-actions flex gap-2">
            <NButton
              v-if="selectedTECs.length > 0"
              size="small"
              @click="deselectAllTECs"
            >
              Снять все
            </NButton>
            <NButton
              v-if="
                selectedTECs.length < tecList.filter((t) => !t.isLoaded).length
              "
              size="small"
              type="primary"
              @click="selectAllTECs"
            >
              Выбрать все
            </NButton>
            <NButton
              v-if="appStore.getLoadedTECs.length > 0"
              size="small"
              type="warning"
              @click="resetAllLoadStatus"
            >
              Сбросить статус
            </NButton>
          </div>
        </div>
        <div class="card-subtitle text-secondary mb-6">
          Выберите ТЭЦ, для которых нужно выполнить загрузку данных
        </div>

        <div class="tec-list space-y-3">
          <NCard
            v-for="tec in tecList"
            :key="tec.id"
            :bordered="false"
            embedded
            class="tec-card"
            :class="{
              'tec-card-selected': isTECSelected(tec.id),
              'tec-card-loaded': tec.isLoaded,
              'tec-card-disabled': tec.isLoaded,
            }"
          >
            <div class="flex items-center justify-between">
              <div class="tec-info flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold">{{ tec.name }}</h3>
                  <NTag
                    v-if="tec.isLoaded"
                    type="success"
                    size="small"
                    class="loaded-tag"
                  >
                    <NIcon :component="CheckmarkCircleOutline" :size="14" />
                    Загружено
                  </NTag>
                </div>
                <p class="text-sm text-secondary mt-1">{{ tec.code }}</p>
                <p
                  v-if="tec.isLoaded && tec.loadedAt"
                  class="text-xs text-green-600 mt-1"
                >
                  Загружено:
                  {{ new Date(tec.loadedAt).toLocaleString("ru-RU") }}
                </p>
              </div>
              <div class="tec-actions flex items-center gap-2">
                <NCheckbox
                  :checked="isTECSelected(tec.id)"
                  :disabled="tec.isLoaded"
                  @update:checked="() => toggleTECSelection(tec.id)"
                  class="tec-checkbox"
                />
                <NButton
                  v-if="tec.isLoaded"
                  size="tiny"
                  type="tertiary"
                  @click="resetTECLoadStatus(tec.id)"
                  class="reset-button"
                >
                  <NIcon :component="ReloadOutline" :size="14" />
                </NButton>
              </div>
            </div>
          </NCard>
        </div>

        <!-- Статистика выбора -->
        <div
          v-if="hasSelectedTECs"
          class="selection-stats mt-4 p-3 bg-blue-50 rounded-lg"
        >
          <div class="flex items-center gap-2">
            <NIcon
              :component="CheckmarkCircleOutline"
              :size="18"
              color="#0078d4"
            />
            <span class="text-sm font-medium">
              Выбрано:
              <span class="text-accent">{{ selectedTECs.length }}</span> из
              <span>{{ tecList.filter((t) => !t.isLoaded).length }}</span>
              доступных ТЭЦ
            </span>
          </div>
        </div>

        <!-- Статистика загрузки -->
        <div
          v-if="appStore.getLoadedTECs.length > 0"
          class="upload-stats mt-3 p-3 bg-green-50 rounded-lg"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <NIcon
                :component="CheckmarkCircleOutline"
                :size="18"
                color="#059669"
              />
              <span class="text-sm font-medium text-green-800">
                Загружено:
                <span class="text-green-600">{{
                  appStore.getLoadedTECs.length
                }}</span>
                из <span>{{ tecList.length }}</span> ТЭЦ
              </span>
            </div>
            <span class="text-xs text-green-600">
              {{
                (
                  (appStore.getLoadedTECs.length / tecList.length) *
                  100
                ).toFixed(0)
              }}%
            </span>
          </div>
        </div>
      </NCard>

      <!-- Блок 3: Кнопка загрузки и результат -->
      <div class="action-section">
        <NButton
          v-if="hasSelectedTECs"
          type="primary"
          :loading="isLoading"
          @click="uploadData"
          class="upload-button"
        >
          <template #icon>
            <NIcon :component="CloudUploadOutline" />
          </template>
          {{ isLoading ? "Загрузка..." : "Загрузить" }}
        </NButton>

        <!-- Результат загрузки -->
        <NAlert
          v-if="uploadResult"
          :type="uploadResult.success ? 'success' : 'error'"
          class="result-alert mt-4"
          closable
          @close="uploadResult = null"
        >
          {{ uploadResult.message }}
        </NAlert>
      </div>
    </div>
  </div>
</template>

<style scoped>
.manual-upload-tab {
  min-height: calc(100vh - 4rem);
  width: 100%;
}

.upload-container {
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
.tec-selection-card {
  width: 100% !important;
  background: var(--card-bg);
  border: 1px solid var(--win-border);
  border-radius: 12px;
  padding: 0rem;
  box-shadow: var(--win-shadow);
  transition: all 0.2s ease;
}

.network-path-card:hover,
.tec-selection-card:hover {
  box-shadow: var(--win-shadow-hover);
}

.card-header {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

/* Выбор ТЭЦ */
.selection-actions {
  display: flex;
  gap: 0.5rem;
}

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
  cursor: pointer;
}

.tec-card:hover:not(.tec-card-disabled) {
  border-color: var(--win-accent);
  box-shadow: var(--win-shadow-hover);
  transform: translateX(4px);
}

.tec-card-selected {
  border-color: var(--win-accent);
  background: rgba(0, 120, 212, 0.05);
  box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
}

.tec-card-selected:hover {
  background: rgba(0, 120, 212, 0.1);
}

.tec-card-loaded {
  background: rgba(5, 150, 105, 0.05);
  border-color: rgba(5, 150, 105, 0.3);
}

.tec-card-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tec-card-disabled:hover {
  transform: none;
  box-shadow: none;
  border-color: var(--win-border);
}

.tec-info h3 {
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tec-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tec-checkbox {
  flex-shrink: 0;
}

:deep(.n-checkbox) {
  display: flex;
  align-items: center;
}

:deep(.n-checkbox :disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

.loaded-tag {
  padding: 0.25rem 0.5rem;
}

.reset-button {
  padding: 0.25rem;
  min-width: auto;
}

/* Кнопка загрузки */
.action-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0;
}

.upload-button {
  width: 180px;
  height: 50px;
  align-self: flex-start;
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  position: absolute;
  top: 50%;
  left: 55px;
}

.result-alert {
  max-width: 600px;
  align-self: flex-end;
  position: absolute;
  top: 3%;
}

/* Подсказка */
.all-loaded-box {
  background: rgba(5, 150, 105, 0.05);
  border: 1px solid rgba(5, 150, 105, 0.3);
  border-radius: 8px;
  padding: 1rem;
}

/* Статистика выбора */
.selection-stats {
  background: rgba(0, 120, 212, 0.05);
  border: 1px solid rgba(0, 120, 212, 0.2);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

/* Статистика загрузки */
.upload-stats {
  background: rgba(5, 150, 105, 0.05);
  border: 1px solid rgba(5, 150, 105, 0.3);
  border-radius: 8px;
  padding: 0.75rem 1rem;
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
