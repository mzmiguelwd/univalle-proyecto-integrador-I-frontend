import classes from "./TaskGridSection.module.css";
import {
  getPriority,
  getSubtasksStats,
  formatDate,
  getNextDeliveryDate,
} from "../../utils/taskUtils";
import TaskCard from "./TaskCard";
import EmptyState from "./EmptyState";

export default function TaskGridSection({
  tasks,
  sectionFilter,
  targetFilter,
  title,
  icon,
  emptyMessage,
  emptyIcon,
  openModal,
  isCompleted = false,
  isOverdue = false,
  compact = false,
  children,
}) {
  if (sectionFilter !== "all" && sectionFilter !== targetFilter) {
    return null;
  }

  if (
    tasks.length === 0 &&
    sectionFilter === "all" &&
    targetFilter !== "today"
  ) {
    return null;
  }

  return (
    <section className={classes.taskSection}>
      <div className={classes.sectionHeader}>
        {icon === "🔴" ? (
          <span className={classes.urgentBadge}>
            {icon} {title}
          </span>
        ) : (
          <h2 className={classes.sectionTitle}>
            {icon} {title}
          </h2>
        )}
        <span className={classes.taskCount}>{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <EmptyState message={emptyMessage} icon={emptyIcon}>
          {children}
        </EmptyState>
      ) : (
        <div className={classes.grid}>
          {tasks.map((t) => (
            <div
              key={t.id}
              className={classes.cardLink}
              onClick={() => openModal(t)}
            >
              <TaskCard
                title={t.title}
                subject={t.course}
                priority={getPriority(t.task_type)}
                subtasksStats={
                  isCompleted
                    ? {
                        percentage: 100,
                        completed: t.subtasks?.length || 0,
                        total: t.subtasks?.length || 0,
                      }
                    : getSubtasksStats(t.subtasks)
                }
                nextDelivery={
                  isCompleted ? "---" : getNextDeliveryDate(t.subtasks)
                }
                finalDelivery={formatDate(t.due_date, true)}
                isOverdue={isOverdue}
                isCompleted={isCompleted}
                compact={compact}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
