import { Route, Routes } from "react-router-dom";
import AppLayout from "./AppLayout";
import ChooseOverlayPage from "./pages/ChooseOverlayPage";
import CropImagePage from "./pages/CropImagePage";
import StartPage from "./pages/StartPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route path="/choose-overlay" element={<ChooseOverlayPage />} />
        <Route path="/crop-image" element={<CropImagePage />} />
        <Route path="/" element={<StartPage />} />
      </Route>
    </Routes>
  );
}
