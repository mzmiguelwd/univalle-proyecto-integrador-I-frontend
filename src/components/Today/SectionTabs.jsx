import classes from "./SectionTabs.module.css";

function SectionTabs({ current, onChange }) {
  const tabs = [
    { id: "all", label: "Todas" },
    { id: "today", label: "Hoy" },
    { id: "overdue", label: "Vencidas" },
    { id: "upcoming", label: "Próximamente" },
    { id: "noDate", label: "Sin fecha" },
    { id: "completed", label: "Completadas" },
  ];

  return (
    <div className={classes.tabsContainer}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${classes.tab} ${current === tab.id ? classes.active : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default SectionTabs;
