import { useEffect, useMemo, useState } from "react";
import classes from "./TaskDetailsModal.module.css";
import api from "../api/client";
import { FiEdit2, FiSave, FiTrash2 } from "react-icons/fi";

export default function TaskDetailsModal({ isOpen, onClose, task, onEdit }) {
  const [subtasks, setSubtasks] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [editingSection, setEditingSection] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [localTask, setLocalTask] = useState(task);

  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const [creatingSubtask, setCreatingSubtask] = useState(false);
  const [newSubtaskDate, setNewSubtaskDate] = useState("");
  const [newSubtaskHours, setNewSubtaskHours] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskValue, setEditingSubtaskValue] = useState("");
  const [savingSubtaskId, setSavingSubtaskId] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setBusyId(null);
    setHasChanges(false);
    setEditingSection(null);
    setEditingValue("");
    setEditingSubtaskId(null);
    setEditingSubtaskValue("");
    setSubtasks(Array.isArray(task?.subtasks) ? task.subtasks : []);
  }, [isOpen, task]);

  const handleRequestClose = () => {
    onClose?.(hasChanges);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => e.key === "Escape" && handleRequestClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, hasChanges]);

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
      setHasChanges(true);
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

  const handleEditSection = (section) => {
    setEditingSection(section);

    if (section === "title") {
      setEditingValue(task.title || "");
    }

    if (section === "description") {
      setEditingValue(localTask?.description || "");
    }
  };

  const handleSaveTitle = async () => {
    const trimmedValue = editingValue.trim();

    if (!trimmedValue) {
      setEditingSection(null);
      setEditingValue(localTask?.title || "");
      return;
    }

    try {
      await api.patch(`/api/tasks/${task.id}/`, {
        title: trimmedValue,
      });

      setLocalTask((prev) => ({
        ...prev,
        title: trimmedValue,
      }));
      setHasChanges(true);
    } catch (err) {
      console.error("Error actualizando título:", err);
    } finally {
      setEditingSection(null);
    }
  };

  const handleSaveDescription = async () => {
    const trimmedValue = editingValue.trim();

    try {
      await api.patch(`/api/tasks/${task.id}/`, {
        description: trimmedValue,
      });

      setLocalTask((prev) => ({
        ...prev,
        description: trimmedValue,
      }));
      setHasChanges(true);
    } catch (err) {
      console.error("Error actualizando descripción:", err);
    } finally {
      setEditingSection(null);
    }
  };

  const handleStartEditSubtask = (st) => {
    if (!st?.id) return;
    setEditingSubtaskId(st.id);
    setEditingSubtaskValue(st.name || "");
  };

  const handleSaveSubtask = async (st) => {
    if (!st?.id) return;

    const trimmedName = editingSubtaskValue.trim();
    if (!trimmedName || savingSubtaskId) return;

    setSavingSubtaskId(st.id);
    setError("");

    try {
      await api.patch(`/api/subtasks/${st.id}/`, { name: trimmedName });

      setSubtasks((prev) =>
        prev.map((item) =>
          item.id === st.id ? { ...item, name: trimmedName } : item,
        ),
      );
      setHasChanges(true);

      setEditingSubtaskId(null);
      setEditingSubtaskValue("");
    } catch (err) {
      console.error("Error actualizando subtarea:", err);
      setError("No se pudo guardar el nombre de la subtarea.");
    } finally {
      setSavingSubtaskId(null);
    }
  };

  const getSubtaskStatusLabel = (st) => {
    return st.is_completed
      ? "Completado"
      : "Pendiente (presiona para completar)";
  };

  const handleAddSubtask = async () => {
    const trimmedValue = newSubtaskName.trim();

    if (!trimmedValue || !task?.id || creatingSubtask) return;

    setCreatingSubtask(true);
    setError("");

    const date = newSubtaskDate || new Date().toISOString().split("T")[0];
    const hours = Number(newSubtaskHours) || 0;

    try {
      const response = await api.post("/api/subtasks/", {
        task: task.id,
        name: trimmedValue,
        target_date: date,
        original_target_date: date,
        estimated_hours: hours,
        status: "pending",
        note: "",
      });

      const createdSubtask = response.data;

      setSubtasks((prev) => [...prev, createdSubtask]);
      setHasChanges(true);

      setNewSubtaskName("");
      setNewSubtaskDate("");
      setNewSubtaskHours("");
      setIsAddingSubtask(false);
    } catch (err) {
      console.error("Error creando subtarea:", err);
      setError("No se pudo crear la subtarea.");
    } finally {
      setCreatingSubtask(false);
    }
  };

  const formatSubtaskDate = (dateString) => {
    if (!dateString) return "Sin fecha";

    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDeleteSubtask = async (st) => {
    if (!st?.id) return;

    try {
      await api.delete(`/api/subtasks/${st.id}/`);

      setSubtasks((prev) => prev.filter((sub) => sub.id !== st.id));
      setHasChanges(true);
    } catch (err) {
      console.error("Error eliminando subtarea:", err);
      setError("No se pudo eliminar la subtarea.");
    }
  };

  const handleCancelAddSubtask = () => {
    setIsAddingSubtask(false);
    setNewSubtaskName("");
    setNewSubtaskDate("");
    setNewSubtaskHours("");
  };

  return (
    <div className={classes.backdrop} onMouseDown={handleRequestClose}>
      <div className={classes.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={classes.header}>
          <div className={classes.headerMain}>
            <div className={classes.row}>
              {editingSection === "title" ? (
                <input
                  className={classes.titleInput}
                  value={editingValue}
                  placeholder="Título de la tarea"
                  autoFocus
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveTitle();
                    }
                    if (e.key === "Escape") {
                      setEditingSection(null);
                    }
                  }}
                />
              ) : (
                <h2 className={classes.title}>{localTask?.title}</h2>
              )}
              <button
                className={classes.editBtn}
                onClick={() =>
                  editingSection === "title"
                    ? handleSaveTitle()
                    : handleEditSection("title")
                }
                aria-label={
                  editingSection === "title"
                    ? "Guardar título"
                    : "Editar título"
                }
              >
                {editingSection === "title" ? <FiSave /> : <FiEdit2 />}
              </button>
            </div>

            <p className={classes.meta}>
              {task.course ? `Materia: ${task.course}` : "Sin materia"} •{" "}
              {subtasks.length ? `${completedCount}/${subtasks.length}` : "0/0"}
            </p>

            <div className={classes.progressBlock}>
              <div className={classes.progressTrack}>
                <div
                  className={classes.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={classes.progressText}>
                {progress}% completado
              </span>
            </div>
          </div>

          <button
            className={classes.closeBtn}
            onClick={handleRequestClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className={classes.section}>
          <div className={classes.row}>
            <h3 className={classes.sectionTitle}>Descripción</h3>

            <button
              className={classes.editBtn}
              onClick={() =>
                editingSection === "description"
                  ? handleSaveDescription()
                  : handleEditSection("description")
              }
              aria-label={
                editingSection === "description"
                  ? "Guardar descripción"
                  : "Editar descripción"
              }
            >
              {editingSection === "description" ? <FiSave /> : <FiEdit2 />}
            </button>
          </div>

          {editingSection === "description" ? (
            <textarea
              className={classes.descriptionInput}
              value={editingValue}
              placeholder="Escribe una descripción"
              autoFocus
              onChange={(e) => setEditingValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveDescription();
                }

                if (e.key === "Escape") {
                  setEditingSection(null);
                  setEditingValue(task.description || "");
                }
              }}
              rows={4}
            />
          ) : (
            <p className={classes.description}>
              {localTask?.description?.trim()
                ? localTask.description
                : "Sin descripción."}
            </p>
          )}
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
                    <div className={classes.subtaskTop}>
                      <div className={classes.subtaskLeft}>
                        {editingSubtaskId === st.id ? (
                          <input
                            className={classes.subtaskInput}
                            value={editingSubtaskValue}
                            onChange={(e) =>
                              setEditingSubtaskValue(e.target.value)
                            }
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveSubtask(st);
                              }
                              if (e.key === "Escape") {
                                setEditingSubtaskId(null);
                                setEditingSubtaskValue("");
                              }
                            }}
                          />
                        ) : (
                          <div
                            className={done ? classes.done : classes.pending}
                          >
                            {st.name}
                          </div>
                        )}

                        <div className={classes.subtaskMeta}>
                          <span className={classes.subtaskMetaItem}>
                            📅 {formatSubtaskDate(st.target_date)}
                          </span>

                          <span className={classes.subtaskMetaItem}>
                            ⏱ {st.estimated_hours ?? 0}h
                          </span>
                        </div>

                        {st.description ? (
                          <div className={classes.subtaskDesc}>
                            {st.description}
                          </div>
                        ) : null}
                      </div>

                      <div className={classes.subtaskActions}>
                        <button
                          className={classes.editBtn}
                          onClick={() =>
                            editingSubtaskId === st.id
                              ? handleSaveSubtask(st)
                              : handleStartEditSubtask(st)
                          }
                          disabled={savingSubtaskId === st.id}
                          aria-label={
                            editingSubtaskId === st.id
                              ? "Guardar subtarea"
                              : "Editar subtarea"
                          }
                        >
                          {editingSubtaskId === st.id ? (
                            <FiSave />
                          ) : (
                            <FiEdit2 />
                          )}
                        </button>

                        <button
                          className={classes.deleteBtn}
                          onClick={() => handleDeleteSubtask(st)}
                          disabled={isBusy}
                          aria-label="Eliminar subtarea"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    <button
                      className={`${classes.statusBadge} ${
                        done ? classes.statusDone : classes.statusPending
                      } ${classes.statusBadgeWide}`}
                      onClick={() => toggleSubtask(st)}
                      disabled={isBusy}
                      aria-label={
                        done ? "Cambiar a pendiente" : "Cambiar a completado"
                      }
                    >
                      {isBusy ? "Guardando..." : getSubtaskStatusLabel(st)}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className={classes.addSubtaskBlock}>
            {isAddingSubtask ? (
              <div className={classes.newSubtaskForm}>
                <input
                  className={classes.subtaskInput}
                  value={newSubtaskName}
                  placeholder="Nombre de la subtarea"
                  autoFocus
                  onChange={(e) => setNewSubtaskName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubtask();
                    }

                    if (e.key === "Escape") {
                      handleCancelAddSubtask();
                    }
                  }}
                />

                <div className={classes.subtaskMetaRow}>
                  <input
                    type="date"
                    className={classes.subtaskDate}
                    value={newSubtaskDate}
                    onChange={(e) => setNewSubtaskDate(e.target.value)}
                  />

                  <input
                    type="number"
                    className={classes.subtaskHours}
                    placeholder="Horas"
                    value={newSubtaskHours}
                    onChange={(e) => setNewSubtaskHours(e.target.value)}
                  />
                </div>

                <div className={classes.newSubtaskActions}>
                  <button
                    type="button"
                    className={classes.cancelSubtaskBtn}
                    onClick={handleCancelAddSubtask}
                    disabled={creatingSubtask}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className={classes.saveSubtaskBtn}
                    onClick={handleAddSubtask}
                    disabled={creatingSubtask || !newSubtaskName.trim()}
                  >
                    {creatingSubtask ? "Guardando..." : "Agregar subtarea"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                className={classes.addSubtaskBtn}
                onClick={() => setIsAddingSubtask(true)}
              >
                + Añadir subtarea
              </button>
            )}
          </div>
        </div>

        <div className={classes.footer}>
          <button className={classes.btnGhost} onClick={handleRequestClose}>
            Cerrar
          </button>

          <button
            className={classes.btnPrimary}
            onClick={() => {
              handleRequestClose();
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
