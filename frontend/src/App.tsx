import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import { Toaster } from "./components/ui/sonner";
// import CreatePage from "./pages/CreatePage";
import PageDetails from "./components/PageDetails";

function App() {
  const isAuthenticated = !!sessionStorage.getItem("authToken");

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/signup"} />}
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/page/:pageId" element={<PageDetails />} />
        {/* <Route path="/create-page" element={<CreatePage />} /> */}
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
