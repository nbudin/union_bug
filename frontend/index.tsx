import { createRoot } from "react-dom/client";
import "bootstrap";
import "./application.scss";
import AppWrapper from "./AppWrapper";
import AppRoutes from "./AppRoutes";

document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.createElement("div");
  document.body.appendChild(rootElement);
  const root = createRoot(rootElement);
  root.render(
    <AppWrapper>
      <AppRoutes />
    </AppWrapper>
  );
});
