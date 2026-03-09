import { MdLogout } from "react-icons/md";

import classes from "./TodayHeader.module.css";

export default function TodayHeader({ username, activeTasksCount, onLogout }) {
  return (
    <header className={classes.header}>
      <div className={classes.headerText}>
        <h1>¡Hola, {username}! 📚</h1>
        <p>
          {activeTasksCount > 0
            ? `Tienes ${activeTasksCount} tareas prioritarias (vencidas + hoy) en tu radar hoy.`
            : "No tienes tareas urgentes para hoy. ¡Disfruta tu día!"}
        </p>
      </div>

      <button
        onClick={onLogout}
        className={classes.logoutBtn}
        aria-label="Cerrar sesión"
      >
        <MdLogout className={classes.logoutIcon} />
        Cerrar sesión
      </button>
    </header>
  );
}
