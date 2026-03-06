import { useState } from "react";
import { MdHourglassEmpty, MdAdd, MdTaskAlt } from "react-icons/md";

import classes from "./CreateSubtask.module.css";
import { createSubtask } from "../api/tasks";

function CreateSubtask({ taskId, onSubtaskCreated }) {
  const [name, setName] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("El nombre de la subtarea es obligatorio.");
      return;
    }

    if (!targetDate) {
      setError("Debes seleccionar una fecha objetivo.");
      return;
    }

    const parsedHours = Number(estimatedHours);
    if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
      setError("Las horas estimadas deben ser mayores a 0.");
      return;
    }

    const subtaskData = {
    name: name.trim(),
    target_date: targetDate,
    estimated_hours: parsedHours,
    };

    if (taskId) {
      try {
        setIsSubmitting(true);

        const newSubtask = await createSubtask({
          task: taskId,
          ...subtaskData,
        });

        onSubtaskCreated?.(newSubtask);

      } catch (error) {
        let errorMessage = "No fue posible guardar la subtarea.";
        if (error.response && error.response.data) {
          const data = error.response.data;
          const errorKeys = Object.keys(data);
          if (errorKeys.length > 0) {
            const firstError = data[errorKeys[0]];
            if (Array.isArray(firstError)) {
              errorMessage = firstError[0];
            } else if (typeof firstError === "string") {
              errorMessage = firstError;
            }
          }
        }
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }else {
      onSubtaskCreated({
       ...subtaskData,
        id: Date.now(), // id temporal para React
      });
    }

    setName("");
    setTargetDate("");
    setEstimatedHours("");
  };

  return (
    <section className={classes.box}>
      <h2 className={classes.title}>Agregar subtarea rápida</h2>
      <div className={classes.form}>
        <div className={classes.inputWrapper}>
          <MdTaskAlt className={classes.icon} />
          <input
            type="text"
            placeholder="Ej: Buscar bibliografía..."
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className={classes.inputWrapper}>
          <input
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
            title="Fecha objetivo"
          />
        </div>

        <div className={classes.inputWrapper}>
          <input
            type="number"
            min="0.1"
            step="0.1"
            placeholder="Horas est."
            value={estimatedHours}
            onChange={(event) => setEstimatedHours(event.target.value)}
            title="Horas estimadas"
          />
        </div>

        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={classes.submitBtn}
        >
          {isSubmitting ? (
            <MdHourglassEmpty className={classes.rotatingIcon} />
          ) : (
            <>
              <MdAdd className={classes.icon} />
              Agregar
            </>
          )}
        </button>
      </div>

      {error && <div className={classes.errorBox}>{error}</div>}
    </section>
  );
}

export default CreateSubtask;
