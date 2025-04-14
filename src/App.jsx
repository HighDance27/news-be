import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./contexts/AuthContext";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import ArticleDetail from "./components/ArticleDetail";
import CategoryPage from "./components/CategoryPage";
import Login from "./components/Login";
import Register from "./components/Register";
import EditArticle from "./components/EditArticle";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import EditorDashboard from "./components/EditorDashboard";
import Callback from "./components/Callback";
import ExternalRedirect from "./components/ExternalRedirect";
import Category from "./components/Category";
import Categories from "./components/Categories";
import ReadingHistoryPage from "./components/ReadingHistoryPage";
import FavoritesPage from "./components/FavoritesPage";
import CategoriesPage from "./components/CategoriesPage";
import { URLs } from "./api";
import LatestNews from "./components/LatestNews";
import HotNews from "./components/HotNews";
import Search from "./components/Search";
import TagPage from "./components/TagPage";
import Tags from "./components/Tags";

function App() {
  // Lấy Google Client ID từ biến môi trường
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<Search />} />
                <Route path="/article/:articleId" element={<ArticleDetail />} />
                <Route
                  path="/category/:categoryId"
                  element={<CategoryPage />}
                />
                <Route
                  path="/tag/:tagId"
                  element={<TagPage />}
                />
                <Route path="/tags" element={<Tags />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/callback" element={<Callback />} />
                <Route
                  path="/api/auth/google-callback"
                  element={<Callback />}
                />
                <Route
                  path="https://stunews.static.domains/callback"
                  element={<Callback />}
                />
                <Route
                  path="/redirect-from-external"
                  element={<ExternalRedirect />}
                />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/category/:category" element={<Category />} />
                <Route path="/admin" element={<PrivateRoute role="admin" />} />
                <Route
                  path="/admin-dashboard"
                  element={
                    <PrivateRoute role="admin">
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/editor-dashboard"
                  element={
                    <PrivateRoute role="editor">
                      <EditorDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute allowedRoles={["editor", "admin"]}>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/add-article"
                  element={
                    <PrivateRoute allowedRoles={["editor", "admin"]}>
                      <EditArticle />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/edit-article/:id"
                  element={
                    <PrivateRoute allowedRoles={["editor", "admin"]}>
                      <EditArticle />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/reading-history"
                  element={
                    <PrivateRoute>
                      <ReadingHistoryPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <PrivateRoute>
                      <FavoritesPage />
                    </PrivateRoute>
                  }
                />
                <Route path="/latest-news" element={<LatestNews />} />
                <Route path="/hot-news" element={<HotNews />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}

export default App;

/**
 *
 * Anh muoson dudocjw cung xem afjlf ur sfsl
 *
 */
