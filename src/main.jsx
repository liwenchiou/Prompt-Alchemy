import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routes/index.jsx";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary.jsx";
import "./styles/global.css";
import "./styles/driver-custom.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
);

