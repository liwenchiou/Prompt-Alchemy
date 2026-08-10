import { createHashRouter } from "react-router-dom";
import Agentskills from "../pages/agent-skill/agentSkills";
import App from "../App";
import HomeLayout from "../layouts/homeLayout";
import Home from "../pages/home/home";
import Skills from "../pages/prompt/skills";
import SkillDetail from "../pages/prompt/skillDetail";
import Favorite from "../pages/favorite/favorite";
import Login from "../pages/member/login";
import Register from "../pages/member/register";
import Profile from "../pages/favorite/profile";
import Password from "../pages/favorite/password";
import NotFound from "../pages/notFound";
import FavoriteLayout from "../layouts/favoriteLayout";
import adminRoutes from "./adminRoutes";

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
          { path: "agent-skills", element: <Agentskills /> },
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
