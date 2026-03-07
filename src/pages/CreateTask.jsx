import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { MdFormatListBulleted } from "react-icons/md";
import toast from "react-hot-toast";

import classes from "./CreateTask.module.css";
import { createTask, fetchDashboardTasks } from "../api/tasks";
import CreateSubtask from "../components/CreateSubtask";


const CreateTask = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [availableCourses, setAvailableCourses] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    course: "",
    task_type: "otro",
    due_date: "",
    description: "",
  });

  const [subtasks, setSubtasks] = useState([]);
  
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

  const isFormValid =
    formData.title.trim().length > 0 && formData.course.trim().length > 0;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const filteredCourses = availableCourses.filter((course) =>
    course.toLowerCase().includes(formData.course.toLowerCase()),
  );

  const handleCourseSelect = (selectedCourse) => {
    setFormData((prevData) => ({
      ...prevData,
      course: selectedCourse,
    }));
    setShowSuggestions(false);
  };

  const handleTypeSelect = (type) => {
    setFormData((prevData) => ({
      ...prevData,
      task_type: type,
    }));
  };

  const onSubtaskCreated = (subtask) => {
    setSubtasks((prev) => [...prev, subtask]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid) return;

    setIsLoading(true);
    setError(null);

    const dataToSubmit = {
      ...formData,
      subtasks: subtasks,
    };
    if (!dataToSubmit.due_date) {
      dataToSubmit.due_date = null;
    }

    try {
      await createTask(dataToSubmit);
      toast.success("Tarea creada");
      navigate("/hoy");
    } catch (error) {
      let errorMessage =
        "Ocurrió un error al crear la tarea. Revisa los datos.";

      if (error.response && error.response.data) {
        const data = error.response.data;
        const errorKeys = Object.keys(data);
        if (errorKeys.length > 0) {
          const firstError = data[errorKeys[0]];
          if (Array.isArray(firstError)) {
            errorMessage = `${errorKeys[0]}: ${firstError[0]}`;
          } else if (typeof firstError === "string") {
            errorMessage = firstError;
          }
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={classes.pageContainer}>
      <div className={classes.card}>
        <form className={classes.form} onSubmit={handleSubmit}>
          <h2 className={classes.title}>Nueva Actividad</h2>
          <p className={classes.requiredNote}>Los campos con * son obligatorios.</p>

          {error && <div className={classes.errorBox}>{error}</div>}

          <div className={classes.formGroup}>
            <label htmlFor="title">Título de la actividad *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Sprint 1 - Desarrollo Backend"
              required
            />
          </div>

          <div className={classes.formGroup}>
            <label htmlFor="course">Curso / Asignatura *</label>
            <div className={classes.autocompleteWrapper}>
              <input
                id="course"
                type="text"
                name="course"
                value={formData.course}
                onChange={(e) => {
                  handleChange(e);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onClick={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Ej: Proyecto Integrador I"
                autoComplete="off"
                required
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
            <span className={classes.helpText}>
              Selecciona uno existente o escribe uno nuevo.
            </span>
          </div>

          <div className={classes.formGroup}>
            <label>Tipo de actividad</label>
            <div className={classes.typeContainer}>
              {["examen", "quiz", "taller", "proyecto", "otro"].map((type) => (
                <button
                  type="button"
                  key={type}
                  className={`${classes.typeButton} ${
                    formData.task_type === type ? classes.active : ""
                  }`}
                  onClick={() => handleTypeSelect(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={classes.formGroup}>
            <label htmlFor="due_date">Fecha y hora límite (Opcional)</label>
            <input
              id="due_date"
              type="datetime-local"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>

          <div className={classes.formGroup}>
            <label htmlFor="description">Descripción (Opcional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Añade detalles, enlaces o notas sobre la actividad..."
              rows="4"
            ></textarea>
          </div>

          <section className={classes.subtasksSection}>
            <div className={classes.subtasksHeader}>
              <h2>Plan de Trabajo (Subtareas)</h2>
              <span className={classes.subtaskCount}>{subtasks.length}</span>
            </div>

            <div className={classes.addBox}>
              <CreateSubtask onSubtaskCreated={onSubtaskCreated} />
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
                        {subtask.estimated_hours} h
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className={classes.actions}>
            <button
              type="submit"
              className={classes.submitBtn}
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? "Guardando..." : "Crear Actividad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
