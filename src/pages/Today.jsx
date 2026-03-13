import { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import classes from "./Today.module.css";
import { logoutUser } from "../api/auth";
import { fetchDashboardTasks } from "../api/tasks";
import { getPriority, parseLocalDate } from "../utils/taskUtils";
import TaskDetailsModal from "../components/TaskModal/TaskModal";
import TodayHeader from "../components/Today/TodayHeader";
import TodayFilters from "../components/Today/TodayFilters";
import TaskGridSection from "../components/Today/TaskGridSection";
import TodayOverloadWarnings from "../components/Today/TodayOverloadWarnings";

function TodayPage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Usuario";

  const dailyLimit = Number(localStorage.getItem("daily_limit")) || 6;

  // Data states
  const [rawTasks, setRawTasks] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [courseFilter, setCourseFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const loadDashboardTasks = useCallback(async () => {
    const data = await fetchDashboardTasks();
    setRawTasks(data);

    const courses = [...new Set(data.map((task) => task.course))];
    setAvailableCourses(courses);
  }, []);

  const openModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = async (shouldRefresh = false) => {
    setIsModalOpen(false);
    setSelectedTask(null);

    if (!shouldRefresh) return;

    try {
      await loadDashboardTasks();
    } catch (error) {
      console.error(error);
    }
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
        await loadDashboardTasks();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, loadDashboardTasks]);

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
      const searchMatch =
        searchQuery === "" ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.course.toLowerCase().includes(searchQuery.toLowerCase());

      if (!priorityMatch || !courseMatch || !searchMatch) return;

      if (task.is_completed) {
        categorized.completed.push(task);
        return;
      }

      let relevantDateStr = task.due_date;
      if (task.subtasks && task.subtasks.length > 0) {
        const pendingSubtasks = task.subtasks.filter(
          (subtask) => subtask.status !== "done",
        );
        if (pendingSubtasks.length > 0) {
          pendingSubtasks.sort(
            (a, b) =>
              parseLocalDate(a.target_date) - parseLocalDate(b.target_date),
          );
          relevantDateStr = pendingSubtasks[0].target_date;
        }
      }

      if (!relevantDateStr) {
        categorized.noDate.push(task);
        return;
      }

      const taskDate = parseLocalDate(relevantDateStr);
      taskDate.setHours(0, 0, 0, 0);

      if (taskDate < today) {
        categorized.overdue.push(task);
      } else if (taskDate.getTime() === today.getTime()) {
        categorized.today.push(task);
      } else {
        categorized.upcoming.push(task);
      }
    });

    const sortByDate = (a, b) => {
      const getRelevantDateStr = (task) => {
        let dateStr = task.due_date;
        if (task.subtasks && task.subtasks.length > 0) {
          const pendingSubtasks = task.subtasks.filter(
            (subtask) => subtask.status !== "done",
          );
          if (pendingSubtasks.length > 0) {
            pendingSubtasks.sort(
              (s1, s2) =>
                parseLocalDate(s1.target_date) - parseLocalDate(s2.target_date),
            );
            dateStr = pendingSubtasks[0].target_date;
          }
        }
        return dateStr ? parseLocalDate(dateStr).getTime() : 0;
      };

      return getRelevantDateStr(a) - getRelevantDateStr(b);
    };

    categorized.overdue.sort(sortByDate);
    categorized.today.sort(sortByDate);
    categorized.upcoming.sort(sortByDate);

    setTasks(categorized);
  }, [rawTasks, courseFilter, priorityFilter, searchQuery]);

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
        <TodayHeader
          username={username}
          activeTasksCount={activeTasksCount}
          onLogout={handleLogout}
        />

        <TodayOverloadWarnings
          rawTasks={rawTasks}
          dailyLimit={dailyLimit}
          onTasksUpdated={loadDashboardTasks}
        />

        {!loading && rawTasks.length === 0 && (
          <div className={classes.noActivitiesCard}>
            <div className={classes.noActivitiesInfo}>
              <span className={classes.noActivitiesIcon}>🚀</span>
              <div>
                <h3 className={classes.noActivitiesTitle}>
                  Aún no tienes ninguna actividad
                </h3>
                <p className={classes.noActivitiesText}>
                  Empieza a organizar tu semestre creando tu primera tarea.
                </p>
              </div>
            </div>
            <Link to="/crear" className={classes.createActivityBtn}>
              Crear actividad
            </Link>
          </div>
        )}

        <TodayFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          courseFilter={courseFilter}
          setCourseFilter={setCourseFilter}
          availableCourses={availableCourses}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          sectionFilter={sectionFilter}
          setSectionFilter={setSectionFilter}
        />

        <div className={classes.dashboardContent}>
          <TaskGridSection
            tasks={tasks.overdue}
            sectionFilter={sectionFilter}
            targetFilter="overdue"
            title="Vencidas"
            icon="🔴"
            emptyMessage="¡Excelente! No tienes tareas vencidas."
            emptyIcon="🎉"
            openModal={openModal}
            isOverdue={true}
          />
          <TaskGridSection
            tasks={tasks.today}
            sectionFilter={sectionFilter}
            targetFilter="today"
            title="Foco de Hoy"
            icon="🟢"
            emptyMessage="Todo al día. No hay entregas programadas para hoy."
            emptyIcon="🧘"
            openModal={openModal}
          />
          <TaskGridSection
            tasks={tasks.upcoming}
            sectionFilter={sectionFilter}
            targetFilter="upcoming"
            title="Próximamente"
            icon="🔵"
            emptyMessage="No tienes tareas programadas próximamente."
            emptyIcon="🚀"
            openModal={openModal}
          />
          <TaskGridSection
            tasks={tasks.noDate}
            sectionFilter={sectionFilter}
            targetFilter="noDate"
            title="Sin fecha límite"
            icon="⚪"
            emptyMessage="No hay tareas sin planificar."
            emptyIcon="✅"
            openModal={openModal}
            compact={true}
          />
          <TaskGridSection
            tasks={tasks.completed}
            sectionFilter={sectionFilter}
            targetFilter="completed"
            title="Completadas"
            icon="✅"
            emptyMessage="Aún no has completado tareas."
            emptyIcon="🤖"
            openModal={openModal}
            isCompleted={true}
          />
        </div>
      </div>

      {isModalOpen && selectedTask && (
        <TaskDetailsModal
          onClose={closeModal}
          task={selectedTask}
          onTaskUpdated={loadDashboardTasks}
        />
      )}
    </div>
  );
}

export default TodayPage;
