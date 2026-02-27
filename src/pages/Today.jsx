import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import classes from "./Today.module.css";
import TaskCard from "../components/TaskCard";
import { fetchAllPendingTasks } from "../api/tasks";

function TodayPage() {
  const [tasks, setTasks] = useState({
    overdue: [],
    today: [],
    upcoming: [],
    noDate: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Usuario";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const data = await fetchAllPendingTasks(); // Trae TODAS las tareas con is_completed=False

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const categorized = {
          overdue: [],
          today: [],
          upcoming: [],
          noDate: [],
          completed: [], // 👈 Nueva categoría
        };

        data.forEach((task) => {
          // 1. Filtro principal: Si está completada, va directo a su propia lista y no miramos su fecha
          if (task.is_completed) {
            categorized.completed.push(task);
            return; // Detenemos la ejecución para esta tarea
          }

          // 2. Si no está completada, seguimos la lógica normal
          if (!task.due_date) {
            categorized.noDate.push(task);
            return;
          }

          const taskDate = new Date(task.due_date);
          taskDate.setHours(0, 0, 0, 0);

          if (taskDate < today) {
            categorized.overdue.push(task);
          } else if (taskDate.getTime() === today.getTime()) {
            categorized.today.push(task);
          } else {
            categorized.upcoming.push(task);
          }
        });

        setTasks(categorized);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) return <p className={classes.loading}>Cargando tu día...</p>;

  const calculateProgress = (subtasks) => {
    if (!subtasks || subtasks.length === 0) return 0;
    const completed = subtasks.filter((st) => st.is_completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPriority = (taskType) => {
    if (taskType === "examen" || taskType === "proyecto") return "Alta";
    if (taskType === "quiz") return "Media";
    return "Baja";
  };

  return (
    <div className={classes.container}>
      <header className={classes.header}>
        <h1>¡Hola, {username}! 👋</h1>
        <p>
          Tienes {tasks.today.length + tasks.overdue.length} tareas prioritarias
          en tu radar.
        </p>
      </header>

      {/* 1. SECCIÓN: Vencidas (Solo se renderiza si hay elementos) */}
      {tasks.overdue.length > 0 && (
        <section className={classes.sectionOverdue}>
          <h2>🔴 Requieren Atención (Vencidas)</h2>
          <div className={classes.grid}>
            {tasks.overdue.map((t) => (
              <TaskCard key={t.id} {...t} isOverdue={true} />
            ))}
          </div>
        </section>
      )}

      {/* 2. SECCIÓN: Hoy */}
      <section className={classes.sectionToday}>
        <h2>🟢 Foco de Hoy</h2>
        {tasks.today.length === 0 ? (
          <div className={classes.emptyState}>
            <p>¡Día libre de entregas! Revisa qué viene próximamente.</p>
          </div>
        ) : (
          <div className={classes.grid}>
            {tasks.today.map((t) => (
              <TaskCard key={t.id} {...t} />
            ))}
          </div>
        )}
      </section>

      {/* 3. SECCIÓN: Próximas */}
      {tasks.upcoming.length > 0 && (
        <section className={classes.sectionUpcoming}>
          <h2>🔵 Próximamente</h2>
          <div className={classes.grid}>
            {tasks.upcoming.map((t) => (
              <TaskCard key={t.id} {...t} />
            ))}
          </div>
        </section>
      )}

      {/* 4. SECCIÓN: Sin Fecha Límite */}
      {tasks.noDate.length > 0 && (
        <section className={classes.sectionNoDate}>
          <h2>⚪ Backlog (Sin fecha límite)</h2>
          <div className={classes.gridFlexible}>
            {tasks.noDate.map((t) => (
              <TaskCard key={t.id} {...t} compact={true} />
            ))}
          </div>
        </section>
      )}

      {/* 5. SECCIÓN: Completadas Hoy (Tolerancia al error) */}
      {tasks.completed.length > 0 && (
        <section className={classes.sectionCompleted}>
          <h2>✅ Completadas Hoy</h2>
          <div className={classes.gridFlexible}>
            {tasks.completed.map((t) => (
              <Link
                key={t.id}
                to={`/actividad/${t.id}`}
                className={classes.cardLink}
              >
                <TaskCard
                  title={t.title}
                  subject={t.course}
                  priority={getPriority(t.task_type)}
                  progress={100} // Si está completada, forzamos el 100%
                  dueDate={formatDate(t.due_date)}
                  isCompleted={true} // 👈 Le avisamos a la tarjeta que cambie su diseño
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default TodayPage;
