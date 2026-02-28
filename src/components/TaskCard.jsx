import { MdMoreVert, MdCheckCircle, MdCalendarToday } from "react-icons/md";

import classes from "./TaskCard.module.css";

function TaskCard({
  title,
  subject,
  priority,
  progress,
  dueDate,
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
          <div className={classes.info}>
            <span className={classes.infoIcon}>
              {isCompleted ? (
                <MdCheckCircle className={classes.checkIcon} />
              ) : (
                <MdCalendarToday className={classes.calendarIcon} />
              )}
            </span>
            <span>{dueDate}</span>
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
