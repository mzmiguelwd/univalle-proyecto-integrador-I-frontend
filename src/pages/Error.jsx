import { useRouteError, Link } from "react-router-dom";
import { FiAlertTriangle, FiSearch, FiLock, FiServer } from "react-icons/fi";

import classes from "./Error.module.css";
import MainNavigation from "../components/MainNavigation";

function ErrorPage() {
  const error = useRouteError();

  const isAuthenticated = localStorage.getItem("token") !== null;
  const fallbackPath = isAuthenticated ? "/hoy" : "/";
  const containerClasses = `${classes.container} ${isAuthenticated ? classes.withNavbar : ""}`;

  let title = "¡Ocurrió un error!";
  let message = "Algo salió mal en el sistema. Por favor, intenta de nuevo.";
  let Icon = FiAlertTriangle;

  if (error.status === 500) {
    title = "Error del servidor";
    message =
      error.data?.message ||
      "Estamos experimentando problemas internos. Nuestro equipo técnico ya está trabajando para solucionarlo.";
    Icon = FiServer;
  }

  if (error.status === 404) {
    title = "Página no encontrada";
    message =
      "No pudimos encontrar el recurso o la página que estás buscando. Revisa la URL o vuelve al inicio.";
    Icon = FiSearch;
  }

  if (error.status === 401) {
    title = "Sesión no autorizada";
    message =
      "No tienes permiso para acceder a esta sección o tu sesión ha expirado. Por favor, inicia sesión de nuevo.";
    Icon = FiLock;
  }

  if (error.status === 400) {
    title = "Solicitud incorrecta";
    message =
      "Los datos enviados no son válidos. Por favor, verifica la información e intenta de nuevo.";
    Icon = FiAlertTriangle;
  }

  return (
    <>
      {isAuthenticated && <MainNavigation />}
      <main className={containerClasses}>
        <div className={classes.errorCard}>
          <div className={classes.iconWrapper}>
            <Icon />
          </div>

          <span className={classes.status}>
            Error {error.status || "Desconocido"}
          </span>

          <section className={classes.errorContent}>
            <h1 className={classes.title}>{title}</h1>
            <p className={classes.message}>{message}</p>
          </section>

          <Link to={fallbackPath} className={classes.actionBtn}>
            {isAuthenticated
              ? "Volver a mi Planificador"
              : "Ir al Inicio de Sesión"}
          </Link>
        </div>
      </main>
    </>
  );
}

export default ErrorPage;
