import apiClient from "./axiosConfig";

export const sendMessage = async (message) => {
  try {
    const response = await apiClient.post("/api/chat", { message });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
