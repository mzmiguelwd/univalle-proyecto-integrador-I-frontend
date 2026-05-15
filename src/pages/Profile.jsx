import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdLogout,
  MdPerson,
  MdCalendarToday,
  MdVerified,
} from "react-icons/md";

import classes from "./Profile.module.css";
import api from "../api/client";
import { logoutUser } from "../api/auth";
import ConfirmModal from "../components/ConfirmModal"; 
import toast from "react-hot-toast";

function ProfilePage() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "Usuario";
  const userId = localStorage.getItem("user_id") || "No disponible";

  const [dailyLimit, setDailyLimit] = useState(3);
  const [initialDailyLimit, setInitialDailyLimit] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLimitInvalid, setIsLimitInvalid] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); 

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    [],
  );

  const initials = useMemo(
    () => username.slice(0, 2).toUpperCase(),
    [username],
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const loadProfilePage = async () => {
      try {
        setIsLoading(true);
        const profileResponse = await api.get("/api/profile/");
        const backendLimit = profileResponse.data?.daily_limit ?? 3;
        setDailyLimit(backendLimit);
        setInitialDailyLimit(backendLimit);
      } catch {
        console.error("No se pudo cargar el perfil.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfilePage();
  }, [navigate]);

  const hasUnsavedChanges = Number(dailyLimit) !== Number(initialDailyLimit);

  const handleSaveLimit = (event) => {
    event.preventDefault();

    const nextValue = Number(dailyLimit);
    if (!nextValue || nextValue < 1 || nextValue > 23) {
      setIsLimitInvalid(true);
      return;
    }

    setIsLimitInvalid(false);
    setShowConfirmModal(true);
  };

  // Callback que ejecuta el PATCH; lo llama ConfirmModal al confirmar
  const handleConfirmSave = async () => {
    const nextValue = Number(dailyLimit);

    try {
      setIsSaving(true);
      const response = await api.patch("/api/profile/", {
        daily_limit: nextValue,
      });
      const savedLimit = response.data?.daily_limit ?? nextValue;
      setDailyLimit(savedLimit);
      setInitialDailyLimit(savedLimit);
      setShowConfirmModal(false); // cierra el modal en éxito
      toast.success("tu limite de horas diarias se ha modificado exitosamente");
    } catch {
      console.error("No fue posible guardar la configuracion.");
      throw new Error("Fallo al guardar"); // re-lanza para que ConfirmModal active el reintento
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className={classes.loadingContainer}>
        <div className={classes.spinner}></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className={classes.pageWrapper}>
      <div className={classes.container}>
        {/* ---- Modal de confirmación ---- */}
        {showConfirmModal && (
          <ConfirmModal
            title="¿Guardar nuevo límite?"
            message={`Tu límite diario cambiará a ${dailyLimit} hora${Number(dailyLimit) !== 1 ? "s" : ""}. Esto cambiará la planificación de tus tareas a partir de hoy.`}
            confirmText="Sí, guardar"
            cancelText="Cancelar"
            loadingText="Guardando..."
            onConfirm={handleConfirmSave}
            onCancel={() => setShowConfirmModal(false)}
            isDanger={false}
          />
        )}

        <header className={classes.header}>
          <div className={classes.titleBlock}>
            <h1>Perfil</h1>
            <p>Informacion esencial y preferencias de trabajo.</p>
          </div>

          <button
            onClick={handleLogout}
            className={classes.logoutBtn}
            aria-label="Cerrar sesion"
          >
            <MdLogout />
            Cerrar sesion
          </button>
        </header>

        <section className={classes.heroCard}>
          <div className={classes.avatar}>{initials}</div>
          <div className={classes.heroInfo}>
            <p className={classes.heroKicker}>Bienvenido de vuelta</p>
            <h2>{username}</h2>
            <p>
              Hoy es {todayLabel}. Ajusta tu limite diario y sigue tu plan con
              enfoque.
            </p>
            <div className={classes.badgeRow}>
              <span className={classes.badge}>ID {userId}</span>
              <span className={classes.badge}>Cuenta activa</span>
            </div>
          </div>
        </section>

        <section className={classes.topGrid}>
          <article className={classes.profileCard}>
            <div className={classes.cardHead}>
              <MdPerson />
              <h2>Informacion de cuenta</h2>
            </div>

            <dl className={classes.identityList}>
              <div>
                <dt>Usuario</dt>
                <dd>{username}</dd>
              </div>
              <div>
                <dt>ID</dt>
                <dd>{userId}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd className={classes.verifiedLine}>
                  <MdVerified /> Activo
                </dd>
              </div>
            </dl>
          </article>

          <article className={classes.profileCard}>
            <div className={classes.cardHead}>
              <MdCalendarToday />
              <h2>Preferencias</h2>
            </div>

            <form onSubmit={handleSaveLimit} className={classes.form}>
              <label htmlFor="dailyLimit">
                Limite de horas diarias para tareas (1-23)
              </label>
              <input
                id="dailyLimit"
                type="number"
                min="1"
                max="23"
                value={dailyLimit}
                onChange={(event) => {
                  setDailyLimit(event.target.value);
                  setIsLimitInvalid(false);
                }}
                className={`${classes.input} ${isLimitInvalid ? classes.inputInvalid : ""}`}
              />

              <button
                type="submit"
                className={classes.saveBtn}
                disabled={isSaving || !hasUnsavedChanges}
              >
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>

              <p className={classes.helperText}>
                Recomendado entre 4 y 6 para mantener una carga equilibrada.
              </p>
            </form>
          </article>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;