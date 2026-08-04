import { createHashRouter } from "react-router-dom";
import App from "../App";
import HomeLayout from "../layouts/HomeLayout";
import Home from "../pages/home/HomePage";
import Skills from "../pages/prompt/SkillsPage";
import SkillDetail from "../pages/prompt/SkillDetailPage";
import Favorite from "../pages/favorite/FavoritePage";
import Login from "../pages/member/LoginPage";
import Register from "../pages/member/RegisterPage";
import Profile from "../pages/favorite/ProfilePage";
import Password from "../pages/favorite/PasswordPage";
import NotFound from "../pages/NotFoundPage";
import FavoriteLayout from "../layouts/FavoriteLayout";
import adminRoutes from "./AdminRoutes";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomeLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "skills",
            element: <Skills />,
          },
          {
            path: "skills/:id",
            element: <SkillDetail />,
          },
          {
            element: <FavoriteLayout />,
            children: [
              {
                path: "favorites",
                element: <Favorite />,
              },
              {
                path: "favorites/profile",
                element: <Profile />,
              },
              {
                path: "favorites/password",
                element: <Password />,
              },
            ],
          },
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "register",
            element: <Register />,
          },
          {
            path: "*",
            element: <NotFound />,
          },
        ],
      },
      adminRoutes,
    ],
  },
]);

export default router;
