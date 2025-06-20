
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Search from "./pages/Search";
import Notifications from "./pages/Notifications";
import Explore from "./pages/Explore";
import Reels from "./pages/Reels";
import Settings from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background feed-grid">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary animate-pulse-orange mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            PlazaGram
          </h2>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background feed-grid">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary animate-pulse-orange mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            PlazaGram
          </h2>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? <Navigate to="/" replace /> : <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={
      <PublicRoute>
        <Auth />
      </PublicRoute>
    } />
    <Route path="/" element={
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    } />
    <Route path="/profile/:userId?" element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    } />
    <Route path="/messages" element={
      <ProtectedRoute>
        <Messages />
      </ProtectedRoute>
    } />
    <Route path="/search" element={
      <ProtectedRoute>
        <Search />
      </ProtectedRoute>
    } />
    <Route path="/notifications" element={
      <ProtectedRoute>
        <Notifications />
      </ProtectedRoute>
    } />
    <Route path="/explore" element={
      <ProtectedRoute>
        <Explore />
      </ProtectedRoute>
    } />
    <Route path="/reels" element={
      <ProtectedRoute>
        <Reels />
      </ProtectedRoute>
    } />
    <Route path="/settings" element={
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    } />
    <Route path="/admin" element={
      <ProtectedRoute>
        <AdminPanel />
      </ProtectedRoute>
    } />
    <Route path="/about" element={<About />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
