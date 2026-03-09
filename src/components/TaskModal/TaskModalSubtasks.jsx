import { useState } from "react";
import {
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdAdd,
  MdDeleteOutline,
  MdCalendarToday,
  MdAccessTime,
  MdEdit,
} from "react-icons/md";

import classes from "./TaskModalSubtasks.module.css";
import { formatDate, formatHours } from "../../utils/taskUtils";

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
  const match = hourOptions.find((opt) => Number(opt.value) === num);
  return match ? match.value : String(val);
};

export default function TaskModalSubtasks({
  error,
  busyId,
  draftSubtasks,
  handleUpdateDraftSubtask,
  isEditingSubtasks,
  savingSubtasks,
  handleSaveSubtasks,
  handleDeleteSubtask,
  toggleSubtask,
  isAddingSubtask,
  setIsAddingSubtask,
  newSubtaskName,
  setNewSubtaskName,
  newSubtaskDate,
  setNewSubtaskDate,
  newSubtaskHours,
  setNewSubtaskHours,
  handleAddSubtask,
  handleCancelAddSubtask,
  creatingSubtask,
  taskDueDate,
}) {
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);

  return (
    <div className={classes.section}>
      <div className={classes.sectionHeader}>
        <h3 className={classes.sectionTitle}>
          <MdCheckBox size={20} />
          Plan de Trabajo (Subtareas)
        </h3>
        {isEditingSubtasks && (
          <button
            className={`${classes.saveBtn} ${classes.savePlanBtn}`}
            onClick={handleSaveSubtasks}
            disabled={savingSubtasks}
          >
            {savingSubtasks ? "Guardando..." : "Guardar plan de trabajo"}
          </button>
        )}
      </div>
      {error && <p className={classes.errorText}>{error}</p>}

      <div className={classes.subtaskList}>
        {draftSubtasks.map((st) => {
          const isDone = st.status === "done" || st.is_completed;
          const isEditing = editingSubtaskId === st.id;

          if (isEditing) {
            return (
              <div
                key={st.id}
                className={`${classes.subtaskRow} ${classes.subtaskRowEditing}`}
              >
                <div className={classes.editSubtaskBlock}>
                  <input
                    className={classes.inlineInput}
                    placeholder="Nombre de la subtarea"
                    value={st.name || st.title || ""}
                    onChange={(e) =>
                      handleUpdateDraftSubtask(st.id, "name", e.target.value)
                    }
                    autoFocus
                  />
                  <div className={classes.editSubtaskRow}>
                    <input
                      type="date"
                      max={taskDueDate ? taskDueDate.split("T")[0] : undefined}
                      className={classes.inlineInput}
                      value={st.target_date || ""}
                      onChange={(e) =>
                        handleUpdateDraftSubtask(
                          st.id,
                          "target_date",
                          e.target.value,
                        )
                      }
                      title="Fecha estimada"
                    />
                    <select
                      className={`${classes.inlineInput} ${classes.hourSelect}`}
                      value={normalizeHourOption(st.estimated_hours)}
                      onChange={(e) =>
                        handleUpdateDraftSubtask(
                          st.id,
                          "estimated_hours",
                          e.target.value,
                        )
                      }
                      title="Horas"
                    >
                      <option value="" disabled>
                        Horas
                      </option>
                      {hourOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                      {st.estimated_hours &&
                        !hourOptions.some(
                          (o) => Number(o.value) === Number(st.estimated_hours),
                        ) && (
                          <option value={String(st.estimated_hours)}>
                            {formatHours(Number(st.estimated_hours))}
                          </option>
                        )}
                    </select>
                  </div>
                  <textarea
                    placeholder="Descripción (opcional)"
                    className={`${classes.inlineInput} ${classes.noteTextarea}`}
                    value={st.note || ""}
                    onChange={(e) =>
                      handleUpdateDraftSubtask(st.id, "note", e.target.value)
                    }
                  />
                </div>
                <div className={classes.actionGroup}>
                  <button
                    className={classes.saveBtn}
                    onClick={() => setEditingSubtaskId(null)}
                  >
                    Hecho
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={st.id} className={classes.subtaskRow}>
              <div className={classes.checkboxContent}>
                <button
                  className={`${classes.checkboxBtn} ${isDone ? classes.done : ""}`}
                  onClick={() => toggleSubtask(st)}
                  disabled={busyId === st.id}
                  title={
                    isDone ? "Marcar como pendiente" : "Marcar como completada"
                  }
                >
                  {isDone ? (
                    <MdCheckBox size={20} color="white" />
                  ) : (
                    <MdCheckBoxOutlineBlank size={20} color="transparent" />
                  )}
                </button>
              </div>

              <div className={classes.subtaskInfo}>
                <p
                  className={`${classes.subtaskName} ${isDone ? classes.doneText : ""} ${st.note ? classes.subtaskNameHasNote : ""}`}
                  onClick={() => setEditingSubtaskId(st.id)}
                >
                  {st.name || st.title}
                </p>
                {st.note && (
                  <p className={classes.subtaskNote}>
                    {st.note}
                  </p>
                )}
                <div className={classes.subtaskMeta}>
                  {st.target_date && (
                    <span className={classes.metaBadge}>
                      <MdCalendarToday /> {formatDate(st.target_date)}
                    </span>
                  )}
                  {st.estimated_hours > 0 && (
                    <span className={classes.metaBadge}>
                      <MdAccessTime /> {formatHours(st.estimated_hours)}
                    </span>
                  )}
                </div>
              </div>

              <div className={classes.subtaskActions}>
                <button
                  className={classes.editIconBtn}
                  onClick={() => setEditingSubtaskId(st.id)}
                  title="Editar"
                >
                  <MdEdit size={18} />
                </button>
                <button
                  className={classes.deleteIconBtn}
                  onClick={() => handleDeleteSubtask(st)}
                  title="Eliminar"
                >
                  <MdDeleteOutline size={18} />
                </button>
              </div>
            </div>
          );
        })}

        {!isAddingSubtask ? (
          <button
            className={classes.addSubtaskBtn}
            onClick={() => setIsAddingSubtask(true)}
          >
            <MdAdd size={20} />
            <span>Añadir subtarea</span>
          </button>
        ) : (
          <div className={classes.addSubtaskForm}>
            <input
              autoFocus
              className={classes.inlineInput}
              placeholder="Nombre de la nueva subtarea"
              value={newSubtaskName}
              onChange={(e) => setNewSubtaskName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSubtask();
                if (e.key === "Escape") handleCancelAddSubtask();
              }}
            />
            <div className={classes.editSubtaskRow}>
              <div className={classes.formField}>
                <span className={classes.fieldLabel}>
                  Fecha
                </span>
                <input
                  type="date"
                  max={taskDueDate ? taskDueDate.split("T")[0] : undefined}
                  className={classes.inlineInput}
                  value={newSubtaskDate}
                  onChange={(e) => setNewSubtaskDate(e.target.value)}
                />
              </div>
              <div className={classes.formField}>
                <span className={classes.fieldLabel}>
                  Horas
                </span>
                <select
                  className={`${classes.inlineInput} ${classes.hourSelect}`}
                  value={newSubtaskHours}
                  onChange={(e) => setNewSubtaskHours(e.target.value)}
                >
                  {hourOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={classes.actionGroup}>
              <button
                className={classes.saveBtn}
                onClick={handleAddSubtask}
                disabled={
                  creatingSubtask ||
                  !newSubtaskName.trim() ||
                  !newSubtaskDate ||
                  !newSubtaskHours
                }
              >
                {creatingSubtask ? "Guardando..." : "Añadir al plan"}
              </button>
              <button
                className={classes.cancelBtn}
                onClick={handleCancelAddSubtask}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
