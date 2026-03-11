import api from "./client";

function fixEstimatedHours(data) {
  if (!data) return data;
  const clone = { ...data };

  if (
    clone.estimated_hours !== undefined &&
    clone.estimated_hours !== null &&
    clone.estimated_hours !== ""
  ) {
    let strVal = String(clone.estimated_hours);
    if (!strVal.includes(".")) {
      strVal += ".0";
    }
    clone.estimated_hours = strVal;
  }

  if (Array.isArray(clone.subtasks)) {
    clone.subtasks = clone.subtasks.map(fixEstimatedHours);
  }

  return clone;
}

export async function fetchDashboardTasks() {
  const { data } = await api.get("/api/tasks/dashboard/");
  return data;
}

export async function createTask(taskData) {
  const { data } = await api.post("/api/tasks/", fixEstimatedHours(taskData));
  return data;
}

export async function fetchTaskById(taskId) {
  const { data } = await api.get(`/api/tasks/${taskId}/`);
  return data;
}

export async function updateTask(taskId, taskData) {
  const { data } = await api.put(
    `/api/tasks/${taskId}/`,
    fixEstimatedHours(taskData),
  );
  return data;
}

export async function deleteTask(taskId) {
  await api.delete(`/api/tasks/${taskId}/`);
  return;
}

export async function createSubtask(subtaskData) {
  const { data } = await api.post(
    "/api/subtasks/",
    fixEstimatedHours(subtaskData),
  );
  return data;
}

export async function deleteSubtask(subtaskId) {
  await api.delete(`/api/subtasks/${subtaskId}/`);
  return;
}

export async function updateSubtaskStatus(subtaskId, status) {
  const { data } = await api.patch(`/api/subtasks/${subtaskId}/`, { status });
  return data;
}

export async function partiallyUpdateTask(taskId, taskData) {
  const { data } = await api.patch(
    `/api/tasks/${taskId}/`,
    fixEstimatedHours(taskData),
  );
  return data;
}

export async function partiallyUpdateSubtask(subtaskId, subtaskData) {
  const { data } = await api.patch(
    `/api/subtasks/${subtaskId}/`,
    fixEstimatedHours(subtaskData),
  );
  return data;
}

export async function fetchWorkload(dateStr) {
  const { data } = await api.get(`/api/subtasks/workload/?date=${dateStr}`);
  return data;
}

export async function fetchProgressData() {
  const { data } = await api.get("/api/progress/")
  return data
}