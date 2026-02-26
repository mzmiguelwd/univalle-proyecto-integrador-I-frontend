
import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import classes from "./Today.module.css";
import TaskCard from "../components/TaskCard";
import { fetchTodayTasks } from "../api/tasks";

function TodayPage() {
  // Sección mock 
  const activities = [
    {
      id: 1,
      title: "Entrega Sprint 0",
      subject: "Desarrollo de Software",
      priority: "Alta",
      progress: 80,
      dueDate: "2024-06-30",
    },
    {
      id: 2,
      title: "Revisión de Código",
      subject: "Desarrollo de Software",
      priority: "Media",
      progress: 50,
      dueDate: "2024-07-01",
    },
    {
      id: 3,
      title: "Planificación Sprint 1",
      subject: "Desarrollo de Software",
      priority: "Baja",
      progress: 20,
      dueDate: "2024-07-02",
    },
  ];

  // Sección tareas de hoy
  const [todayTasks, setTodayTasks] = useState([]);
  const [loadingToday, setLoadingToday] = useState(true);
  const [todayErr, setTodayErr] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setTodayErr("");
        setLoadingToday(true);
        const data = await fetchTodayTasks();
        if (mounted) setTodayTasks(Array.isArray(data) ? data : []);
      } catch (e) {
        const msg =
          e?.response?.data?.detail ||
          e?.message ||
          "Error cargando tareas de hoy";
        if (mounted) setTodayErr(msg);
      } finally {
        if (mounted) setLoadingToday(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <h1>¡Hola, Miguel! 👋</h1>
        <p>Tienes {activities.length} actividades para priorizar hoy.</p>
        <Link to="/actividad/demo" className={classes.demoBtn}>
          Ver demo US-2 (subtareas rápidas)
        </Link>
      </header>

      {/* Sección mock */}
      <section className={classes.section}>
        <h2 className={classes.sectionTitle}>Prioridades actuales</h2>
        <div className={classes.grid}>
          {activities.map((activity) => (
            <Link
              key={activity.id}
              to={`/actividad/${activity.id}`}
              className={classes.cardLink}
            >
              <TaskCard {...activity} />
            </Link>
          ))}
        </div>
      </section>

      {activities.length === 0 && (
        <div className={classes.empyState}>
          <p>No tienes tareas pendientes para hoy. ¡Aprovecha para descansar!</p>
        </div>
      )}

      {/* Sección real */}
      <section className={classes.section}>
        <h2 className={classes.sectionTitle}>Tareas de hoy</h2>

        {loadingToday ? (
          <p>Cargando tareas de hoy…</p>
        ) : todayErr ? (
          <p style={{ color: "crimson" }}>{todayErr}</p>
        ) : todayTasks.length === 0 ? (
          <div className={classes.empyState}>
            <p>No tienes tareas pendientes para hoy. ¡Aprovecha para descansar!</p>
          </div>
        ) : (
          <ul style={{ marginTop: 12 }}>
            {todayTasks.map((t) => (
              <li key={t.id} style={{ marginBottom: 10 }}>
                <strong>{t.title}</strong>
                {t.course ? ` — ${t.course}` : ""}
                {t.task_type ? ` (${t.task_type})` : ""}

                {Array.isArray(t.subtasks) && t.subtasks.length > 0 ? (
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    Subtareas: {t.subtasks.length}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default TodayPage;