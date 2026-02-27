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
  const priorityClass = classes[priorityKey];

  const cardClasses = [
    classes.card,
    isCompleted ? classes.completed : "",
    isOverdue ? classes.overdue : "",
    compact ? classes.compact : "",
  ].join(" ");

  return (
    <article className={cardClasses}>
      <header className={classes.header}>
        <span className={`${classes.badge} ${priorityClass}`}>
          {isCompleted ? "Completada" : priority}
        </span>
        <button className={classes.optionsBtn} aria-label="Opciones de tarea">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      <div className={classes.body}>
        <h3 className={classes.title}>{title}</h3>
        <p className={classes.subject}>{subject}</p>
      </div>

      {!compact && (
        <footer className={classes.footer}>
          <div className={classes.info}>
            <span className="material-symbols-outlined">
              {isCompleted ? "check_circle" : "calendar_today"}
            </span>
            <span>{dueDate}</span>
          </div>

          <div className={classes.progressSection}>
            <div className={classes.progressHeader}>
              <span className={classes.progressLabel}>Progreso</span>
              <span className={classes.progressValue}>{progress}%</span>
            </div>
            <div className={classes.progressBar}>
              <div
                className={classes.progressFill}
                style={{
                  width: `${progress}%`,
                  backgroundColor: isCompleted ? "#4caf50" : "",
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
