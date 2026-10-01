import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import PageTransition from "@/components/PageTransition";

import ConsentBanner from "@/components/ConsentBanner";
import HomePage from "./pages/HomePage";
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const StartPage = lazy(() => import("./pages/StartPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const WorkPage = lazy(() => import("./pages/WorkPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
import NotFound from "./pages/NotFound";
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const StyleGuidePage = lazy(() => import("./pages/StyleGuidePage"));

const queryClient = new QueryClient();

// Animated Routes wrapper
const AnimatedRoutes = ({ lang }: { lang: "en" | "ar" }) => {
  const location = useLocation();

  return (
    <LanguageProvider initialLang={lang}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <HomePage />
            </PageTransition>
          }
        />
        <Route
          path="/about"
          element={
            <PageTransition>
              <AboutPage />
            </PageTransition>
          }
        />
        <Route
          path="/services"
          element={
            <PageTransition>
              <ServicesPage />
            </PageTransition>
          }
        />
        <Route
          path="/services/request"
          element={
            <Navigate to={lang === "en" ? "/en/start" : "/start"} replace />
          }
        />
        <Route
          path="/start"
          element={
            <PageTransition>
              <StartPage />
            </PageTransition>
          }
        />
        <Route
          path="/privacy"
          element={
            <PageTransition>
              <PrivacyPage />
            </PageTransition>
          }
        />
        <Route
          path="/work"
          element={
            <PageTransition>
              <WorkPage />
            </PageTransition>
          }
        />
        <Route
          path="/work/:slug"
          element={
            <PageTransition>
              <ProjectDetailPage />
            </PageTransition>
          }
        />
        <Route
          path="/products"
          element={
            <PageTransition>
              <ProductsPage />
            </PageTransition>
          }
        />
        <Route
          path="/styleguide"
          element={
            <PageTransition>
              <StyleGuidePage />
            </PageTransition>
          }
        />
        <Route
          path="/book"
          element={
            <Navigate to={lang === "en" ? "/en/start" : "/start"} replace />
          }
        />
        <Route
          path="/contact"
          element={
            <Navigate to={lang === "en" ? "/en/start" : "/start"} replace />
          }
        />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </LanguageProvider>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="route-loading" role="status">
                <span>MO /</span>
                <span className="sr-only">Loading / جارٍ التحميل</span>
              </div>
            }
          >
            <Routes>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/en/*" element={<AnimatedRoutes lang="en" />} />
              <Route path="/ar/*" element={<Navigate to="/" replace />} />
              <Route path="/*" element={<AnimatedRoutes lang="ar" />} />
            </Routes>
          </Suspense>
          <ConsentBanner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
