import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"

import classes from "./Progress.module.css"

const monthlyData = [
  { month: "Ene", tasks: 12 },
  { month: "Feb", tasks: 18 },
  { month: "Mar", tasks: 9 },
  { month: "Abr", tasks: 15 }
]

const weeklyData = [
  { day: "Lun", tasks: 3 },
  { day: "Mar", tasks: 2 },
  { day: "Mié", tasks: 4 },
  { day: "Jue", tasks: 1 },
  { day: "Vie", tasks: 3 }
]

const hoursData = [
  { day: "Lun", hours: 2 },
  { day: "Mar", hours: 4 },
  { day: "Mié", hours: 3 },
  { day: "Jue", hours: 2 },
  { day: "Vie", hours: 5 }
]

export default function ProgressPage() {
  return (
    <div className={classes.page}>

      <div className={classes.header}>
        <h1>Progreso</h1>
        <p>Resumen del rendimiento y avance de actividades</p>
      </div>

      {/* KPI */}
      <div className={classes.kpiGrid}>

        <div className={classes.kpiCard}>
          <span>Tareas este mes</span>
          <strong>18</strong>
        </div>

        <div className={classes.kpiCard}>
          <span>Tareas esta semana</span>
          <strong>6</strong>
        </div>

        <div className={classes.kpiCard}>
          <span>Horas trabajadas</span>
          <strong>24h</strong>
        </div>

        <div className={classes.kpiCard}>
          <span>Cumplimiento</span>
          <strong>72%</strong>
        </div>

      </div>

      {/* GRÁFICOS */}
      <div className={classes.chartGrid}>

        <div className={classes.chartCard}>
          <h3>Tareas por mes</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="month"/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="tasks"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={classes.chartCard}>
          <h3>Tareas por semana</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="day"/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="tasks"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={classes.chartCard}>
          <h3>Horas trabajadas</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hoursData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="day"/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="hours"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  )
}