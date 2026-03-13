import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/taskUtils";
import OverloadResolutionModal from "./OverloadResolutionModal";
import classes from "./TodayOverloadWarnings.module.css";

function TodayOverloadWarnings({ rawTasks, dailyLimit = 6, onTasksUpdated }) {
  const [overloadedDays, setOverloadedDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
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
        total: info.total,
        subtasks: info.subtasks,
      }));

    setOverloadedDays(overloaded);
  }, [rawTasks, dailyLimit]);

  if (overloadedDays.length === 0) return null;

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