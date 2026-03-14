import { MdFilterList } from "react-icons/md";

import classes from "./TodayFilters.module.css";
import SearchBar from "./SearchBar";
import SectionTabs from "./SectionTabs";

export default function TodayFilters({
  searchQuery,
  setSearchQuery,
  courseFilter,
  setCourseFilter,
  availableCourses,
  priorityFilter,
  setPriorityFilter,
  sectionFilter,
  setSectionFilter,
}) {
  return (
    <section className={classes.filtersSection}>
      <div className={classes.filterGroup}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nombre o asignatura..."
        />

        <MdFilterList className={classes.filterIcon} />
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className={classes.filterSelect}
        >
          <option value="all">Todas las asignaturas</option>
          {availableCourses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className={classes.filterSelect}
        >
          <option value="all">Todas las prioridades</option>
          <option value="Alta">Prioridad Alta</option>
          <option value="Media">Prioridad Media</option>
          <option value="Baja">Prioridad Baja</option>
        </select>
      </div>

      <div className={classes.sectionTabsContainer}>
        <SectionTabs current={sectionFilter} onChange={setSectionFilter} />
      </div>
    </section>
  );
}
