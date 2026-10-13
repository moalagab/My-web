import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

// Each page module is registered once per language with its own id.
const pages = (lang: "ar" | "en") => [
  index("pages/HomePage.tsx", { id: `${lang}-home` }),
  route("about", "pages/AboutPage.tsx", { id: `${lang}-about` }),
  route("services", "pages/ServicesPage.tsx", { id: `${lang}-services` }),
  route("start", "pages/StartPage.tsx", { id: `${lang}-start` }),
  route("privacy", "pages/PrivacyPage.tsx", { id: `${lang}-privacy` }),
  route("work", "pages/WorkPage.tsx", { id: `${lang}-work` }),
  route("work/:slug", "pages/ProjectDetailPage.tsx", { id: `${lang}-project` }),
  route("products", "pages/ProductsPage.tsx", { id: `${lang}-products` }),
  route("styleguide", "pages/StyleGuidePage.tsx", { id: `${lang}-styleguide` }),
  route("services/request", "routes/start-redirect.tsx", { id: `${lang}-redirect-services` }),
  route("book", "routes/start-redirect.tsx", { id: `${lang}-redirect-book` }),
  route("contact", "routes/start-redirect.tsx", { id: `${lang}-redirect-contact` }),
  route("*", "pages/NotFound.tsx", { id: `${lang}-not-found` }),
];

export default [
  route("admin", "pages/AdminDashboard.tsx", { id: "admin" }),
  route("auth", "routes/auth-redirect.tsx", { id: "auth" }),
  route("ar/*", "routes/ar-redirect.tsx", { id: "ar-redirect" }),
  route("en", "routes/layout-en.tsx", { id: "lang-en" }, pages("en")),
  layout("routes/layout-ar.tsx", { id: "lang-ar" }, pages("ar")),
] satisfies RouteConfig;
