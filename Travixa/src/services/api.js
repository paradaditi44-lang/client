import API, { API_BASE_URL } from "../api/api";

export { API_BASE_URL };

export async function sendChatMessage(payload) {
  const endpoint = `${API_BASE_URL}/api/chat`;

  if (import.meta.env?.DEV) {
    console.log("Travexa Chat API:", API_BASE_URL || "same-origin");
  }

  const makeRequest = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(
          data?.reply ||
            data?.message ||
            "Travexa AI is temporarily unavailable. Please try again."
        );
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.name === "AbortError") {
        const timeoutError = new Error("Travexa AI request timed out. Please try again.");
        timeoutError.status = 408;
        throw timeoutError;
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // 1 automatic retry for temporary network or 5xx server failures
  try {
    return await makeRequest();
  } catch (firstError) {
    const isRetryable =
      !firstError.status ||
      (firstError.status >= 500 && firstError.status < 600) ||
      firstError.status === 408;

    if (isRetryable) {
      try {
        return await makeRequest();
      } catch (secondError) {
        throw secondError;
      }
    }

    throw firstError;
  }
}

export default API;
