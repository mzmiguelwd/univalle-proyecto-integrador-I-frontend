import { useNavigate, Link } from "react-router-dom";

import classes from "./Auth.module.css";

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();
    // Aquí iría la validación de credenciales, por ahora simplemente navegamos al dashboard

    // Guardamos un token ficticio para que ErrorPage detecte que estamos "logueados"
    localStorage.setItem("token", "simulated-jwt-token-12345");
    console.log("Login simulado: Token guardado en localStorage.");

    navigate("/hoy");
  };

  return (
    <div className={classes.container}>
      <div className={classes.authCard}>
        <h1 className={classes.title}>¡Bienvenido!</h1>
        <p className={classes.subtitle}>Ingresa tus datos para continuar</p>

        <form className={classes.form} onSubmit={handleLogin}>
          <div className={classes.inputGroup}>
            <label>Correo Electrónico</label>
            <input type="email" placeholder="tu@ejemplo.com" required />
          </div>
          <div className={classes.inputGroup}>
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" required />
          </div>
          <button type="submit" className={classes.submitBtn}>
            Entrar al Planificador
          </button>
        </form>

        <p className={classes.switchText}>
          ¿No tienes cuenta?{" "}
          <Link to="/signup" className={classes.link}>
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
