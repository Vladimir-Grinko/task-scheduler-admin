import { defineStore } from "pinia";
import type {
  ScheduleConfig,
  AppNotification,
  TabItem,
  ManualUploadState,
  UploadSummary,
} from "@/types";

//TECItem,

export const useAppStore = defineStore("app", {
  state: () => ({
    // Tabs configuration
    tabs: [
      {
        id: "schedule",
        name: "Планировка загрузки",
        icon: "schedule",
        route: "/schedule",
      },
      {
        id: "manual",
        name: "Ручная загрузка",
        icon: "manual",
        route: "/manual",
      },
      {
        id: "notifications",
        name: "Уведомления о загрузках",
        icon: "notifications",
        route: "/notifications",
      },
    ] as TabItem[],

    // Состояние ручной загрузки
    manualUpload: {
      loadedTECs: new Set<number>(),
      lastUploadTime: undefined,
    } as ManualUploadState,

    // Копия исходной конфигурации для отслеживания изменений
    originalScheduleConfig: null as ScheduleConfig | null,

    // Schedule configuration
    scheduleConfig: {
      enabled: false,
      networkPath: "",
      frequency: "daily" as "daily" | "weekly", // периодичность
      selectedDays: ["mon", "tue", "wed", "thu", "fri"] as string[], // для режима еженедельно
      tecList: [
        { id: 1, name: "ТЭЦ-1", code: "Центральная ТЭЦ", enabled: true },
        { id: 2, name: "ТЭЦ-5", code: "Правобережная ТЭЦ", enabled: true },
        { id: 3, name: "ТЭЦ-7", code: "Василеостровская ТЭЦ", enabled: false },
        { id: 4, name: "ТЭЦ-14", code: "Первомайская ТЭЦ", enabled: true },
        { id: 5, name: "ТЭЦ-15", code: "Автовская ТЭЦ", enabled: false },
        { id: 6, name: "ТЭЦ-17", code: "Выборгская ТЭЦ", enabled: false },
        { id: 7, name: "ТЭЦ-21", code: "Северная ТЭЦ", enabled: true },
        { id: 8, name: "ТЭЦ-22", code: "Южная ТЭЦ", enabled: true },
      ],
      scheduleTime: "08:00",
      autoRetry: true,
      retryCount: 3,
      hasUnsavedChanges: false, // есть ли изменения
    } as ScheduleConfig,

    // Уведомления
    notifications: [] as AppNotification[],
  }),

  getters: {
    getEnabledTECs: (state) => {
      return state.scheduleConfig.tecList.filter((tec) => tec.enabled);
    },

    // Получить все уведомления
    getAllNotifications: (state) => {
      return state.notifications.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    },

    // Получить непрочитанные уведомления
    getUnreadNotifications: (state) => {
      return state.notifications.filter((n) => !n.read);
    },

    // Получить уведомления по типу
    getNotificationsByType: (state) => (type: string) => {
      return state.notifications.filter((n) => n.type === type);
    },

    // Статистика уведомлений
    getNotificationsStats: (state) => {
      return {
        total: state.notifications.length,
        unread: state.notifications.filter((n) => !n.read).length,
        success: state.notifications.filter((n) => n.type === "success").length,
        error: state.notifications.filter((n) => n.type === "error").length,
        warning: state.notifications.filter((n) => n.type === "warning").length,
        info: state.notifications.filter((n) => n.type === "info").length,
      };
    },
    // Получить все загруженные ТЭЦ
    getLoadedTECs: (state) => {
      return Array.from(state.manualUpload.loadedTECs);
    },

    // Проверить, загружена ли конкретная ТЭЦ
    isTECLoaded: (state) => (tecId: number) => {
      return state.manualUpload.loadedTECs.has(tecId);
    },

    // Получить ТЭЦ для ручной загрузки с учётом статуса загрузки
    getTECsForManualUpload: (state) => {
      return state.scheduleConfig.tecList.map((tec) => ({
        ...tec,
        isLoaded: state.manualUpload.loadedTECs.has(tec.id),
        loadedAt: state.manualUpload.lastUploadTime,
      }));
    },
  },

  actions: {
    updateScheduleTime(time: string) {
      this.scheduleConfig.scheduleTime = time;
    },

    // Пометить уведомление как прочитанное
    markNotificationAsRead(notificationId: number | string) {
      const notification = this.notifications.find(
        (n) => n.id === notificationId,
      );
      if (notification) {
        notification.read = true;
        this.saveNotificationsToStorage();
      }
    },

    // Добавить уведомление
    addNotification(notification: Omit<AppNotification, "id">) {
      const newNotification: AppNotification = {
        ...notification,
        id: Date.now(),
        timestamp: notification.timestamp || new Date().toISOString(),
        read: notification.read !== undefined ? notification.read : false,
      };
      this.notifications.unshift(newNotification);

      // Ограничиваем историю (последние 100 уведомлений)
      if (this.notifications.length > 100) {
        this.notifications = this.notifications.slice(0, 100);
      }

      // Сохраняем в localStorage
      this.saveNotificationsToStorage();
    },

    // Пометить все уведомления как прочитанные
    markAllNotificationsAsRead() {
      this.notifications.forEach((n) => {
        n.read = true;
      });
      this.saveNotificationsToStorage();
    },

    // Удалить уведомление
    removeNotification(notificationId: number | string) {
      const index = this.notifications.findIndex(
        (n) => n.id === notificationId,
      );
      if (index > -1) {
        this.notifications.splice(index, 1);
        this.saveNotificationsToStorage();
      }
    },

    // Очистить все уведомления
    clearAllNotifications() {
      this.notifications = [];
      this.saveNotificationsToStorage();
    },

    // Сохранить уведомления в localStorage
    saveNotificationsToStorage() {
      try {
        localStorage.setItem(
          "notifications",
          JSON.stringify(this.notifications),
        );
      } catch (error) {
        console.error("Ошибка сохранения уведомлений:", error);
      }
    },

    // Загрузить уведомления из localStorage
    loadNotificationsFromStorage() {
      try {
        const saved = localStorage.getItem("notifications");
        if (saved) {
          this.notifications = JSON.parse(saved);
          console.log("✅ Уведомления загружены из localStorage");
        }
      } catch (error) {
        console.error("❌ Ошибка загрузки уведомлений:", error);
      }
    },

    // Добавить уведомление о загрузке
    addUploadNotification(
      summary: UploadSummary,
      tecIds: number[],
      tecList: any[],
    ) {
      const tecNames = tecIds
        .map((id) => {
          const tec = tecList.find((t) => t.id === id);
          return tec ? tec.name : `ТЭЦ-${id}`;
        })
        .join(", ");

      const message = `Загружено файлов: ${summary.successful}/${summary.totalFiles}`;
      const details = `ТЭЦ: ${tecNames}\nВремя: ${this.formatDuration(summary.duration)}\nРазмер: ${this.formatFileSize(summary.totalSize)}`;

      this.addNotification({
        type: summary.failed > 0 ? "warning" : "success",
        title:
          summary.failed > 0
            ? "Загрузка завершена с ошибками"
            : "Загрузка успешно завершена",
        message: message,
        tecId: tecIds[0],
        filesCount: summary.totalFiles,
        successfulFiles: summary.successful,
        failedFiles: summary.failed,
        duration: summary.duration,
        details: details,
      });
    },

    // Вспомогательные методы форматирования
    formatFileSize(bytes: number): string {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    },

    formatDuration(ms: number): string {
      const seconds = Math.floor(ms / 1000);
      if (seconds < 60) {
        return `${seconds} сек`;
      }
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes} мин ${remainingSeconds} сек`;
    },

    updateNetworkPath(path: string) {
      this.scheduleConfig.networkPath = path;
    },

    updateFrequency(freq: "daily" | "weekly") {
      this.scheduleConfig.frequency = freq;
      this.checkForChanges();
    },

    updateSelectedDays(days: string[]) {
      this.scheduleConfig.selectedDays = days;
      this.checkForChanges();
    },

    toggleSchedule(enabled: boolean) {
      this.scheduleConfig.enabled = enabled;
      this.checkForChanges();
    },

    toggleTEC(tecId: number) {
      const tec = this.scheduleConfig.tecList.find((t) => t.id === tecId);
      if (tec) {
        tec.enabled = !tec.enabled;
        this.checkForChanges();
      }
    },

    checkForChanges() {
      // Простая проверка на изменения
      this.scheduleConfig.hasUnsavedChanges = true;
    },

    // Сохранение конфигурации
    async saveScheduleConfig() {
      // Здесь будет логика сохранения в бэкенд или локальное хранилище
      // Пока просто имитируем сохранение
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Сохраняем текущую конфигурацию как оригинальную
      this.saveConfigToStorage();

      console.log("Конфигурация сохранена:", this.scheduleConfig);
    },

    // Сброс изменений
    resetScheduleConfig() {
      if (this.originalScheduleConfig) {
        this.scheduleConfig = JSON.parse(
          JSON.stringify(this.originalScheduleConfig),
        );
        this.scheduleConfig.hasUnsavedChanges = false;
      }
    },

    // Инициализация
    initScheduleConfig() {
      this.originalScheduleConfig = JSON.parse(
        JSON.stringify(this.scheduleConfig),
      );
      this.scheduleConfig.hasUnsavedChanges = false;
    },

    // Пометить ТЭЦ как загруженные
    markTECsAsLoaded(tecIds: number[]) {
      tecIds.forEach((id) => {
        this.manualUpload.loadedTECs.add(id);
      });
      this.manualUpload.lastUploadTime = new Date().toISOString();
    },

    // Снять пометку загрузки с ТЭЦ
    unmarkTECAsLoaded(tecId: number) {
      this.manualUpload.loadedTECs.delete(tecId);
    },

    // Снять пометку загрузки со всех ТЭЦ
    unmarkAllTECsAsLoaded() {
      this.manualUpload.loadedTECs.clear();
      this.manualUpload.lastUploadTime = undefined;
    },

    // Проверить, есть ли незагруженные ТЭЦ
    hasUnloadedTECs() {
      return this.scheduleConfig.tecList.some(
        (tec) => !this.manualUpload.loadedTECs.has(tec.id),
      );
    },

    // Сохранить конфигурацию в localStorage
    saveConfigToStorage() {
      try {
        // Сбрасываем флаг изменений после загрузки
        this.scheduleConfig.hasUnsavedChanges = false;
        const config = {
          schedule: this.scheduleConfig,
          manualUpload: {
            loadedTECs: Array.from(this.manualUpload.loadedTECs),
            lastUploadTime: this.manualUpload.lastUploadTime,
          },
        };
        localStorage.setItem("taskSchedulerConfig", JSON.stringify(config));
        console.log("💾 Конфигурация сохранена в localStorage");
      } catch (error) {
        console.error("❌ Ошибка сохранения конфигурации:", error);
      }
    },

    // Загрузить конфигурацию из localStorage
    loadConfigFromStorage() {
      try {
        const saved = localStorage.getItem("taskSchedulerConfig");
        if (saved) {
          const config = JSON.parse(saved);

          // Восстанавливаем настройки планировщика
          if (config.schedule) {
            this.scheduleConfig = {
              ...this.scheduleConfig,
              ...config.schedule,
            };
            // Сбрасываем флаг изменений после загрузки
            this.scheduleConfig.hasUnsavedChanges = false;
            // Сохраняем как оригинальную конфигурацию
            this.originalScheduleConfig = JSON.parse(
              JSON.stringify(this.scheduleConfig),
            );
          }

          // Восстанавливаем состояние загрузок
          if (config.manualUpload) {
            this.manualUpload.loadedTECs = new Set(
              config.manualUpload.loadedTECs || [],
            );
            this.manualUpload.lastUploadTime =
              config.manualUpload.lastUploadTime;
          }

          console.log("✅ Конфигурация загружена из localStorage");
        }
      } catch (error) {
        console.error("❌ Ошибка загрузки конфигурации:", error);
      }
    },
  },
});
