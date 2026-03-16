<script setup lang="ts">
import { ref, computed, h } from "vue";
import { useAppStore } from "@/stores/appStore";
import type { AppNotification } from "@/types";
import {
  NIcon,
  NCard,
  NButton,
  NTag,
  NEmpty,
  NDataTable,
  NPopconfirm,
  NSpace,
  NModal,
  NDescriptions,
  NDescriptionsItem,
} from "naive-ui";
import {
  NotificationsOutline,
  CheckmarkCircleOutline,
  CloseCircleOutline,
  AlertCircleOutline,
  InformationCircleOutline,
  TrashOutline,
  EyeOutline,
} from "@vicons/ionicons5";

const appStore = useAppStore();

// Фильтры
const filterType = ref<string | null>(null);
const filterDateRange = ref<[number, number] | null>(null);
const searchTerm = ref("");

// Пагинация
const page = ref(1);
const pageSize = ref(10);

// Модальное окно с деталями
const showDetailsModal = ref(false);
const selectedNotification = ref<AppNotification | null>(null);

// Получаем все уведомления
const allNotifications = computed(() => appStore.getAllNotifications);

// Фильтрованные уведомления
const filteredNotifications = computed(() => {
  let result = [...allNotifications.value];

  // Фильтр по типу
  if (filterType.value) {
    result = result.filter((n) => n.type === filterType.value);
  }

  // Фильтр по дате
  if (filterDateRange.value) {
    const [start, end] = filterDateRange.value;
    result = result.filter((n) => {
      const timestamp = new Date(n.timestamp).getTime();
      return timestamp >= start && timestamp <= end;
    });
  }

  // Поиск по тексту
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase();
    result = result.filter(
      (n) =>
        n.title.toLowerCase().includes(search) ||
        n.message.toLowerCase().includes(search) ||
        (n.details && n.details.toLowerCase().includes(search)),
    );
  }

  return result;
});

// Пагинированные уведомления
const paginatedNotifications = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredNotifications.value.slice(start, end);
});

// Столбцы таблицы
const columns = [
  {
    title: "Статус",
    key: "type",
    width: 100,
    render: (row: AppNotification) => {
      const typeMap: any = {
        success: {
          icon: CheckmarkCircleOutline,
          color: "#10B981",
          label: "Успех",
        },
        error: {
          icon: CloseCircleOutline,
          color: "#EF4444",
          label: "Ошибка",
        },
        warning: {
          icon: AlertCircleOutline,
          color: "#F59E0B",
          label: "Предупреждение",
        },
        info: {
          icon: InformationCircleOutline,
          color: "#3B82F6",
          label: "Информация",
        },
      };
      const type = typeMap[row.type];

      return h(
        NTag,
        { type: row.type, bordered: false },
        {
          default: () => [
            h(
              NIcon,
              { size: 16, color: type.color },
              { default: () => h(type.icon) },
            ),
            h("span", { class: "ml-1" }, type.label),
          ],
        },
      );
    },
  },
  {
    title: "Заголовок",
    key: "title",
    width: 230,
    render: (row: any) => {
      return h(
        "div",
        { class: "notification-title" },
        h(
          "span",
          { class: row.read ? "text-secondary" : "font-semibold" },
          row.title,
        ),
      );
    },
  },
  {
    title: "Сообщение",
    key: "message",
    width: 210,
    render: (row: any) => {
      return h(
        "div",
        { class: "notification-message" },
        h("span", { class: row.read ? "text-secondary" : "" }, row.message),
      );
    },
  },
  {
    title: "Дата",
    key: "timestamp",
    width: 110,
    render: (row: any) => {
      const date = new Date(row.timestamp);
      return h("div", { class: "notification-date" }, [
        h("div", { class: "text-sm" }, date.toLocaleDateString("ru-RU")),
        h(
          "div",
          { class: "text-xs text-secondary" },
          date.toLocaleTimeString("ru-RU"),
        ),
      ]);
    },
  },
  {
    title: "Действия",
    key: "actions",
    width: 110,
    render: (row: any) => {
      return h(
        NSpace,
        { size: "small" },
        {
          default: () => [
            h(
              NButton,
              {
                size: "small",
                type: "tertiary",
                onClick: () => showNotificationDetails(row),
              },
              {
                default: () =>
                  h(NIcon, { size: 16 }, { default: () => h(EyeOutline) }),
              },
            ),
            h(
              NPopconfirm,

              {
                positiveText: "Удалить",
                onPositiveClick: () => appStore.removeNotification(row.id),
                negativeText: "Отмена",
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    { size: "small", type: "tertiary" },
                    {
                      default: () =>
                        h(
                          NIcon,
                          { size: 16 },
                          { default: () => h(TrashOutline) },
                        ),
                    },
                  ),
                default: () => "Удалить уведомление?",
              },
            ),
          ],
        },
      );
    },
  },
];

// Показать детали уведомления
const showNotificationDetails = (notification: AppNotification) => {
  selectedNotification.value = notification;
  showDetailsModal.value = true;
  appStore.markNotificationAsRead(notification.id);
};

// Форматирование времени
const formatDuration = (ms: number): string => {
  if (!ms) return "-";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds} сек`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} мин ${remainingSeconds} сек`;
};
</script>

