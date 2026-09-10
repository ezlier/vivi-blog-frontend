import type { AxiosRequestConfig } from "axios";
import api from "./request";

const silentRequestConfig = {
  silent: true,
} as AxiosRequestConfig;

// ── 访客 ─────────────────────────────────────────────────────────
export const trackVisitor = (data: { device_type?: string }) =>
  api.post("visitor/track", data, silentRequestConfig);

export const getVisitorLogs = (params?: Record<string, any>) =>
  api.get("visitor/logs", { params });

// ── 黑名单 ───────────────────────────────────────────────────────
export const createBlacklist = (data: {
  ip_address: string;
  reason: string;
  expires_at?: string | null;
}) => api.post("visitor/blacklist", data);

export const getBlacklist = (params?: Record<string, any>) =>
  api.get("visitor/blacklist", { params });

export const updateBlacklist = (
  blacklist_id: number,
  data: {
    ip_address?: string;
    reason?: string;
    is_active?: boolean;
    expires_at?: string | null;
  },
) => api.put(`visitor/blacklist/${blacklist_id}`, data);

export const batchDeleteBlacklists = (ids: number[]) =>
  api.delete("visitor/blacklist", { data: { ids } });
