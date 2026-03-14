import { useState, useEffect, useRef } from "react";
import { MdWarningAmber } from "react-icons/md";
import classes from "./ConfirmModal.module.css";

/**
 * Modal de confirmación reutilizable.
 *
 * Props:
 *  - title        {string}   Título del modal
 *  - message      {string}   Cuerpo / descripción
 *  - confirmText  {string}   Texto del botón confirmar  (default "Confirmar")
 *  - cancelText   {string}   Texto del botón cancelar   (default "Cancelar")
 *  - loadingText  {string}   Texto durante la operación (default "Procesando...")
 *  - onConfirm    {async fn} Callback al confirmar — debe ser async o retornar Promise
 *  - onCancel     {function} Callback al cancelar / cerrar
 *  - isDanger     {boolean}  Aplica estilo rojo al botón confirmar
 *
 * El componente gestiona internamente su estado de carga.
 * Si `onConfirm` lanza una excepción, el spinner se apaga y el usuario puede reintentar.
 */
export default function ConfirmModal({
  title = "¿Estás seguro?",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loadingText = "Procesando...",
  onConfirm,
  onCancel,
  isDanger = false,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);

  // Cerrar con Escape (bloqueado mientras carga)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isLoading) onCancel?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, isLoading]);

  // Focus al modal al abrir
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const handleOverlayClick = (e) => {
    if (isLoading) return;
    if (e.target === e.currentTarget) onCancel?.();
  };

  // Wrapper que gestiona el estado de carga DENTRO del propio componente.
  // Así React garantiza que el spinner se muestre antes de lanzar la operación async.
  const handleConfirm = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onConfirm?.();
      // En éxito el padre desmonta este componente; no se resetea isLoading para evitar
      // "state update on unmounted component".
    } catch {
      // En error el padre NO desmonta el modal, se permite reintentar.
      setIsLoading(false);
    }
  };

  return (
    <div
      className={classes.backdrop}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby={message ? "confirm-modal-message" : undefined}
    >
      <div className={classes.modal} ref={modalRef} tabIndex={-1}>
        <div
          className={`${classes.iconWrapper} ${isDanger ? classes.iconDanger : classes.iconDefault}`}
        >
          <MdWarningAmber className={classes.icon} />
        </div>

        <div className={classes.content}>
          <h2 id="confirm-modal-title" className={classes.title}>
            {title}
          </h2>
          {message && (
            <p id="confirm-modal-message" className={classes.message}>
              {message}
            </p>
          )}
        </div>

        <div className={classes.actions}>
          <button
            className={classes.cancelBtn}
            onClick={onCancel}
            type="button"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={`${classes.confirmBtn} ${isDanger ? classes.confirmDanger : classes.confirmDefault}`}
            onClick={handleConfirm}
            type="button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className={classes.btnSpinner} />
                {loadingText}
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
