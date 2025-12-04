import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import RegisterKid from "./pages/RegisterKid";
import KidsList from "./pages/KidsList";
import MarkAttendance from "./pages/MarkAttendance";
import AttendanceHistory from "./pages/AttendanceHistory";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              localStorage.getItem("authUser") ? (
                <Index />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/register"
            element={
              localStorage.getItem("authUser") ? (
                <RegisterKid />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/kids"
            element={
              localStorage.getItem("authUser") ? (
                <KidsList />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/attendance"
            element={
              localStorage.getItem("authUser") ? (
                <MarkAttendance />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/history"
            element={
              localStorage.getItem("authUser") ? (
                <AttendanceHistory />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
