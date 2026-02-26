import { Link } from "react-router-dom";

import classes from "./Today.module.css";
import TaskCard from "../components/TaskCard";

function TodayPage() {
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

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <h1>¡Hola, Miguel! 👋</h1>
        <p>Tienes {activities.length} actividades para priorizar hoy.</p>
        <Link to="/actividad/demo" className={classes.demoBtn}>
          Ver demo US-2 (subtareas rápidas)
        </Link>
      </header>

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
          <p>
            No tienes tareas pendientes para hoy. ¡Aprovecha para descansar!
          </p>
        </div>
      )}
    </div>
  );
}

export default TodayPage;
