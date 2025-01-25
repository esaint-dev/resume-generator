import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Profile from "./pages/Profile";
import ResumeBuilder from "./pages/ResumeBuilder";
import MyResumes from "./pages/MyResumes";
import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/auth/login"
              element={user ? <Navigate to="/" /> : <Login />}
            />
            <Route
              path="/auth/signup"
              element={user ? <Navigate to="/" /> : <Signup />}
            />
            <Route
              path="/profile"
              element={user ? <Profile /> : <Navigate to="/auth/login" />}
            />
            <Route
              path="/resume-builder"
              element={user ? <ResumeBuilder /> : <Navigate to="/auth/login" />}
            />
            <Route
              path="/my-resumes"
              element={user ? <MyResumes /> : <Navigate to="/auth/login" />}
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;