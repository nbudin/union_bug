import { Outlet } from "react-router-dom";
import ResultModal from "./ResultModal";

export default function AppLayout() {
  return (
    <>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand">Union Bug</span>
        </div>
      </nav>
      <div className="container">
        <Outlet />
      </div>

      <ResultModal />
    </>
  );
}
