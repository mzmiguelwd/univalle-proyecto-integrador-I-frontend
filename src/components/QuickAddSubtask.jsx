import { useState } from "react";

import classes from "./QuickAddSubtask.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function QuickAddSubtask({ taskId, onSubtaskCreated, demoMode = false }) {
  const [name, setName] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitHandler = async (event) => {
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

    if (demoMode) {
      const fakeSubtask = {
        id: Date.now(),
        task: taskId,
        name: name.trim(),
        target_date: targetDate,
        estimated_hours: parsedHours,
        status: "pending",
      };

      onSubtaskCreated(fakeSubtask);
      setName("");
      setEstimatedHours("");
      setError("");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Tu sesión expiró. Inicia sesión nuevamente.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/subtasks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          task: taskId,
          name: name.trim(),
          target_date: targetDate,
          estimated_hours: parsedHours,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const backendError =
          data?.name?.[0] ||
          data?.target_date?.[0] ||
          data?.estimated_hours?.[0] ||
          data?.detail ||
          "No fue posible guardar la subtarea.";
        throw new Error(backendError);
      }

      onSubtaskCreated(data);
      setName("");
      setEstimatedHours("");
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={classes.box}>
      <h2 className={classes.title}>Agregar subtarea rápida</h2>
      <form className={classes.form} onSubmit={submitHandler}>
        <input
          type="text"
          placeholder="Nombre de la subtarea"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <input
          type="date"
          value={targetDate}
          onChange={(event) => setTargetDate(event.target.value)}
        />

        <input
          type="number"
          min="0.1"
          step="0.1"
          placeholder="Horas estimadas"
          value={estimatedHours}
          onChange={(event) => setEstimatedHours(event.target.value)}
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Agregar"}
        </button>
      </form>

      {error ? <p className={classes.error}>{error}</p> : null}
    </section>
  );
}

export default QuickAddSubtask;
