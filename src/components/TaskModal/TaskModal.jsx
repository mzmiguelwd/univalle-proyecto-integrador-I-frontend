import { useState, useEffect, useCallback } from "react";
import { MdClose, MdDelete } from "react-icons/md";
import toast from "react-hot-toast";

import classes from "./TaskModal.module.css";
import {
  fetchTaskById,
  partiallyUpdateTask,
  partiallyUpdateSubtask,
  deleteTask,
  deleteSubtask,
  updateSubtaskStatus,
  createSubtask,
} from "../../api/tasks";
import TaskModalHeader from "./TaskModalHeader";
import TaskModalSubtasks from "./TaskModalSubtasks";

const parseApiError = (err, defaultMsg) => {
  if (err?.response?.data) {
    const data = err.response.data;
    if (typeof data === "string") return data;
    if (typeof data === "object") {
      const messages = [];
      const extractMessages = (obj) => {
        if (typeof obj === "string") {
          messages.push(obj);
        } else if (Array.isArray(obj)) {
          obj.forEach(extractMessages);
        } else if (typeof obj === "object" && obj !== null) {
          Object.values(obj).forEach(extractMessages);
        }
      };
      extractMessages(data);
      if (messages.length > 0) return messages.join(" | ");
    }
  }
  return err?.message || defaultMsg;
};

