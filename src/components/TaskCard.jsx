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
  progress,
  nextDelivery,
  finalDelivery,
  isCompleted,
  isOverdue,
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

  return (
    <article className={cardClasses}>
      <header className={classes.header}>
        <span className={`${classes.badge} ${priorityClass}`}>
          {isCompleted ? "Completada" : priority}
        </span>

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
            <div className={classes.info}>
              <span className={classes.infoIcon}>
                <MdAccessTime
                  className={classes.calendarIcon}
                  style={{ color: "#d97706" }}
                />
              </span>
              <span style={{ fontSize: "0.8rem" }}>
                <strong>Próxima entrega:</strong> {nextDelivery}
              </span>
            </div>

            <div className={classes.info}>
              <span className={classes.infoIcon}>
                {isCompleted ? (
                  <MdCheckCircle className={classes.checkIcon} />
                ) : (
                  <MdCalendarToday className={classes.calendarIcon} />
                )}
              </span>
              <span style={{ fontSize: "0.8rem" }}>
                <strong>Entrega final:</strong> {finalDelivery}
              </span>
            </div>
          </div>

          <div className={classes.progressSection}>
            <div className={classes.progressHeader}>
              <span className={classes.progressLabel}>Progreso</span>
              <span className={classes.progressValue}>
                {isCompleted ? "100%" : `${progress}%`}
              </span>
            </div>
            <div className={classes.progressBar}>
              <div
                className={classes.progressFill}
                style={{
                  width: isCompleted ? "100%" : `${progress}%`,
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
