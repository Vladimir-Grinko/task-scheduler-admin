export interface TabItem {
  id: string;
  name: string;
  icon: string;
  route: string;
  description?: string;
}

export interface ScheduleConfig {
  enabled: boolean;
  tecList: TECItem[];
  scheduleTime: string;
  autoRetry: boolean;
  retryCount: number;
  networkPath: string;
  hasUnsavedChanges: boolean;
  frequency: "daily" | "weekly";
  selectedDays: string[];
}

export interface TECItem {
  id: number;
  name: string;
  code: string;
  enabled: boolean;
  scheduleTime?: string;
  lastRun?: string;
  status?: "success" | "failed" | "pending";
  isLoaded?: boolean;
  loadedAt?: string;
}

export interface AppNotification {
  id: number | string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  tecId?: number;
  tecName?: string;
  filesCount?: number;
  successfulFiles?: number;
  failedFiles?: number;
  duration?: number;
  details?: string;
}

export interface ManualUploadState {
  loadedTECs: Set<number>;
  lastUploadTime?: string;
}

export interface UploadSummary {
  totalFiles: number;
  successful: number;
  failed: number;
  totalSize: number;
  duration: number;
}
