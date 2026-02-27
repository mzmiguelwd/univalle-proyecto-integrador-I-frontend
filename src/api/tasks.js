import api from "./client";

export async function fetchAllPendingTasks() {
  const { data } = await api.get("/api/tasks/dashboard/");
  return data; // devuelve array
}
