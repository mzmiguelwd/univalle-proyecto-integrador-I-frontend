import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import ErrorPage from "./pages/Error.jsx";
import LoginPage from "./pages/auth/Login.jsx";
import SignupPage from "./pages/auth/Signup.jsx";
import RootLayout from "./components/RootLayout.jsx";
import TodayPage from "./pages/Today.jsx";
import CreateTaskPage from "./pages/CreateTask.jsx";
import TaskDetailPage from "./pages/TaskDetail.jsx";
import ProgressPage from "./pages/Progress.jsx";
import ProfilePage from "./pages/Profile.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      {
        element: <RootLayout />,
        children: [
          { path: "hoy", element: <TodayPage /> },
          { path: "crear", element: <CreateTaskPage /> },
          { path: "actividad/:id", element: <TaskDetailPage /> },
          { path: "progreso", element: <ProgressPage /> },
          { path: "perfil", element: <ProfilePage /> },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
