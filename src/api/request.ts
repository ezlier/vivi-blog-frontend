import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { ElMessage } from "element-plus";
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from "@/utils/authStorage";

const api = axios.create({
  baseURL: "/api/v1/",
  timeout: 30000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  silent?: boolean;
};

interface RefreshResponse {
  access_token?: string;
  refresh_token?: string;
}

let refreshPromise: Promise<string> | null = null;

function isAuthRequest(config: RetryableRequestConfig) {
  const url = config.url || "";
  return url.includes("auth/login") || url.includes("auth/refresh");
}

async function refreshAccessToken() {
  const storedRefreshToken = getRefreshToken();
  if (!storedRefreshToken) {
    throw new Error("缺少 refresh_token");
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<RefreshResponse>("/api/v1/auth/refresh", {
        refresh_token: storedRefreshToken,
      })
      .then((response) => {
        const data = response.data;
        if (!data.access_token) {
          throw new Error("刷新响应缺少 access_token");
        }

        saveAuthTokens({
          accessToken: data.access_token,
          refreshToken: data.refresh_token || storedRefreshToken,
        });
        api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;

        return data.access_token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function redirectToLogin() {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

function isSilentRequest(config?: RetryableRequestConfig) {
  return config?.silent === true;
}

// 自动附加当前 access_token。
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data?.code && data.code >= 400) {
      const message = data.message || data.msg || "请求失败";
      if (!isSilentRequest(response.config as RetryableRequestConfig)) {
        ElMessage.error(message);
      }
      return Promise.reject(new Error(message));
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRequest(originalRequest)
    ) {
      originalRequest._retry = true;

      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        clearAuthStorage();
        redirectToLogin();
      }
    }

    if (isSilentRequest(originalRequest)) {
      return Promise.reject(error);
    }

    if (!error.response) {
      ElMessage.error("网络连接失败");
    } else if (status === 403) {
      ElMessage.error("没有权限执行此操作");
    } else if (status !== undefined && status >= 500) {
      ElMessage.error("服务器内部错误");
    }

    return Promise.reject(error);
  },
);

export default api;
