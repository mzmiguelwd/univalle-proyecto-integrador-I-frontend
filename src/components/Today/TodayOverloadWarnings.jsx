import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/taskUtils";
import { fetchWorkload } from "../../api/tasks";
import OverloadResolutionModal from "./OverloadResolutionModal";
import classes from "./TodayOverloadWarnings.module.css";

function TodayOverloadWarnings({ rawTasks, onTasksUpdated }) {
  const [overloadedDays, setOverloadedDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dailyLimit, setDailyLimit] = useState(null);

  useEffect(() => {
    const loadDailyLimit = async () => {
      try {
        // usamos cualquier fecha solo para obtener el límite del usuario.
        const today = new Date().toISOString().split("T")[0];
        const data = await fetchWorkload(today);
        setDailyLimit(Number(data.daily_limit));
      } catch (e) {
        console.error("No se pudo obtener el límite diario", e);
      }
    };

    loadDailyLimit();
  }, []);

  useEffect(() => {
    if (!dailyLimit) return;

    const dayMap = {};

    rawTasks.forEach((task) => {
      if (!task.subtasks) return;

      task.subtasks.forEach((sub) => {
        if (sub.status === "done") return;
        if (!sub.target_date) return;

        const date = sub.target_date;

        if (!dayMap[date]) {
          dayMap[date] = {
            total: 0,
            subtasks: [],
          };
        }

        const hours = Number(sub.estimated_hours || 0);

        dayMap[date].total += hours;

        dayMap[date].subtasks.push({
          ...sub,
          taskTitle: task.title,
          taskId: task.id,
          taskDueDate: task.due_date,
        });
      });
    });

    const overloaded = Object.entries(dayMap)
      .filter(([_, info]) => info.total > dailyLimit)
      .map(([date, info]) => ({
        date,
        total: Number(info.total.toFixed(2)),
        subtasks: info.subtasks,
      }));

    setOverloadedDays(overloaded);
  }, [rawTasks, dailyLimit]);

  if (!dailyLimit || overloadedDays.length === 0) return null;

  return (
    <>
      <div className={classes.warningContainer}>
        {overloadedDays.map((day) => (
          <div key={day.date} className={classes.warningCard}>
            <div className={classes.warningText}>
              <strong>⚠ Sobrecarga detectada</strong>

              <p>
                El día <b>{formatDate(day.date)}</b> tienes{" "}
                <b>{day.total}h</b> programadas, superando tu límite de{" "}
                <b>{dailyLimit}h</b>.
              </p>

              <div className={classes.actions}>
                <button
                  className={classes.resolveBtn}
                  onClick={() => setSelectedDay(day)}
                >
                  Reprogramar subtareas
                </button>

                <Link to="/perfil" className={classes.profileLink}>
                  Ampliar límite diario
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedDay && (
        <OverloadResolutionModal
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
          onTasksUpdated={onTasksUpdated}
        />
      )}
    </>
  );
}

export default TodayOverloadWarnings;