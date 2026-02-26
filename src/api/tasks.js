import api from "./client";

export async function fetchTodayTasks() {
  const { data } = await api.get("/tasks/today/");
  return data; // devuelve array
}