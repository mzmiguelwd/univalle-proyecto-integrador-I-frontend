import { useState, useEffect } from "react";
import {
  MdCalendarToday,
  MdAccessTime,
  MdMenuBook,
  MdEdit,
  MdSubject,
  MdBookmarkBorder,
} from "react-icons/md";

import classes from "./TaskModalHeader.module.css";
import { fetchDashboardTasks } from "../../api/tasks";
import { formatDate, formatHours } from "../../utils/taskUtils";

export default function TaskModalHeader({
  details,
  draftTotalHours,
  editingTaskData,
  setEditingTaskData,
  savingTask,
  handleSaveTask,
  isEditingTask,
  setIsEditingTask,
}) {
  const [fieldEditing, setFieldEditing] = useState(null);
  const [localValue, setLocalValue] = useState("");

  const [availableCourses, setAvailableCourses] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchDashboardTasks();
        const courses = [
          ...new Set(data.map((task) => task.course).filter(Boolean)),
        ];
        setAvailableCourses(courses);
      } catch (error) {
        console.error("No se pudieron cargar los cursos previos", error);
      }
    };
    loadCourses();
  }, []);

  const filteredCourses = availableCourses.filter((course) =>
    course.toLowerCase().includes(localValue.toLowerCase()),
  );

  const handleCourseSelect = (selectedCourse) => {
    setLocalValue(selectedCourse);
    setShowSuggestions(false);
    setEditingTaskData((prev) => ({ ...prev, course: selectedCourse }));
    setIsEditingTask(true);
    setFieldEditing(null);
  };

  const handleStartEditField = (fieldKey, value) => {
    setFieldEditing(fieldKey);
    setLocalValue(value);
  };

  const handleSaveField = () => {
    if (fieldEditing) {
      setEditingTaskData((prev) => ({ ...prev, [fieldEditing]: localValue }));
    }

    setIsEditingTask(true);
    setFieldEditing(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && fieldEditing !== "description") {
      e.preventDefault();
      handleSaveField();
    }
    if (e.key === "Escape") setFieldEditing(null);
  };

  const getCurrentValue = (field, defaultVal) => {
    return isEditingTask ? editingTaskData[field] : defaultVal;
  };

  const handleCancelAll = () => {
    setEditingTaskData({
      title: details.title || "",
      description: details.description || "",
      course: details.course || "",
      due_date: details.due_date ? details.due_date.split("T")[0] : "",
      estimated_hours:
        details.total_estimated_hours || details.estimated_hours || "",
      task_type: details.task_type || "otro",
    });
    setIsEditingTask(false);
    setFieldEditing(null);
  };

  return (
    <div className={classes.headerContainer}>
      <h1 className={classes.taskTitle}>
        {fieldEditing === "title" ? (
          <div className={classes.editInlineBlock}>
            <input
              type="text"
              className={classes.inlineInput}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              autoFocus
              onBlur={handleSaveField}
              onKeyDown={handleKeyDown}
            />
          </div>
        ) : (
          <div
            className={classes.inlineViewBlock}
            onClick={() =>
              handleStartEditField(
                "title",
                getCurrentValue("title", details.title),
              )
            }
            title="Editar título"
          >
            <span>{getCurrentValue("title", details.title)}</span>
            <MdEdit className={classes.editHoverIcon} />
          </div>
        )}
      </h1>

      <div className={classes.taskMetaData}>
        <div className={classes.metaItem}>
          <MdCalendarToday className={classes.icon} />
          {fieldEditing === "due_date" ? (
            <input
              type="date"
              className={classes.inlineInput}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              autoFocus
              onBlur={handleSaveField}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <div
              className={classes.inlineViewBlock}
              onClick={() =>
                handleStartEditField(
                  "due_date",
                  getCurrentValue(
                    "due_date",
                    details.due_date ? details.due_date.split("T")[0] : "",
                  ),
                )
              }
              title="Editar fecha"
            >
              <span>
                {formatDate(
                  getCurrentValue(
                    "due_date",
                    details.due_date ? details.due_date.split("T")[0] : "",
                  ),
                )}
              </span>
              <MdEdit className={classes.editHoverIcon} />
            </div>
          )}
        </div>

        <div
          className={classes.metaItem}
          title="Horas estimadas totales (calculadas desde las subtareas)"
        >
          <MdAccessTime className={classes.icon} />
          <div className={`${classes.inlineViewBlock} ${classes.readOnlyBlock}`}>
            <span>
              {formatHours(
                draftTotalHours !== undefined
                  ? draftTotalHours
                  : details.total_estimated_hours ||
                      details.estimated_hours ||
                      0,
              )}
            </span>
          </div>
        </div>

        <div className={classes.metaItem}>
          <MdMenuBook className={classes.icon} />
          {fieldEditing === "course" ? (
            <div className={classes.autocompleteWrapper}>
              <input
                type="text"
                className={classes.inlineInput}
                value={localValue}
                onChange={(e) => {
                  setLocalValue(e.target.value);
                  setShowSuggestions(true);
                }}
                autoFocus
                onFocus={() => setShowSuggestions(true)}
                onBlur={handleSaveField}
                onKeyDown={handleKeyDown}
                placeholder="Materia"
                autoComplete="off"
              />
              {showSuggestions && filteredCourses.length > 0 && (
                <ul className={classes.suggestionsList}>
                  {filteredCourses.map((course) => (
                    <li
                      key={course}
                      className={classes.suggestionItem}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleCourseSelect(course);
                      }}
                    >
                      {course}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div
              className={classes.inlineViewBlock}
              onClick={() =>
                handleStartEditField(
                  "course",
                  getCurrentValue("course", details.course) || "",
                )
              }
              title="Editar materia"
            >
              <span className={getCurrentValue("course", details.course) ? classes.valueHasContent : classes.valuePlaceholder}>
                {getCurrentValue("course", details.course) || "Agregar materia"}
              </span>
              <MdEdit className={classes.editHoverIcon} />
            </div>
          )}
        </div>

        <div className={classes.metaItem}>
          <MdBookmarkBorder className={classes.icon} />
          {fieldEditing === "task_type" ? (
            <select
              className={classes.inlineInput}
              value={localValue}
              onChange={(e) => {
                setLocalValue(e.target.value);
              }}
              autoFocus
              onBlur={handleSaveField}
              onKeyDown={handleKeyDown}
            >
              <option value="examen">Examen</option>
              <option value="quiz">Quiz</option>
              <option value="taller">Taller</option>
              <option value="proyecto">Proyecto</option>
              <option value="otro">Otro</option>
            </select>
          ) : (
            <div
              className={classes.inlineViewBlock}
              onClick={() =>
                handleStartEditField(
                  "task_type",
                  getCurrentValue("task_type", details.task_type) || "otro",
                )
              }
              title="Editar tipo"
            >
              <span className={classes.capitalizedText}>
                {getCurrentValue("task_type", details.task_type) || "Otro"}
              </span>
              <MdEdit className={classes.editHoverIcon} />
            </div>
          )}
        </div>
      </div>

      <div className={classes.descriptionSection}>
        {fieldEditing === "description" ? (
          <div className={classes.editDescriptionBlock}>
            <textarea
              className={classes.descriptionInput}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveField}
              placeholder="Añade una descripción más detallada..."
              autoFocus
            />
          </div>
        ) : (
          <div
            className={classes.descriptionViewBlock}
            onClick={() =>
              handleStartEditField(
                "description",
                getCurrentValue("description", details.description) || "",
              )
            }
          >
            <MdSubject className={classes.descIcon} />
            <p
              className={
                getCurrentValue("description", details.description)
                  ? classes.descriptionText
                  : classes.emptyDescriptionText
              }
            >
              {getCurrentValue("description", details.description) ||
                "Añade una descripción más detallada..."}
            </p>
            <MdEdit className={classes.descEditHoverIcon} />
          </div>
        )}
      </div>

      {isEditingTask && (
        <div className={classes.globalActions}>
          <button
            className={classes.saveBtn}
            onClick={handleSaveTask}
            disabled={savingTask}
          >
            {savingTask ? "Guardando..." : "Guardar todos los cambios"}
          </button>
          <button className={classes.cancelBtn} onClick={handleCancelAll}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
