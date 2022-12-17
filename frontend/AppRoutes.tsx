import { Route, Routes } from "react-router-dom";
import IndexPage from "./IndexPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route index element={<IndexPage />} />
    </Routes>
  );
}
