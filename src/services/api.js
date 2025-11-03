import apiClient from "./axiosConfig";

export const sendMessage = async (message, model) => {
  try {
    const body = { message };
    if (model) body.model = model;
    const response = await apiClient.post("/api/chat", body);
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
