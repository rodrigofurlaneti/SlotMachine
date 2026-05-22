import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

function isNetworkFailure(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  if (!error.response) return true;
  const s = error.response.status;
  if (s === 502 || s === 503 || s === 504) return true;
  return false;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isNetworkFailure(error)) {
      import("../store/connectionStore").then(({ useConnectionStore }) => {
        const { status, markOffline } = useConnectionStore.getState();
        if (status === "online") markOffline();
      });
    }

    const message =
      error?.response?.data?.error ||
      error?.response?.data?.Error ||
      error?.message ||
      "Erro de comunicacao com a API";
    return Promise.reject(new Error(message));
  }
);
