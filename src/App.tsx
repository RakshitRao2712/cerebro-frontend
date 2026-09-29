import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";

/**
 * Main application component with client-side routing.
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-black min-h-screen text-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* /console also points to dashboard for now */}
          <Route path="/console" element={<DashboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
