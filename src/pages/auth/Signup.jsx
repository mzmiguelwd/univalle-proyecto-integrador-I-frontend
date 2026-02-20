import { useNavigate, Link } from "react-router-dom";

import classes from "./Auth.module.css";

function SignupPage() {
  const navigate = useNavigate();

  const handleSignup = (event) => {
    event.preventDefault();
    // Aquí iría el registro del usuario, por ahora simplemente navegamos al login
    navigate("/");
  };

  return (
    <div className={classes.container}>
      <div className={classes.authCard}>
        <h1 className={classes.title}>Crear cuenta</h1>
        <p className={classes.subtitle}>Únete para organizar tus proyectos</p>

        <form className={classes.form} onSubmit={handleSignup}>
          <div className={classes.inputGroup}>
            <label>Nombre completo</label>
            <input type="text" placeholder="Miguel Zuluaga" required />
          </div>
          <div className={classes.inputGroup}>
            <label>Correo electrónico</label>
            <input type="email" placeholder="tu@ejemplo.com" required />
          </div>
          <div className={classes.inputGroup}>
            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" required />
          </div>
          <button type="submit" className={classes.submitBtn}>
            Registrarse
          </button>
        </form>

        <p className={classes.switchText}>
          ¿Ya tienes cuenta?{" "}
          <Link to="/" className={classes.link}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
