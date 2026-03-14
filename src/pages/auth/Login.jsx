import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import classes from "./Auth.module.css";
import { loginUser } from "../../api/auth";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
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
      const data = await loginUser(formData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      if (data.user_id) {
        localStorage.setItem("user_id", data.user_id);
      }

      navigate("/hoy");
    } catch (error) {
      let errorMessage = "Credenciales inválidas. Verifica tus datos.";

      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
          errorMessage = data.non_field_errors[0];
        } else {
          const errorKeys = Object.keys(data);
          if (errorKeys.length > 0) {
            const firstError = data[errorKeys[0]];
            if (Array.isArray(firstError)) {
              errorMessage = firstError[0];
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
        <h1 className={classes.title}>¡Bienvenido!</h1>
        <p className={classes.subtitle}>Ingresa tus datos para continuar</p>

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
            {isLoading ? "Verificando..." : "Entrar al Planificador"}
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
