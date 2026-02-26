import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import QuickAddSubtask from "../components/QuickAddSubtask";
import classes from "./TaskDetail.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function sortSubtasksByDate(subtasks) {
  return [...subtasks].sort((a, b) => {
    if (a.target_date < b.target_date) return -1;
    if (a.target_date > b.target_date) return 1;
    return 0;
  });
}

function TaskDetailPage() {
  const { id } = useParams();
  const isDemoMode = id === "demo";

  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isDemoMode) {
      setTask({
        id: "demo",
        title: "Actividad Demo - US2",
        course: "Proyecto Integrador I",
        due_date: new Date().toISOString(),
      });
      setSubtasks(
        sortSubtasksByDate([
          {
            id: 9001,
            name: "Leer requerimientos",
            target_date: "2026-02-24",
            estimated_hours: 1.5,
          },
        ]),
      );
      setLoading(false);
      setError("");
      return;
    }

    const fetchTask = async () => {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No hay sesión activa. Inicia sesión de nuevo.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/tasks/${id}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.detail || "No se pudo cargar la actividad.");
        }

        setTask(data);
        setSubtasks(sortSubtasksByDate(data.subtasks || []));
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, isDemoMode]);

  const dueDateLabel = useMemo(() => {
    if (!task?.due_date) return "Sin fecha límite";
    return new Date(task.due_date).toLocaleString("es-CO");
  }, [task?.due_date]);

  const onSubtaskCreated = (newSubtask) => {
    setSubtasks((prevSubtasks) =>
      sortSubtasksByDate([...prevSubtasks, newSubtask]),
    );
  };

  if (loading) {
    return (
      <p className={classes.message}>Cargando detalle de la actividad...</p>
    );
  }

  if (error) {
    return <p className={classes.error}>{error}</p>;
  }

  if (!task) {
    return <p className={classes.error}>No se encontró la actividad.</p>;
  }

  return (
    <div className={classes.wrapper}>
      <header className={classes.header}>
        <h1>{task.title}</h1>
        <p>{task.course}</p>
        <small>Fecha límite: {dueDateLabel}</small>
        {isDemoMode ? (
          <small className={classes.demoHint}>
            Modo demo activo: no requiere backend ni autenticación.
          </small>
        ) : null}
      </header>

      <QuickAddSubtask
        taskId={task.id}
        onSubtaskCreated={onSubtaskCreated}
        demoMode={isDemoMode}
      />

      <section className={classes.subtasksSection}>
        <h2>Subtareas de la actividad</h2>

        {subtasks.length === 0 ? (
          <p className={classes.message}>Aún no hay subtareas registradas.</p>
        ) : (
          <ul className={classes.subtaskList}>
            {subtasks.map((subtask) => (
              <li key={subtask.id} className={classes.subtaskItem}>
                <div>
                  <strong>{subtask.name}</strong>
                  <p>Fecha objetivo: {subtask.target_date}</p>
                </div>
                <span>{subtask.estimated_hours} h</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default TaskDetailPage;
