import { NavLink } from "react-router-dom";
import { MdWbSunny, MdAnalytics, MdPerson, MdAdd } from "react-icons/md";

import classes from "./MainNavigation.module.css";

function MainNavigation() {
  const navItems = [
    { to: "/hoy", icon: <MdWbSunny size={24} />, label: "Hoy" },
    // { to: "/progreso", icon: <MdAnalytics size={24} />, label: "Progreso" },
    { to: "/perfil", icon: <MdPerson size={24} />, label: "Perfil" },
  ];

  return (
    <nav className={classes.nav}>
      <div className={classes.logoSection}>
        <div className={classes.logoIcon}>SP</div>
        <span className={classes.logoText}>SPlanner</span>
      </div>

      <NavLink to="/crear" className={classes.fab}>
        Nueva Actividad
        <MdAdd size={24} />
      </NavLink>

      <ul className={classes.navList}>
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
            >
              {item.icon}
              <span className={classes.label}>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default MainNavigation;
