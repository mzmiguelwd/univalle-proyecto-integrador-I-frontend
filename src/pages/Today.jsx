import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdLogout, MdFilterList } from "react-icons/md";

import classes from "./Today.module.css";
import { fetchDashboardTasks } from "../api/tasks";
import { logoutUser } from "../api/auth";
import TaskCard from "../components/TaskCard";
import TaskDetailsModal from "../components/TaskDetailsModal";

function TodayPage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Usuario";

  // Data states
  const [rawTasks, setRawTasks] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [courseFilter, setCourseFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Categorized state (what is rendered on the page)
  const [tasks, setTasks] = useState({
    overdue: [],
    today: [],
    upcoming: [],
    noDate: [],
    completed: [],
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const openModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

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
        setRawTasks(data);

        const courses = [...new Set(data.map((task) => task.course))];
        setAvailableCourses(courses);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const getPriority = (taskType) => {
    if (taskType === "examen" || taskType === "proyecto") return "Alta";
    if (taskType === "quiz") return "Media";
    return "Baja";
  };

  const calculateProgress = (subtasks) => {
    if (!subtasks || subtasks.length === 0) return 0;
    const completed = subtasks.filter(
      (subtask) => subtask.status == "done",
    ).length;
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

  const getNextDeliveryDate = (subtasks) => {
    if (!subtasks || subtasks.length === 0) return "Sin planificar";
    const pendingSubtasks = subtasks.filter(
      (subtask) => subtask.status !== "done",
    );
    if (pendingSubtasks.length === 0) return "Todo completado";

    pendingSubtasks.sort(
      (a, b) => new Date(a.target_date) - new Date(b.target_date),
    );
    return formatDate(pendingSubtasks[0].target_date);
  };

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const categorized = {
      overdue: [],
      today: [],
      upcoming: [],
      noDate: [],
      completed: [],
    };

    rawTasks.forEach((task) => {
      const priorityMatch =
        priorityFilter === "all" ||
        getPriority(task.task_type) === priorityFilter;
      const courseMatch =
        courseFilter === "all" || task.course === courseFilter;

      if (!priorityMatch || !courseMatch) return;

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
  }, [rawTasks, courseFilter, priorityFilter]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
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
            Cerrar sesión
          </button>
        </header>

        <section className={classes.filtersSection}>
          <div className={classes.filterGroup}>
            <MdFilterList className={classes.filterIcon} />
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className={classes.filterSelect}
            >
              <option value="all">Todas las asignaturas</option>
              {availableCourses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={classes.filterSelect}
            >
              <option value="all">Todas las prioridades</option>
              <option value="Alta">Prioridad Alta</option>
              <option value="Media">Prioridad Media</option>
              <option value="Baja">Prioridad Baja</option>
            </select>
          </div>
        </section>

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
                {tasks.overdue.map((t) => (
                  <div
                    key={t.id}
                    className={classes.Link}
                    onClick={() => openModal(t)}
                  >
                    <TaskCard
                      title={t.title}
                      subject={t.course}
                      priority={getPriority(t.task_type)}
                      progress={calculateProgress(t.subtasks)}
                      nextDelivery={getNextDeliveryDate(t.subtasks)}
                      finalDelivery={formatDate(t.due_date)}
                      isOverdue={true}
                    />
                  </div>
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
                {tasks.today.map((t) => (
                  <div
                    key={t.id}
                    className={classes.cardLink}
                    onClick={() => openModal(t)}
                  >
                    <TaskCard
                      title={t.title}
                      subject={t.course}
                      priority={getPriority(t.task_type)}
                      progress={calculateProgress(t.subtasks)}
                      nextDelivery={getNextDeliveryDate(t.subtasks)}
                      finalDelivery={formatDate(t.due_date)}
                    />
                  </div>
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
                  <div
                    key={t.id}
                    className={classes.cardLink}
                    onClick={() => openModal(t)}
                  >
                    <TaskCard
                      title={t.title}
                      subject={t.course}
                      priority={getPriority(t.task_type)}
                      progress={calculateProgress(t.subtasks)}
                      nextDelivery={getNextDeliveryDate(t.subtasks)}
                      finalDelivery={formatDate(t.due_date)}
                    />
                  </div>
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
                  <div
                    key={t.id}
                    className={classes.cardLink}
                    onClick={() => openModal(t)}
                  >
                    <TaskCard
                      title={t.title}
                      subject={t.course}
                      priority={getPriority(t.task_type)}
                      nextDelivery={getNextDeliveryDate(t.subtasks)}
                      finalDelivery={formatDate(t.due_date)}
                      compact={true}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {tasks.completed.length > 0 && (
            <section className={classes.taskSection}>
              <div className={classes.sectionHeader}>
                <h2 className={classes.sectionTitle}>✅ Completadas</h2>
                <span className={classes.taskCount}>
                  {tasks.completed.length}
                </span>
              </div>
              <div className={classes.grid}>
                {tasks.completed.map((t) => (
                  <div
                    key={t.id}
                    className={classes.cardLink}
                    onClick={() => openModal(t)}
                  >
                    <TaskCard
                      title={t.title}
                      subject={t.course}
                      priority={getPriority(t.task_type)}
                      progress={100}
                      nextDelivery={"---"}
                      finalDelivery={formatDate(t.due_date)}
                      isCompleted={true}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <TaskDetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        task={selectedTask}
        onEdit={(taskId) => navigate(`/actividad/${taskId}`)}
      />
    </div>
  );
}

export default TodayPage;
