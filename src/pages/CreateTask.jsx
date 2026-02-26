import TaskForm from "../components/TaskForm";
import styles from "./CreateTask.module.css"; 

const API_URL = import.meta.env.VITE_API_URL;

const CreateTask = () => {
  const handleCreateTask = async (taskData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/tasks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`
        },

        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        throw new Error("Error al crear la tarea");
      }

      const data = await response.json();
      console.log("Tarea creada:", data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftColumn}>
        <div className={styles.card}>
          <TaskForm onSubmit={handleCreateTask} />
        </div>
      </div>

      <div className={styles.rightColumn}>
        <div className={styles.card}>
          <h3>CREAR SUBTAREAS</h3>
          <p>Aquí el componente de subtareas</p>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
