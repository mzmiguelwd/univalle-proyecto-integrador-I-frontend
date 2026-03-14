import { useEffect, useState } from "react"
import { fetchProgressData } from "../api/tasks"
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

export default function ProgressPage() {

  const [monthlyData, setMonthlyData] = useState([])
  const [weeklyData, setWeeklyData] = useState([])
  const [hoursData, setHoursData] = useState([])

  const [kpis, setKpis] = useState({
    tasks_month: 0,
    tasks_week: 0,
    hours: 0,
    completion: 0
  })

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const data = await fetchProgressData()

        setMonthlyData(data.monthly_tasks)
        setWeeklyData(data.weekly_tasks)
        setHoursData(data.hours_worked)
        setKpis(data.kpis)

      } catch (error) {
        console.error("Error cargando progreso", error)
      }
    }

  loadProgress()
}, [])

  return (
    <div className={classes.page}>

      <div className={classes.header}>
        <h1>Progreso</h1>
        <p>Resumen del rendimiento y avance de actividades</p>
      </div>

      {/* KPI */}
      <div className={classes.kpiGrid}>

        <div className={classes.kpiCard}>
          <span>Total actividades</span>
          <strong>{kpis.tasks_month}</strong>
        </div>

        <div className={classes.kpiCard}>
          <span>Subtareas esta semana</span>
          <strong>{kpis.tasks_week}</strong>
        </div>

        <div className={classes.kpiCard}>
          <span>Horas trabajadas</span>
          <strong>{kpis.hours}h</strong>
        </div>

        <div className={classes.kpiCard}>
          <span>Cumplimiento</span>
          <strong>{kpis.completion}%</strong>
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
          <h3>Subtareas por día</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="day"/>
              <YAxis allowDecimals={false}/>
              <Tooltip/>
              <Bar dataKey="tasks"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={classes.chartCard}>
          <h3>Horas de trabajo por día</h3>
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