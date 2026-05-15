import {
  MdMoreVert,
  MdCheckCircle,
  MdCalendarToday,
  MdAccessTime,
} from "react-icons/md";

import classes from "./TaskCard.module.css";

function TaskCard({
  title,
  subject,
  priority,
  subtasksStats,
  nextDelivery,
  finalDelivery,
  isCompleted,
  isOverdue,
  isPostponed,
  compact,
}) {
  const priorityKey = priority?.toLowerCase() || "baja";
  const priorityClass = isCompleted
    ? classes.badgeCompleted
    : classes[priorityKey];

  const cardClasses = `
    ${classes.card} 
    ${isCompleted ? classes.completed : ""} 
    ${isOverdue ? classes.overdue : ""} 
    ${compact ? classes.compact : ""}
  `.trim();

  const percentage = subtasksStats?.percentage || 0;
  const completedStats = subtasksStats?.completed || 0;
  const totalStats = subtasksStats?.total || 0;

  return (
    <article className={cardClasses}>
      <header className={classes.header}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className={`${classes.badge} ${priorityClass}`}>
            {isCompleted ? "Completada" : priority}
          </span>
          {isPostponed && (
            <span 
              className={classes.badge}
              style={{backgroundColor: '#fff3cd', color: '#856404'}}
            >
              Pospuesta
            </span>
          )}
        </div>

        {!compact && (
          <button className={classes.optionsBtn} aria-label="Opciones de tarea">
            <MdMoreVert className={classes.optionsIcon} />
          </button>
        )}
      </header>

      <div className={classes.body}>
        <h3 className={classes.title}>{title}</h3>
        <p className={classes.subject}>{subject}</p>
      </div>

      {!compact && (
        <footer className={classes.footer}>
          <div className={classes.dateSection}>
            <div className={`${classes.info} ${classes.primaryDate}`}>
              <span className={classes.infoIcon}>
                <MdAccessTime
                  className={classes.calendarIcon}
                  style={{ color: "inherit" }}
                />
              </span>
              <span>
                <strong>Próxima Entrega:</strong> {nextDelivery}
              </span>
            </div>

            <div className={`${classes.info} ${classes.secondaryDate}`}>
              <span className={classes.infoIcon}>
                {isCompleted ? (
                  <MdCheckCircle className={classes.checkIcon} />
                ) : (
                  <MdCalendarToday className={classes.calendarIcon} />
                )}
              </span>
              <span>Entrega Final: {finalDelivery}</span>
            </div>
          </div>

          <div className={classes.progressSection}>
            <div className={classes.progressHeader}>
              <span className={classes.progressLabel}>
                Progreso{" "}
                {totalStats > 0 && (
                  <span className={classes.subtasksCount}>
                    ({completedStats}/{totalStats})
                  </span>
                )}
              </span>
              <span className={classes.progressValue}>
                {isCompleted ? "100%" : `${percentage}%`}
              </span>
            </div>
            <div className={classes.progressBar}>
              <div
                className={classes.progressFill}
                style={{
                  width: isCompleted ? "100%" : `${percentage}%`,
                }}
              ></div>
            </div>
          </div>
        </footer>
      )}
    </article>
  );
}

export default TaskCard;
