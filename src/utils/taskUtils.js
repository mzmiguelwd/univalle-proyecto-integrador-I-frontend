export const getPriority = (taskType) => {
  if (taskType === "examen" || taskType === "proyecto") return "Alta";
  if (taskType === "quiz") return "Media";
  return "Baja";
};

export const getSubtasksStats = (subtasks) => {
  if (!subtasks || subtasks.length === 0)
    return { percentage: 0, completed: 0, total: 0 };
  const completed = subtasks.filter((st) => st.status === "done").length;
  return {
    percentage: Math.round((completed / subtasks.length) * 100),
    completed,
    total: subtasks.length,
  };
};

export const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const datePart = dateString.split("T")[0];
  const parts = datePart.split("-");
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(dateString);
};

export const formatDate = (dateString, isDateTime = false) => {
  if (!dateString) return "Sin fecha";

  let date;
  if (isDateTime) {
    date = new Date(dateString);
  } else {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      date = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      date = new Date(dateString);
    }
  }

  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatHours = (decimalHours) => {
  if (!decimalHours || isNaN(decimalHours) || decimalHours <= 0) return "0 h";
  const h = Math.floor(decimalHours);
  const m = Math.round((decimalHours - h) * 60);

  if (h > 0 && m > 0) return `${h} h ${m} m`;
  if (h > 0) return `${h} h`;
  if (m > 0) return `${m} min`;
  return "0 h";
};

export const getNextDeliveryDate = (subtasks) => {
  if (!subtasks || subtasks.length === 0) return "Sin planificar";
  const pendingSubtasks = subtasks.filter(
    (subtask) => subtask.status !== "done",
  );
  if (pendingSubtasks.length === 0) return "Todo completado";

  pendingSubtasks.sort(
    (a, b) => parseLocalDate(a.target_date) - parseLocalDate(b.target_date),
  );
  return formatDate(pendingSubtasks[0].target_date, false);
};
