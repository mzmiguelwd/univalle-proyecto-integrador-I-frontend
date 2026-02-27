import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdLogout } from "react-icons/md";

import classes from "./Today.module.css";
import { fetchDashboardTasks } from "../api/tasks";
import { logoutUser } from "../api/auth";
import TaskCard from "../components/TaskCard";

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
        const data = await fetchDashboardTasks();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const categorized = {
          overdue: [],
          today: [],
          upcoming: [],
          noDate: [],
          completed: [],
        };

        data.forEach((task) => {
          if (task.is_completed) {
            categorized.completed.push(task);
            return;
          }

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
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
  };

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

  const activeTasksCount = tasks.today.length + tasks.overdue.length;

  if (loading)
    return (
      <div className={classes.loadingContainer}>
        <div className={classes.spinner}></div>
        <p>Organizando tu día...</p>
      </div>
    );

  return (
    <div className={classes.pageWrapper}>
      <div className={classes.container}>
        <header className={classes.header}>
          <div className={classes.headerText}>
            <h1>¡Hola, {username}! 👋🏼</h1>
            <p>
              {activeTasksCount > 0
                ? `Tienes ${activeTasksCount} tareas prioritarias en tu radar hoy.`
                : "No tienes tareas urgentes para hoy. ¡Disfruta tu día!"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className={classes.logoutBtn}
            aria-label="Cerrar sesión"
          >
            {<MdLogout className={classes.logoutIcon} />}
            Salir
          </button>
        </header>

        <div className={classes.dashboardContent}>
          {tasks.overdue.length > 0 && (
            <section className={classes.taskSection}>
              <div className={classes.sectionHeader}>
                <span className={classes.urgentBadge}>🔴 Vencidas</span>
                <span className={classes.taskCount}>
                  {tasks.overdue.length}
                </span>
              </div>
              <div className={classes.grid}>
                {" "}
                {tasks.overdue.map((t) => (
                  <Link
                    key={t.id}
                    to={`/actividad/${t.id}`}
                    className={classes.cardLink}
                  >
                    <TaskCard
                      title={t.title}
                      subject={t.course}
                      priority={getPriority(t.task_type)}
                      progress={calculateProgress(t.subtasks)}
                      dueDate={formatDate(t.due_date)}
                      isOverdue={true}
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className={classes.taskSection}>
            <div className={classes.sectionHeader}>
              <h2 className={classes.sectionTitle}>🟢 Foco de Hoy</h2>
              <span className={classes.taskCount}>{tasks.today.length}</span>
            </div>
            {tasks.today.length === 0 ? (
              <div className={classes.emptyState}>
                <p>Todo al día. No hay entregas programadas para hoy.</p>
              </div>
            ) : (
              <div className={classes.grid}>
                {" "}
                {tasks.today.map((t) => (
                  <Link
                    key={t.id}
                    to={`/actividad/${t.id}`}
                    className={classes.cardLink}
                  >
                    <TaskCard
                      title={t.title}
                      subject={t.course}
                      priority={getPriority(t.task_type)}
                      progress={calculateProgress(t.subtasks)}
                      dueDate={formatDate(t.due_date)}
                    />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {tasks.upcoming.length > 0 && (
            <section className={classes.taskSection}>
              <div className={classes.sectionHeader}>
                <h2 className={classes.sectionTitle}>🔵 Próximamente</h2>
                <span className={classes.taskCount}>
                  {tasks.upcoming.length}
                </span>
              </div>
              <div className={classes.grid}>
                {tasks.upcoming.map((t) => (
                  <Link
                    key={t.id}
                    to={`/actividad/${t.id}`}
                    className={classes.cardLink}
                  >
                    <TaskCard
                      title={t.title}
                      subject={t.course}
                      priority={getPriority(t.task_type)}
                      progress={calculateProgress(t.subtasks)}
                      dueDate={formatDate(t.due_date)}
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {tasks.noDate.length > 0 && (
            <section className={classes.taskSection}>
              <div className={classes.sectionHeader}>
                <h2 className={classes.sectionTitle}>⚪ Sin fecha límite</h2>
                <span className={classes.taskCount}>{tasks.noDate.length}</span>
              </div>
              <div className={classes.grid}>
                {tasks.noDate.map((t) => (
                  <Link
                    key={t.id}
                    to={`/actividad/${t.id}`}
                    className={classes.cardLink}
                  >
                    <TaskCard
                      title={t.title}
                      subject={t.course}
                      priority={getPriority(t.task_type)}
                      compact={true}
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {tasks.completed.length > 0 && (
            <section className={classes.taskSection}>
              <div className={classes.sectionHeader}>
                <h2 className={classes.sectionTitle}>✅ Completadas Hoy</h2>
                <span className={classes.taskCount}>
                  {tasks.completed.length}
                </span>
              </div>
              <div className={classes.grid}>
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
                      progress={100}
                      dueDate={formatDate(t.due_date)}
                      isCompleted={true}
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default TodayPage;
