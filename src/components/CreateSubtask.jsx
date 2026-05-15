import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MdHourglassEmpty,
  MdAdd,
  MdTaskAlt,
  MdWarningAmber,
  MdInfoOutline,
} from "react-icons/md";

import classes from "./CreateSubtask.module.css";
import { createSubtask, fetchWorkload } from "../api/tasks";
import { parseLocalDate } from "../utils/taskUtils";

function CreateSubtask({ taskId, taskDueDate, onSubtaskCreated }) {
  const [name, setName] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workloadInfo, setWorkloadInfo] = useState(null);

  useEffect(() => {
    if (targetDate) {
      const loadWorkload = async () => {
        try {
          const data = await fetchWorkload(targetDate);
          setWorkloadInfo(data);
        } catch (e) {
          console.error("No se pudo obtener carga de trabajo.", e);
          setWorkloadInfo(null);
        }
      };
      loadWorkload();
    } else {
      setWorkloadInfo(null);
    }
  }, [targetDate]);

  const hourOptions = [
    { label: "15 min", value: "0.25" },
    { label: "30 min", value: "0.5" },
    { label: "45 min", value: "0.75" },
    { label: "1 hora", value: "1.0" },
    { label: "1.5 horas", value: "1.5" },
    { label: "2 horas", value: "2.0" },
    { label: "3 horas", value: "3.0" },
  ];

  const parsedHours = Number(estimatedHours);
  const isFormValid =
    name.trim().length > 0 &&
    Boolean(targetDate) &&
    Number.isFinite(parsedHours) &&
    parsedHours > 0;

  const isOverloaded =
    workloadInfo &&
    parsedHours > 0 &&
    workloadInfo.total_hours + parsedHours > workloadInfo.daily_limit;

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

    if (taskDueDate) {
      const parentDate = parseLocalDate(taskDueDate);
      parentDate.setHours(23, 59, 59, 999);
      const subDate = parseLocalDate(targetDate);
      if (subDate > parentDate) {
        setError(
          "La fecha de la subtarea no puede superar a la fecha límite de la tarea principal.",
        );
        return;
      }
    }

    if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
      setError("Las horas estimadas deben ser mayores a 0.");
      return;
    }

    const subtaskData = {
      name: name.trim(),
      target_date: targetDate,
      estimated_hours: estimatedHours,
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
    } else {
      onSubtaskCreated({
        ...subtaskData,
        id: Date.now(),
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
            max={taskDueDate ? taskDueDate.split("T")[0] : undefined}
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
            title="Fecha objetivo"
          />

          <div className={classes.infoTooltip}>
            <MdInfoOutline className={classes.infoIcon} />
            <span className={classes.tooltipText}>
              La fecha objetivo indica hasta qué día tienes para completar esta
              subtarea, no necesariamente el día exacto en que debes hacerla.
            </span>
          </div>
        </div>

        <div className={classes.inputWrapper}>
          <select
            value={estimatedHours}
            onChange={(event) => setEstimatedHours(event.target.value)}
            title="Horas estimadas"
            className={classes.selectInput}
          >
            <option value="" disabled>
              Tiempo est.
            </option>
            {hourOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting || !isFormValid}
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

      {isOverloaded && (
        <div className={classes.warningBox}>
          <MdWarningAmber className={classes.warningIcon} />
          <div>
            <strong>¡Carga diaria excedida!</strong> Con esta subtarea sumarías{" "}
            {workloadInfo.total_hours + parsedHours}h programadas para este día,
            superando tu{" "}
            <Link to="/perfil">límite de {workloadInfo.daily_limit}h</Link>. Te
            recomendamos revisar <Link to="/hoy">tus tareas de hoy</Link> o
            elegir otro día.
          </div>
        </div>
      )}

      {error && <div className={classes.errorBox}>{error}</div>}
    </section>
  );
}

export default CreateSubtask;
