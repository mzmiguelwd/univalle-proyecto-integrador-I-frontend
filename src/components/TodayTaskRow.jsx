import { useEffect, useMemo, useRef } from "react";
import classes from "./TodayTaskRow.module.css";

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function TodayTaskRow({
  task,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onAction,
}) {
  const menuRef = useRef(null);

  const time = useMemo(() => formatTime(task?.due_date), [task?.due_date]);

  // Cierra menú si das click fuera
  useEffect(() => {
    if (!isMenuOpen) return;

    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) onCloseMenu?.();
    };

    const onEsc = (e) => {
      if (e.key === "Escape") onCloseMenu?.();
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [isMenuOpen, onCloseMenu]);

  return (
    <div className={classes.row}>
      <div className={classes.main}>
        <div className={classes.topLine}>
          <div className={classes.title}>{task?.title || "Sin título"}</div>
          <div className={classes.time}>{time}</div>
        </div>

        <div className={classes.desc}>
          {task?.description?.trim()
            ? task.description
            : "Sin descripción (puedes agregar una)."}
        </div>
      </div>

      <div className={classes.actions} ref={menuRef}>
        <button
          type="button"
          className={classes.kebabBtn}
          aria-label="Opciones"
          onClick={onToggleMenu}
        >
          ⋮
        </button>

        {isMenuOpen ? (
          <div className={classes.menu} role="dialog" aria-label="Opciones de tarea">
            <button type="button" onClick={() => onAction?.("edit")}>
              Editar
            </button>
            <button type="button" onClick={() => onAction?.("complete")}>
              Marcar como completada
            </button>
            <button type="button" onClick={() => onAction?.("delete")} className={classes.danger}>
              Eliminar
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}