export default function TaskDetailsModal({ task, onClose, onTaskUpdated }) {
  // Global states of the modal
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editing states for the main task
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [savingTask, setSavingTask] = useState(false);
  const [editingTaskData, setEditingTaskData] = useState({
    title: "",
    description: "",
    course: "",
    due_date: "",
    estimated_hours: "",
    task_type: "",
  });

  // Editing states for subtasks
  const [busyId, setBusyId] = useState(null);
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [savingSubtaskId, setSavingSubtaskId] = useState(null);
  const [editingSubtaskData, setEditingSubtaskData] = useState({
    name: "",
    note: "",
    target_date: "",
    estimated_hours: "",
  });
  const [draftSubtasks, setDraftSubtasks] = useState([]);

  const [isEditingSubtasks, setIsEditingSubtasks] = useState(false);
  const [savingSubtasks, setSavingSubtasks] = useState(false);

  // States for adding a new subtask
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [creatingSubtask, setCreatingSubtask] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const [newSubtaskDate, setNewSubtaskDate] = useState("");
  const [newSubtaskHours, setNewSubtaskHours] = useState("0.25");

  // Effects and data fetching

  const fetchDetails = useCallback(async () => {
    if (!task?.id) return;

    try {
      setLoading(true);
      setError(null);
      let data = await fetchTaskById(task.id);

      if (data.subtasks && data.subtasks.length > 0) {
        const allDone = data.subtasks.every(
          (s) => s.status === "done" || s.is_completed,
        );

        if (allDone && !data.is_completed) {
          await partiallyUpdateTask(task.id, { is_completed: true });
          data = await fetchTaskById(task.id);

          if (onTaskUpdated) onTaskUpdated();
        } else if (!allDone && data.is_completed) {
          await partiallyUpdateTask(task.id, { is_completed: false });
          data = await fetchTaskById(task.id);
          if (onTaskUpdated) onTaskUpdated();
        }
      }

      setDetails(data);

      setEditingTaskData({
        title: data.title || "",
        description: data.description || "",
        course: data.course || "",
        due_date: data.due_date ? data.due_date.split("T")[0] : "",
        estimated_hours:
          data.total_estimated_hours || data.estimated_hours || "",
        task_type: data.task_type || "otro",
      });
      setDraftSubtasks(data.subtasks || []);
      return data;
    } catch (error) {
      console.error(error);
      setError(
        parseApiError(error, "Error al cargar los detalles de la actividad."),
      );
    } finally {
      setLoading(false);
    }
  }, [task?.id, onTaskUpdated]);

  useEffect(() => {
    if (task?.id) {
      fetchDetails();
    } else {
      setLoading(false);
      setError("Actividad no válida.");
    }
  }, [task?.id, fetchDetails]);

  const handleUpdateDraftSubtask = (subtaskId, field, value) => {
    setDraftSubtasks((prev) =>
      prev.map((st) => (st.id === subtaskId ? { ...st, [field]: value } : st)),
    );
    setIsEditingSubtasks(true);
  };

  // Main task logic
  const handleSaveTask = async () => {
    if (!editingTaskData.title.trim()) {
      setError("El título de la actividad no puede estar vacío.");
      return;
    }

    try {
      setSavingTask(true);
      setError(null);
      await partiallyUpdateTask(task.id, editingTaskData);

      await fetchDetails();
      if (onTaskUpdated) onTaskUpdated();
      setIsEditingTask(false);
    } catch (err) {
      console.error(err);
      setError(parseApiError(err, "Error al guardar los cambios."));
    } finally {
      setSavingTask(false);
    }
  };

  // Subtasks bulk save logic
  const handleSaveSubtasks = async () => {
    try {
      setSavingSubtasks(true);
      setError(null);

      const subtasksPromises = draftSubtasks
        .map((st) => {
          const original = details.subtasks.find((o) => o.id === st.id);
          if (original && JSON.stringify(original) !== JSON.stringify(st)) {
            return partiallyUpdateSubtask(st.id, {
              name: st.name,
              note: st.note,
              target_date: st.target_date || null,
              estimated_hours: st.estimated_hours || null,
            });
          }
          return null;
        })
        .filter(Boolean);

      if (subtasksPromises.length > 0) {
        await Promise.all(subtasksPromises);
      }

      await fetchDetails();
      if (onTaskUpdated) onTaskUpdated();
      setIsEditingSubtasks(false);
    } catch (err) {
      console.error(err);
      setError(parseApiError(err, "Error al guardar el plan de trabajo."));
    } finally {
      setSavingSubtasks(false);
    }
  };

  // Subtask logic
  const toggleSubtask = async (st) => {
    try {
      setBusyId(st.id);
      setError(null);
      const isDone = st.status === "done" || st.is_completed;

      await updateSubtaskStatus(st.id, isDone ? "pending" : "done");
      await fetchDetails();

      // (El fetchDetails se encarga de reevaluar y autocompletar la tarea principal si procede)

      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error(err);
      setError(
        parseApiError(err, "Error al cambiar el estado de la subtarea."),
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleStartEditSubtask = (st) => {
    setEditingSubtaskId(st.id);
    setEditingSubtaskData({
      name: st.name || st.title || "",
      note: st.note || "",
      target_date: st.target_date || "",
      estimated_hours: st.estimated_hours || "",
    });
  };

  const handleChangeSubtaskData = (field, value) => {
    setEditingSubtaskData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSubtask = async (st) => {
    if (!editingSubtaskData.name.trim()) {
      setError("El nombre de la subtarea es obligatorio.");
      return;
    }

    try {
      setSavingSubtaskId(st.id);
      setError(null);
      await partiallyUpdateSubtask(st.id, {
        name: editingSubtaskData.name,
        note: editingSubtaskData.note,
        target_date: editingSubtaskData.target_date || null,
        estimated_hours: editingSubtaskData.estimated_hours || null,
      });

      await fetchDetails();
      if (onTaskUpdated) onTaskUpdated();
      setEditingSubtaskId(null);
    } catch (err) {
      console.error(err);
      setError(parseApiError(err, "Error al guardar la subtarea."));
    } finally {
      setSavingSubtaskId(null);
    }
  };

  const handleDeleteSubtask = async (st) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta subtarea?")) return;

    const toastId = toast.loading("Eliminando subtarea...");
    try {
      setBusyId(st.id);
      setError(null);
      await deleteSubtask(st.id);

      toast.success("Subtarea eliminada", { id: toastId });
      await fetchDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar subtarea", { id: toastId });
      setError(parseApiError(err, "Error al eliminar la subtarea."));
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteTask = async () => {
    if (
      !window.confirm(
        "¿Seguro que deseas eliminar esta tarea y todas sus subtareas asociadas? Esta acción no se puede deshacer.",
      )
    )
      return;

    const toastId = toast.loading("Eliminando actividad...");
    try {
      setError(null);
      await deleteTask(task.id);
      toast.success("Actividad eliminada", { id: toastId });
      if (onTaskUpdated) onTaskUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar", { id: toastId });
      setError(parseApiError(err, "Error al eliminar la tarea."));
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskName.trim()) {
      setError("Debes darle un nombre a la nueva subtarea.");
      return;
    }

    try {
      setCreatingSubtask(true);
      setError(null);

      const payload = {
        name: newSubtaskName,
        task: task.id,
        target_date: newSubtaskDate || null,
        estimated_hours: newSubtaskHours || null,
      };

      await createSubtask(payload);
      handleCancelAddSubtask();
      await fetchDetails();

      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error(err);
      setError(parseApiError(err, "Error al crear la subtarea."));
    } finally {
      setCreatingSubtask(false);
    }
  };

  const handleCancelAddSubtask = () => {
    setIsAddingSubtask(false);
    setNewSubtaskName("");
    setNewSubtaskDate("");
    setNewSubtaskHours("0.25");
  };

  // Rendering (loading states, error states, main content)

  if (loading) {
    return (
      <div className={classes.backdrop} onClick={onClose}>
        <div className={classes.modal} onClick={(e) => e.stopPropagation()}>
          <button
            className={classes.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <MdClose size={24} />
          </button>
          <div className={classes.loadingState}>
            <div className={classes.spinner}></div>
            <p>Cargando detalles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className={classes.backdrop} onClick={onClose}>
        <div className={classes.modal} onClick={(e) => e.stopPropagation()}>
          <button
            className={classes.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <MdClose size={24} />
          </button>
          <div className={classes.emptyState}>
            <p>No se encontró la tarea o fue eliminada.</p>
          </div>
        </div>
      </div>
    );
  }

  // Progress calculations
  const subtasks = details.subtasks || [];
  const doneSubtasks = subtasks.filter(
    (st) => st.status === "done" || st.is_completed,
  ).length;
  const progressPercent =
    subtasks.length > 0
      ? Math.round((doneSubtasks / subtasks.length) * 100)
      : 0;

  const currentDraftTotalHours = draftSubtasks.reduce(
    (sum, st) => sum + (Number(st.estimated_hours) || 0),
    0,
  );

  return (
    <div className={classes.backdrop} onClick={onClose}>
      <div className={classes.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={classes.closeBtn}
          onClick={onClose}
          aria-label="Cerrar"
        >
          <MdClose size={24} />
        </button>

        <button
          className={classes.deleteTaskBtnTop}
          onClick={handleDeleteTask}
          title="Eliminar tarea"
        >
          <MdDelete size={18} />
          <span>Eliminar</span>
        </button>

        <div className={classes.bodyScroll}>
          <TaskModalHeader
            details={details}
            draftTotalHours={currentDraftTotalHours}
            editingTaskData={editingTaskData}
            setEditingTaskData={setEditingTaskData}
            savingTask={savingTask}
            handleSaveTask={handleSaveTask}
            isEditingTask={isEditingTask}
            setIsEditingTask={setIsEditingTask}
          />

          {error && (
            <div className={classes.errorBanner}>
              {error}
              <button onClick={() => setError(null)}>
                <MdClose size={16} />
              </button>
            </div>
          )}

          {subtasks.length > 0 && (
            <div className={classes.progressSection}>
              <div className={classes.progressHeader}>
                <span className={classes.progressLabel}>Progreso del plan</span>
                <span className={classes.progressPercent}>
                  {progressPercent}%
                </span>
              </div>
              <div className={classes.progressBarBg}>
                <div
                  className={classes.progressBarFill}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          <TaskModalSubtasks
            draftSubtasks={draftSubtasks}
            handleUpdateDraftSubtask={handleUpdateDraftSubtask}
            isEditingSubtasks={isEditingSubtasks}
            savingSubtasks={savingSubtasks}
            handleSaveSubtasks={handleSaveSubtasks}
            error={error}
            busyId={busyId}
            editingSubtaskId={editingSubtaskId}
            editingSubtaskData={editingSubtaskData}
            handleChangeSubtaskData={handleChangeSubtaskData}
            handleSaveSubtask={handleSaveSubtask}
            handleStartEditSubtask={handleStartEditSubtask}
            handleDeleteSubtask={handleDeleteSubtask}
            setEditingSubtaskId={setEditingSubtaskId}
            savingSubtaskId={savingSubtaskId}
            toggleSubtask={toggleSubtask}
            isAddingSubtask={isAddingSubtask}
            setIsAddingSubtask={setIsAddingSubtask}
            newSubtaskName={newSubtaskName}
            setNewSubtaskName={setNewSubtaskName}
            newSubtaskDate={newSubtaskDate}
            setNewSubtaskDate={setNewSubtaskDate}
            newSubtaskHours={newSubtaskHours}
            setNewSubtaskHours={setNewSubtaskHours}
            handleAddSubtask={handleAddSubtask}
            handleCancelAddSubtask={handleCancelAddSubtask}
            creatingSubtask={creatingSubtask}
            taskDueDate={editingTaskData.due_date}
          />
        </div>
      </div>
    </div>
  );
}
