import { Outlet } from "react-router-dom";

import classes from "./RootLayout.module.css";
import MainNavigation from "./MainNavigation";

function RootLayout() {
  return (
    <>
      <div className={classes.layout}>
        <MainNavigation />
        <main className={classes.content}>
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default RootLayout;
