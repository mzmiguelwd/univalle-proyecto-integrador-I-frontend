import classes from "./TaskCard.module.css";

function TaskCard({ title, subject, priority, progress, dueDate }) {
  const priorityKey = priority.toLowerCase();
  const priorityClass = classes[priorityKey];

  return (
    <article className={classes.card}>
      <header className={classes.header}>
        <span className={`${classes.badge} ${priorityClass}`}>{priority}</span>
        <button className={classes.optionsBtn} aria-label="Opciones de tarea">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      <div className={classes.body}>
        <h3 className={classes.title}>{title}</h3>
        <p className={classes.subject}>{subject}</p>
      </div>

      <footer className={classes.footer}>
        <div className={classes.info}>
          <span className="material-symbols-outlined">calendar_today</span>
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
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </footer>
    </article>
  );
}

export default TaskCard;
