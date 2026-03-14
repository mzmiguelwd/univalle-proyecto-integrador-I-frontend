import classes from "./EmptyState.module.css";

function EmptyState({ message, icon = "✨", children }) {
  return (
    <div className={classes.container}>
      <span className={classes.icon}>{icon}</span>
      <p className={classes.message}>{message}</p>
      {children}
    </div>
  );
}

export default EmptyState;
