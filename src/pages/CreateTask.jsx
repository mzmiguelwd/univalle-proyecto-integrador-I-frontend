import { useState } from "react";
import { useNavigate } from "react-router-dom";

import classes from "./CreateTask.module.css";
import { createTask } from "../api/tasks";

const CreateTask = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    course: "",
    task_type: "otro",
    due_date: "",
    description: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleTypeSelect = (type) => {
    setFormData((prevData) => ({
      ...prevData,
      task_type: type,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const dataToSubmit = { ...formData };
    if (!dataToSubmit.due_date) {
      dataToSubmit.due_date = null;
    }

    try {
      await createTask(dataToSubmit);
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

          {error && <div className={classes.errorBox}>{error}</div>}

          <div className={classes.formGroup}>
            <label>Título de la actividad *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Sprint 1 - Desarrollo Backend"
              required
            />
          </div>

          <div className={classes.formGroup}>
            <label>Curso / Asignatura *</label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              placeholder="Ej: Proyecto Integrador I"
              required
            />
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
            <label>Fecha y hora límite (Opcional)</label>
            <input
              type="datetime-local"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>

          <div className={classes.formGroup}>
            <label>Descripción (Opcional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Añade detalles, enlaces o notas sobre la actividad..."
              rows="4"
            ></textarea>
          </div>

          <div className={classes.actions}>
            <button
              type="submit"
              className={classes.submitBtn}
              disabled={isLoading}
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
