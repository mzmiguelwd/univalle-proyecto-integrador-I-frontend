import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdCalendarToday,
  MdLabel,
  MdFormatListBulleted,
  MdEdit,
  MdDelete,
  MdClose,
  MdSave,
} from "react-icons/md";

import classes from "./TaskDetail.module.css";
import {
  fetchTaskById,
  updateTask,
  deleteTask,
  fetchDashboardTasks,
} from "../api/tasks";
import { formatHours } from "../utils/taskUtils";
import CreateSubtask from "../components/CreateSubtask";

function sortSubtasksByDate(subtasks) {
  return [...subtasks].sort((a, b) => {
    if (a.target_date < b.target_date) return -1;
    if (a.target_date > b.target_date) return 1;
    return 0;
  });
}

function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showCourseSuggestions, setShowCourseSuggestions] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    course: "",
    task_type: "otro",
    due_date: "",
    description: "",
  });

  useEffect(() => {
    const loadTask = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchTaskById(id);
        setTask(data);
        setSubtasks(sortSubtasksByDate(data.subtasks || []));
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError("La actividad que buscas no existe o fue eliminada.");
        } else {
          setError(
            err.response?.data?.detail || "No se pudo cargar la actividad.",
          );
        }
      } finally {
        setLoading(false);
      }
    };
    loadTask();
  }, [id]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchDashboardTasks();
        const courses = [...new Set(data.map((t) => t.course).filter(Boolean))];
        setAvailableCourses(courses);
      } catch (error) {
        console.error("No se pudieron cargar los cursos previos", error);
      }
    };
    loadCourses();
  }, []);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar esta actividad? Todas sus subtareas se perderán permanentemente.",
    );
    if (!confirmDelete) return;

    try {
      await deleteTask(id);
      navigate("/hoy");
    } catch (error) {
      alert("Hubo un error al intentar eliminar la tarea.");
    }
  };

  const formatDateForInput = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const startEditing = () => {
    setEditData({
      title: task.title,
      course: task.course,
      task_type: task.task_type || "otro",
      due_date: formatDateForInput(task.due_date),
      description: task.description || "",
    });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dataToSubmit = { ...editData };
      if (!dataToSubmit.due_date) dataToSubmit.due_date = null;

      const updatedTask = await updateTask(id, dataToSubmit);
      setTask(updatedTask);
      setIsEditing(false);
    } catch (error) {
      alert("Error al actualizar la tarea. Revisa los datos.");
    } finally {
      setIsSaving(false);
    }
  };

  const dueDateLabel = useMemo(() => {
    if (!task?.due_date) return "Sin fecha límite";
    return new Date(task.due_date).toLocaleString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [task?.due_date]);

  const onSubtaskCreated = (newSubtask) => {
    setSubtasks((prevSubtasks) =>
      sortSubtasksByDate([...prevSubtasks, newSubtask]),
    );
  };

  const filteredCourses = availableCourses.filter((course) =>
    course.toLowerCase().includes((editData.course || "").toLowerCase()),
  );

  const handleCourseSelect = (selectedCourse) => {
    handleEditChange({
      target: { name: "course", value: selectedCourse },
    });
    setShowCourseSuggestions(false);
  };

  if (loading)
    return (
      <div className={classes.loadingContainer}>
        <div className={classes.spinner}></div>
        <p>Cargando detalles...</p>
      </div>
    );

  if (error || !task)
    return (
      <div className={classes.pageWrapper}>
        <div className={classes.container}>
          <Link to="/hoy" className={classes.backLink}>
            ← Volver
          </Link>
          <div className={classes.errorCard}>
            {error || "No se encontró la actividad."}
          </div>
        </div>
      </div>
    );

  return (
    <div className={classes.pageWrapper}>
      <div className={classes.container}>
        <nav className={classes.navigation}>
          <Link to="/hoy" className={classes.backLink}>
            <MdArrowBack className={classes.backIcon} />
            Volver al panel
          </Link>
        </nav>

        {isEditing ? (
          <header className={classes.headerCard}>
            <div className={classes.editHeader}>
              <h2>Editar Actividad</h2>
              <button
                className={classes.iconBtn}
                onClick={() => setIsEditing(false)}
                title="Cancelar"
              >
                <MdClose />
              </button>
            </div>

            <form className={classes.editForm} onSubmit={submitEdit}>
              <input
                type="text"
                name="title"
                value={editData.title}
                onChange={handleEditChange}
                required
                placeholder="Título"
                className={classes.editInput}
              />

              <div className={classes.editRow}>
                <div className={classes.autocompleteWrapper}>
                  <input
                    type="text"
                    name="course"
                    value={editData.course}
                    onChange={(e) => {
                      handleEditChange(e);
                      setShowCourseSuggestions(true);
                    }}
                    onFocus={() => setShowCourseSuggestions(true)}
                    onClick={() => setShowCourseSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowCourseSuggestions(false), 150)
                    }
                    required
                    placeholder="Curso"
                    autoComplete="off"
                    className={classes.editInput}
                  />

                  {showCourseSuggestions && filteredCourses.length > 0 && (
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

                <select
                  name="task_type"
                  value={editData.task_type}
                  onChange={handleEditChange}
                  className={classes.editInput}
                >
                  <option value="examen">Examen</option>
                  <option value="quiz">Quiz</option>
                  <option value="taller">Taller</option>
                  <option value="proyecto">Proyecto</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <input
                type="datetime-local"
                name="due_date"
                value={editData.due_date}
                onChange={handleEditChange}
                className={classes.editInput}
              />

              <textarea
                name="description"
                value={editData.description}
                onChange={handleEditChange}
                placeholder="Descripción..."
                rows="3"
                className={classes.editInput}
              ></textarea>

              <div className={classes.editActions}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className={classes.cancelBtn}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={classes.saveBtn}
                >
                  {isSaving ? (
                    "Guardando..."
                  ) : (
                    <>
                      <MdSave /> Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </header>
        ) : (
          <header className={classes.headerCard}>
            <div className={classes.headerTop}>
              <span className={classes.courseTag}>{task.course}</span>

              <div className={classes.actionButtons}>
                <button
                  onClick={startEditing}
                  className={classes.iconBtn}
                  title="Editar tarea"
                >
                  <MdEdit />
                </button>
                <button
                  onClick={handleDelete}
                  className={`${classes.iconBtn} ${classes.deleteBtn}`}
                  title="Eliminar tarea"
                >
                  <MdDelete />
                </button>
              </div>
            </div>

            <h1 className={classes.title}>{task.title}</h1>

            <div className={classes.metaInfo}>
              <div className={classes.metaItem}>
                <MdCalendarToday className={classes.metaIcon} />
                <span>{dueDateLabel}</span>
              </div>
              {task.task_type && (
                <div className={classes.metaItem}>
                  <MdLabel className={classes.metaIcon} />
                  <span className={classes.capitalize}>{task.task_type}</span>
                </div>
              )}
            </div>

            {task.description && (
              <div className={classes.descriptionBox}>
                <h3>Descripción</h3>
                <p>{task.description}</p>
              </div>
            )}
          </header>
        )}

        <section className={classes.subtasksSection}>
          <div className={classes.subtasksHeader}>
            <h2>Plan de Trabajo (Subtareas)</h2>
            <span className={classes.subtaskCount}>{subtasks.length}</span>
          </div>

          <div className={classes.addBox}>
            <CreateSubtask
              taskId={task.id}
              onSubtaskCreated={onSubtaskCreated}
              taskDueDate={task?.due_date}
            />
          </div>
          {subtasks.length === 0 ? (
            <div className={classes.emptyState}>
              <MdFormatListBulleted className={classes.emptyIcon} />
              <p>Divide y vencerás. Añade la primera subtarea para empezar.</p>
            </div>
          ) : (
            <ul className={classes.subtaskList}>
              {subtasks.map((subtask) => (
                <li key={subtask.id} className={classes.subtaskItem}>
                  <div className={classes.subtaskLeft}>
                    <div className={classes.checkboxDummy}></div>
                    <div>
                      <strong>{subtask.name}</strong>
                      <p>Para el {subtask.target_date}</p>
                    </div>
                  </div>
                  <div className={classes.subtaskRight}>
                    <span className={classes.hoursBadge}>
                      {formatHours(subtask.estimated_hours)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default TaskDetailPage;
