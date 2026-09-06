export interface StoredAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export function getAccessToken() {
  return localStorage.getItem("access_token") || "";
}

export function getRefreshToken() {
  return localStorage.getItem("refresh_token") || "";
}

export function saveAuthTokens(tokens: StoredAuthTokens) {
  localStorage.setItem("access_token", tokens.accessToken);
  localStorage.setItem("refresh_token", tokens.refreshToken);
}

export function clearAuthStorage() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("username");
}
