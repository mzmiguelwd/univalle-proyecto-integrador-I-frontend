import api from "./client";

export async function registerUser(userData) {
  const { data } = await api.post("/api/auth/register/", userData);
  return data;
}

export async function loginUser(credentials) {
  const { data } = await api.post("/api/auth/login/", credentials);
  return data;
}

export async function logoutUser() {
  try {
    await api.post("/api/auth/logout/");
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
  }
}
