import { MdSearch } from "react-icons/md";

import classes from "./SearchBar.module.css";

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className={classes.searchContainer}>
      <MdSearch className={classes.searchIcon} />
      <input
        type="text"
        className={classes.searchInput}
        placeholder={placeholder || "Buscar tarea..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;
