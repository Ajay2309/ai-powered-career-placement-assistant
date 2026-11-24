import api from "./api";

export const testBackendConnection = async () => {
  try {
    const response = await api.get("/health");

    console.log("Backend connection successful!");
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error("Backend connection failed:", error.message);
    throw error;
  }
};