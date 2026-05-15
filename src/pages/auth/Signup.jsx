import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import classes from "./Auth.module.css";
import { registerUser } from "../../api/auth";

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeoutRef = useRef(null);

  const handleSuccessClose = () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
    navigate("/hoy");
  };

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await registerUser(formData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      if (data.user_id) {
        localStorage.setItem("user_id", data.user_id);
      }

      setShowSuccess(true);
      successTimeoutRef.current = setTimeout(handleSuccessClose, 2000);
    } catch (error) {
      let errorMessage = "Ocurrió un error al registrarse. Verifica tus datos.";

      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.detail) {
          errorMessage = data.detail;
        } else {
          const errorKeys = Object.keys(data);
          if (errorKeys.length > 0) {
            const firstError = data[errorKeys[0]];
            if (Array.isArray(firstError)) {
              errorMessage = firstError[0];
            } else if (typeof firstError === "string") {
              errorMessage = firstError;
            }
          }
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.authCard}>
        <h1 className={classes.title}>Crear cuenta</h1>
        <p className={classes.subtitle}>Únete para organizar tus proyectos</p>

        {error && <div className={classes.errorBox}>{error}</div>}

        <form className={classes.form} onSubmit={handleSubmit}>
          <div className={classes.inputGroup}>
            <label>Nombre de usuario</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ej: usuario123"
              required
            />
          </div>
          <div className={classes.inputGroup}>
            <label>Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ej: tu@correo.com"
              required
            />
          </div>
          <div className={classes.inputGroup}>
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className={classes.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? "Creando..." : "Registrarse"}
          </button>
        </form>

        <p className={classes.switchText}>
          ¿Ya tienes cuenta?{" "}
          <Link to="/" className={classes.link}>
            Inicia sesión
          </Link>
        </p>
      </div>

      {showSuccess && (
        <div
          className={classes.successOverlay}
          role="dialog"
          aria-modal="true"
          aria-live="polite"
        >
          <div className={classes.successModal}>
            <div className={classes.successIcon} aria-hidden="true">
              ✓
            </div>
            <h2 className={classes.successTitle}>¡Cuenta creada con éxito!</h2>
            <p className={classes.successMessage}>
              Te estamos llevando a Hoy...
            </p>
            <button
              type="button"
              className={classes.successButton}
              onClick={handleSuccessClose}
            >
              Ir ahora
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignupPage;
