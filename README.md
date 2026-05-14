# Planificador de Estudio para Actividades Evaluativas 📚

![Status](https://img.shields.io/badge/Estado-Desplegado-success)
![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-blue)
![Backend](https://img.shields.io/badge/Backend-Django%20REST-green)
![Base de Datos](<https://img.shields.io/badge/Database-PostgreSQL%20(Supabase)-blue>)

## 📌 Enlaces de Despliegue

| Entorno                     | URL                                                                     |
| --------------------------- | ----------------------------------------------------------------------- |
| **🚀 Frontend (App Web)**   | `https://tareaslist-two.vercel.app/`                                    |
| **⚙️ Backend (API REST)**   | `https://univalle-proyecto-integrador-i-backend-mo0i.onrender.com`      |
| **📖 Repositorio Frontend** | `https://github.com/mzmiguelwd/univalle-proyecto-integrador-I-frontend` |
| **📖 Repositorio Backend**  | `https://github.com/mzmiguelwd/univalle-proyecto-integrador-I-backend`  |

---

## 🎯 Descripción del Proyecto

Aplicación web diseñada para estudiantes universitarios que permite planificar, ejecutar y gestionar actividades evaluativas. Facilita el trabajo académico priorizando de forma clara y permitiendo una rápida adaptación y reprogramación cuando surgen cambios de fechas, imprevistos o sobrecarga de tareas.

### ✨ Funcionalidades Principales

- **Gestión de Evaluaciones:** Creación de actividades evaluativas con su plan de trabajo detallado (subtareas).
- **Seguimiento Continuo:** Registro en tiempo real del progreso de las actividades.
- **Manejo de Imprevistos:** Reprogramación fluida de tareas en caso de retrasos o sobrecarga.
- **Prevención de Sobrecarga:** Detección de conflictos de planificación.
- **Vista Diaria (Today):** Visualización clara de las áreas de progreso y prioridades del día actual.

---

## 🏗 Arquitectura y Tecnologías

El proyecto se enmarca en una arquitectura **Cliente-Servidor**.

### Frontend

- **React.js** + **Vite**: Para una interfaz de usuario reactiva, rápida y modular.
- **CSS Modules**: Estilos independientes y encapsulados.
- **Axios / Fetch**: Cliente HTTP para consumir la API.

### Backend

- **Python / Django**: Framework robusto y escalable para la lógica del servidor.
- **Django REST Framework (DRF)**: Para la rápida y segura exposición de endpoints API.
- **PostgreSQL (vía Supabase)**: Base de datos relacional para el almacenamiento íntegro de tareas, usuarios y reportes.

---

## ⚙️ Variables de Entorno (.env)

Para la ejecución local, asegúrate de crear y configurar los siguientes archivos de variables de entorno en el inicio de sus respectivas carpetas:

### Variables Backend (`univalle-proyecto-integrador-I-backend/.env`)

```env
DEBUG=True
SECRET_KEY=tu_secret_key_de_django
DATABASE_URL=tu_conexion_de_supabase_postgresql
ALLOWED_HOSTS=localhost,127.0.0.1,[tu_dominio_backend]
CORS_ALLOWED_ORIGINS=http://localhost:5173,[tu_dominio_frontend]
```

### Variables Frontend (`univalle-proyecto-integrador-I-frontend/.env`)

```env
VITE_API_URL=http://localhost:8000
```

_(Para despliegue, cambia `VITE_API_URL` hacia la URL real de tu Backend desplegado en Render)_

---

## 🚀 Uso e Instalación en Entorno Local

Al ser un proyecto dividido en dos servicios principales, es necesario levantar tanto el Backend como el Frontend de manera simultánea.

### 1. Instrucciones para el Backend (API)

```bash
# 1. Navegar al directorio del backend
cd univalle-proyecto-integrador-I-backend

# 2. Crear entorno virtual (opcional pero recomendado)
python -m venv venv

# 3. Activar el entorno virtual
# En Windows:
source venv/Scripts/activate
# En Linux/Mac:
source venv/bin/activate

# 4. Instalar las dependencias de Python
pip install -r requirements.txt

# 5. Aplicar migraciones a la base de datos (Supabase / Local)
python manage.py migrate

# 6. Levantar el servidor
python manage.py runserver
# La API correrá en http://localhost:8000
```

### 2. Instrucciones para el Frontend

```bash
# 1. Navegar al directorio del frontend (en otra terminal)
cd univalle-proyecto-integrador-I-frontend

# 2. Instalar las dependencias de Node.js
npm install
# ó
yarn install

# 3. Levantar el entorno de desarrollo
npm run dev
# ó
yarn dev
# La web correrá usualmente en http://localhost:5173
```

---

## 📈 Despliegue (Cómo se hizo)

### Frontend

- Hospedado en: _Vercel_
- Los pasos incluyen configurar `VITE_API_URL` apuntando a la URL publica del backend, y usar `npm run build` como comando de construcción.

### Backend

- Hospedado en: _Render_
- Configuración mediante Gunicorn y WSGI. Se habilitaron correctamente los CORS de la URL en la que reside el Frontend, y las variables de entorno de BD están vinculadas con **Supabase**.

---

## 👤 Autor e Información

Creado y desarrollado como parte de las actividades evaluativas de la Universidad del Valle. Todo el diseño de arquitectura y desarrollo de la aplicación se adhieren a estándares de separación de responsabilidades e integridad de datos.
