import { useEffect, useMemo, useState } from "react";
import classes from "./TaskDetailsModal.module.css";
import api from "../api/client";

export default function TaskDetailsModal({ isOpen, onClose, task, onEdit }) {
  const [subtasks, setSubtasks] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setBusyId(null);
    setSubtasks(Array.isArray(task?.subtasks) ? task.subtasks : []);
  }, [isOpen, task]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const progress = useMemo(() => {
    if (!subtasks.length) return 0;
    const done = subtasks.filter((s) => s.is_completed).length;
    return Math.round((done / subtasks.length) * 100);
  }, [subtasks]);

  const toggleSubtask = async (st) => {
    if (!st?.id || busyId) return;

    setError("");
    setBusyId(st.id);

    const current = Boolean(st.is_completed);
    const next = !current;

    // optimistic UI
    setSubtasks((prev) =>
      prev.map((s) => (s.id === st.id ? { ...s, is_completed: next } : s)),
    );

    try {
      //
      await api.patch(`/api/subtasks/${st.id}/`, { is_completed: next });
    } catch (e) {
      // rollback
      setSubtasks((prev) =>
        prev.map((s) => (s.id === st.id ? { ...s, is_completed: current } : s)),
      );
      setError("No se pudo actualizar la subtarea.");
    } finally {
      setBusyId(null);
    }
  };

  if (!isOpen || !task) return null;

  const completedCount = subtasks.filter((s) => s.is_completed).length;

  console.log("SUBTASKS EN MODAL:", task?.subtasks);
  console.log("PRIMERA SUBTASK:", task?.subtasks?.[0]);

  return (
    <div className={classes.backdrop} onMouseDown={onClose}>
      <div className={classes.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={classes.header}>
          <div>
            <h2 className={classes.title}>{task.title}</h2>
            <p className={classes.meta}>
              {task.course ? `Materia: ${task.course}` : "Sin materia"} •{" "}
              {subtasks.length
                ? `${completedCount}/${subtasks.length} (${progress}%)`
                : "0%"}
            </p>
          </div>

          <button
            className={classes.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className={classes.section}>
          <h3 className={classes.sectionTitle}>Descripción</h3>
          <p className={classes.description}>
            {task.description?.trim() ? task.description : "Sin descripción."}
          </p>
        </div>

        <div className={classes.section}>
          <div className={classes.subHeader}>
            <h3 className={classes.sectionTitle}>Subtareas</h3>
            <span className={classes.counter}>
              {completedCount}/{subtasks.length || 0}
            </span>
          </div>

          {error ? <div className={classes.error}>{error}</div> : null}

          {subtasks.length === 0 ? (
            <div className={classes.empty}>No hay subtareas todavía.</div>
          ) : (
            <ul className={classes.subtaskList}>
              {subtasks.map((st) => {
                const done = Boolean(st.is_completed);
                const isBusy = busyId === st.id;

                return (
                  <li key={st.id} className={classes.subtaskRow}>
                    <div className={classes.subtaskLeft}>
                      <div className={done ? classes.done : classes.pending}>
                        {st.name}
                      </div>
                      {st.description ? (
                        <div className={classes.subtaskDesc}>
                          {st.description}
                        </div>
                      ) : null}
                    </div>

                    <button
                      className={done ? classes.btnGhost : classes.btnPrimary}
                      onClick={() => toggleSubtask(st)}
                      disabled={isBusy}
                      aria-label={done ? "Marcar pendiente" : "Marcar lista"}
                    >
                      {isBusy ? "Guardando..." : done ? "Pendiente" : "Listo"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className={classes.footer}>
          <button className={classes.btnGhost} onClick={onClose}>
            Cerrar
          </button>

          <button
            className={classes.btnPrimary}
            onClick={() => {
              onClose?.();
              onEdit?.(task.id);
            }}
          >
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );
}
