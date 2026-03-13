import { useState } from "react";
import { formatDate, formatHours } from "../../utils/taskUtils";
import { partiallyUpdateSubtask } from "../../api/tasks";
import classes from "./OverloadResolutionModal.module.css";

const hourOptions = [
  { label: "15 min", value: "0.25" },
  { label: "30 min", value: "0.5" },
  { label: "45 min", value: "0.75" },
  { label: "1 hora", value: "1.0" },
  { label: "1.5 horas", value: "1.5" },
  { label: "2 horas", value: "2.0" },
  { label: "3 horas", value: "3.0" },
];

const normalizeHourOption = (val) => {
  if (!val) return "";

  const num = Number(val);

  const match = hourOptions.find(
    (opt) => Number(opt.value) === num
  );

  return match ? match.value : String(val);
};

function OverloadResolutionModal({ day, onClose, onTasksUpdated }) {
  const [subtasks, setSubtasks] = useState(day.subtasks);
  const [saving, setSaving] = useState(false);

  const updateSubtask = (id, field, value) => {
    setSubtasks((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              [field]: value,
            }
          : s,
      ),
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updates = subtasks.map((sub) =>
        partiallyUpdateSubtask(sub.id, {
          target_date: sub.target_date,
          estimated_hours: Number(sub.estimated_hours),
        })
      );

      await Promise.all(updates);

      if (onTasksUpdated) {
        await onTasksUpdated();
      }

      onClose();
    } catch (error) {
      console.error("Error actualizando subtareas", error);
    } finally {
      setSaving(false);
    }
  };

  if (saving) {
    return (
      <div className={classes.overlay}>
        <div className={classes.modal}>
          <div className={classes.loadingState}>
            <div className={classes.spinner}></div>
            <p>Guardando cambios...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={classes.overlay}>
      <div className={classes.modal}>
        <div className={classes.header}>
          <h2>Resolver sobrecarga</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <p className={classes.description}>
          El día <b>{formatDate(day.date)}</b> tiene demasiadas horas
          programadas. Ajusta las subtareas para resolver el conflicto.
        </p>

        <div className={classes.list}>
          {subtasks.map((sub) => (
            <div key={sub.id} className={classes.row}>
              <div className={classes.subtaskInfo}>
                <strong>{sub.name}</strong>
                <span className={classes.taskName}>{sub.taskTitle}</span>
              </div>

              <input
                type="date"
                className={classes.inlineInput}
                max={sub.taskDueDate ? sub.taskDueDate.split("T")[0] : undefined}
                value={sub.target_date || ""}
                onChange={(e) =>
                    updateSubtask(sub.id, "target_date", e.target.value)
                }
              />

              <select
                className={classes.inlineInput}
                value={normalizeHourOption(sub.estimated_hours)}
                onChange={(e) =>
                  updateSubtask(sub.id, "estimated_hours", e.target.value)
                }
              >
                <option value="" disabled>
                  Horas
                </option>

                {hourOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}

                {sub.estimated_hours &&
                  !hourOptions.some(
                    (o) => Number(o.value) === Number(sub.estimated_hours)
                  ) && (
                    <option value={String(sub.estimated_hours)}>
                      {formatHours(Number(sub.estimated_hours))}
                    </option>
                  )}
              </select>

              <span className={classes.hoursDisplay}>
                {sub.estimated_hours
                  ? formatHours(sub.estimated_hours)
                  : ""}
              </span>
            </div>
          ))}
        </div>

        <div className={classes.footer}>
          <button className={classes.cancelBtn} onClick={onClose}>
            Cerrar
          </button>

          <button className={classes.saveBtn} onClick={handleSave}>
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

export default OverloadResolutionModal;