<template>
  <div class="notifications-tab w-full">
    <h1 class="text-3xl font-bold mb-6 text-accent">Уведомления о загрузках</h1>
    <p class="text-secondary mb-8">История всех операций загрузки данных</p>

    <div class="notifications-container w-full space-y-6">
      <!-- Таблица уведомлений -->
      <NCard :bordered="false" embedded class="notifications-table-card">
        <div class="table-header mb-4">
          <h2 class="text-xl font-semibold">История операций</h2>
          <p class="text-sm text-secondary mt-1">
            Найдено: {{ filteredNotifications.length }} из
            {{ allNotifications.length }} уведомлений
          </p>
        </div>

        <NDataTable
          :columns="columns"
          :data="paginatedNotifications"
          :pagination="false"
          size="medium"
        />

        <!-- Пагинация -->
        <div
          v-if="filteredNotifications.length > pageSize"
          class="pagination mt-4 flex justify-center"
        >
          <n-pagination
            v-model:page="page"
            :page-count="Math.ceil(filteredNotifications.length / pageSize)"
            :page-size="pageSize"
          />
        </div>

        <!-- Пустое состояние -->
        <NEmpty
          v-if="filteredNotifications.length === 0"
          description="Нет уведомлений"
          class="py-12"
        >
          <template #icon>
            <NIcon :component="NotificationsOutline" :size="48" />
          </template>
        </NEmpty>
      </NCard>
    </div>

    <!-- Модальное окно с деталями -->
    <NModal
      v-model:show="showDetailsModal"
      preset="card"
      title="Детали уведомления"
      :style="{ width: '700px' }"
      :bordered="false"
    >
      <div v-if="selectedNotification" class="notification-details">
        <NDescriptions bordered :column="2" class="mb-6">
          <NDescriptionsItem label="Тип">
            <NTag :type="selectedNotification.type" size="large">
              {{
                selectedNotification.type === "success"
                  ? "Успех"
                  : selectedNotification.type === "error"
                    ? "Ошибка"
                    : selectedNotification.type === "warning"
                      ? "Предупреждение"
                      : "Информация"
              }}
            </NTag>
          </NDescriptionsItem>
          <NDescriptionsItem label="Дата и время">
            {{
              new Date(selectedNotification.timestamp).toLocaleString("ru-RU")
            }}
          </NDescriptionsItem>
          <NDescriptionsItem
            v-if="selectedNotification.tecName"
            label="ТЭЦ"
            :span="2"
          >
            {{ selectedNotification.tecName }}
          </NDescriptionsItem>
          <NDescriptionsItem
            v-if="selectedNotification.filesCount !== undefined"
            label="Всего файлов"
          >
            {{ selectedNotification.filesCount }}
          </NDescriptionsItem>
          <NDescriptionsItem
            v-if="selectedNotification.successfulFiles !== undefined"
            label="Успешно"
            type="success"
          >
            {{ selectedNotification.successfulFiles }}
          </NDescriptionsItem>
          <NDescriptionsItem
            v-if="selectedNotification.failedFiles !== undefined"
            label="Ошибок"
            type="error"
          >
            {{ selectedNotification.failedFiles }}
          </NDescriptionsItem>
          <NDescriptionsItem
            v-if="selectedNotification.duration"
            label="Время выполнения"
          >
            {{ formatDuration(selectedNotification.duration) }}
          </NDescriptionsItem>
        </NDescriptions>

        <div class="message-section mb-4">
          <h3 class="font-semibold mb-2">Сообщение:</h3>
          <div class="message-content p-3 bg-gray-50 rounded">
            {{ selectedNotification.message }}
          </div>
        </div>

        <div v-if="selectedNotification.details" class="details-section">
          <h3 class="font-semibold mb-2">Детали:</h3>
          <div
            class="details-content p-3 bg-blue-50 rounded whitespace-pre-line"
          >
            {{ selectedNotification.details }}
          </div>
        </div>
      </div>
    </NModal>
  </div>
</template>

<style scoped>
.notifications-tab {
  min-height: calc(100vh - 4rem);
  width: 100%;
}

.notifications-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Статистика */
.stats-card {
  background: var(--card-bg);
  border: 1px solid var(--win-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--win-shadow);
}

.stats-grid {
  display: grid;
  gap: 1rem;
}

/* Панель управления */
.controls-card {
  background: var(--card-bg);
  border: 1px solid var(--win-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--win-shadow);
}

.controls-grid {
  display: grid;
  gap: 1rem;
}

.controls-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Таблица уведомлений */
.notifications-table-card {
  background: var(--card-bg);
  border: 1px solid var(--win-border);
  border-radius: 12px;
  padding: 0rem;
  box-shadow: var(--win-shadow);
}

.table-header h2 {
  color: var(--win-text-primary);
}

.table-header p {
  color: var(--win-text-secondary);
}

/* Стили для ячеек таблицы */
.notification-title {
  font-size: 0.95rem;
}

.notification-message {
  font-size: 0.9rem;
  color: var(--win-text-secondary);
}

.notification-date {
  font-size: 0.875rem;
}

/* Пагинация */
.pagination {
  display: flex;
  justify-content: center;
}

/* Модальное окно */
.notification-details {
  max-height: 600px;
  overflow-y: auto;
}

.message-section,
.details-section {
  margin-bottom: 1rem;
}

.message-content,
.details-content {
  font-size: 0.95rem;
  line-height: 1.6;
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
