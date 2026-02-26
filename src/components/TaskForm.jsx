import { useState } from "react";
import styles from "./TaskForm.module.css";

const TaskForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    task_type: "otro",
    course: "",
    dueDate: "",
    dueTime: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTypeSelect = (type) => {
    setFormData({
      ...formData,
      task_type: type,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let due_date = null;

    if (formData.dueDate) {
      const time = formData.dueTime || "00:00";
      due_date = `${formData.dueDate}T${time}:00`;
    }

    const formattedData = {
      title: formData.title,
      task_type: formData.task_type,
      course: formData.course,
      description: formData.description,
      due_date,
    };

    onSubmit(formattedData);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>CREAR NUEVA ACTIVIDAD</h2>

      {/* Título de la actividad */}
      <label>Título de la actividad</label>
      <input
        type="text"
        name="title"
        placeholder="Ej. Taller de Cálculo - Capítulo 5"
        value={formData.title}
        onChange={handleChange}
        className={styles.input}
        required
      />

      {/* Tipo de actividad */}
      <label>Tipo de actividad</label>
      <div className={styles.typeContainer}>
        {["examen", "quiz", "taller", "proyecto", "otro"].map((type) => (
          <button
            type="button"
            key={type}
            className={`${styles.typeButton} ${
              formData.task_type === type ? styles.active : ""
            }`}
            onClick={() => handleTypeSelect(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Curso */}
      <label>Curso / Asignatura</label>
      <input
        type="text"
        name="course"
        placeholder="Ingrese el curso o asignatura relacionada"
        value={formData.course}
        onChange={handleChange}
        className={styles.input}
        required
      />

      {/* Programación */}
      <label>Fecha / Hora de entrega (opcional)</label>
      <div className={styles.scheduleRow}>
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          className={styles.input}
        />
        <input
          type="time"
          name="dueTime"
          value={formData.dueTime}
          onChange={handleChange}
          className={styles.input}
        />
      </div>

      {/* Descripción */}
      <label>Descripción</label>
      <textarea
        name="description"
        placeholder="Detalles adicionales sobre la actividad..."
        value={formData.description}
        onChange={handleChange}
        className={styles.textarea}
      />

      <button type="submit" className={styles.submitButton}>
        Crear Actividad
      </button>
    </form>
  );
};

export default TaskForm;