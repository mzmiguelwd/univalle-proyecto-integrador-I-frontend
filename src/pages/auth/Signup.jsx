import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

import classes from "./Auth.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage =
          "Ocurrió un error al registrarse. Verifica tus datos.";

        if (data && typeof data === "object") {
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

        throw new Error(errorMessage);
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      navigate("/");
    } catch (error) {
      setError(error.message);
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
              placeholder="ej: usuario123"
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
              placeholder="ej: tu@correo.com"
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
    </div>
  );
}

export default SignupPage;
