import api from "./client";

export async function fetchDashboardTasks() {
  const { data } = await api.get("/api/tasks/dashboard/");
  return data; // returns an array of tasks
}

export async function createTask(taskData) {
  const { data } = await api.post("/api/tasks/", taskData);
  return data; // returns the created task
}

export async function fetchTaskById(taskId) {
  const { data } = await api.get(`/api/tasks/${taskId}/`);
  return data; // returns the task with the specified id
}

export async function updateTask(taskId, taskData) {
  const { data } = await api.put(`/api/tasks/${taskId}/`, taskData);
  return data; // returns the updated task
}

export async function deleteTask(taskId) {
  await api.delete(`/api/tasks/${taskId}/`);
  return; // returns nothing, just indicates successful deletion
}

export async function createSubtask(subtaskData) {
  const { data } = await api.post("/api/subtasks/", subtaskData);
  return data; // returns the created subtask
}
