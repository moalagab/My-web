import { ArrowUpRight } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import { Link } from "react-router";
import Navigation from "@/components/Navigation";
import PageHero from "@/components/studio/PageHero";
import Footer from "@/components/Footer";
import LifeTentShowcase from "@/components/studio/LifeTentShowcase";
import ProductVisual from "@/components/studio/ProductVisual";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProductsPage() {
  const { lang, dictionary: d, isRtl } = useLanguage();
  const ar = lang === "ar";
  const prefix = ar ? "" : "/en";
  const title = ar
    ? "من التصميم، إلى منتج يعمل."
    : "From design to a working product.";
  const features = ar
    ? [
        ["الأهداف", "المالية", "المهام", "العادات"],
        ["المبيعات", "خدمة العملاء", "وكيل AI"],
      ]
    : [
        ["Goals", "Finances", "Tasks", "Habits"],
        ["Sales", "Customer service", "AI agent"],
      ];
  const pillars = ar
    ? [
        { title: "التجربة أولًا", body: "واجهات مصممة حول طريقة استخدام الناس الفعلية، لا حول الشاشات." },
        { title: "النظام خلفها", body: "بيانات وأتمتة وتكاملات تجعل المنتج يعمل كل يوم دون تدخل." },
        { title: "قابل للنمو", body: "يُطلق على مراحل صغيرة، يُقاس أثره، ثم يتحسن بناءً على الاستخدام." },
      ]
    : [
        { title: "Experience first", body: "Interfaces designed around how people actually use them, not around screens." },
        { title: "The system behind", body: "Data, automation and integrations that keep the product working every day." },
        { title: "Built to grow", body: "Shipped in small releases, measured, then improved from real use." },
      ];
  return (
    <>
      <PageMeta title={d.productsPage.metaTitle} description={d.productsPage.metaDescription} />
      <Navigation />
      <main className="products-page" id="main-content">
        <PageHero
          image="/work/media/mono-rings.webp"
          eyebrow="PRODUCTS / BUILT TO WORK"
          title={title}
          side={
            <p>
              {ar
                ? "التصميم لا يتوقف عند الواجهة. هذه منتجات بنيتها لربط تجربة المستخدم بما يحدث خلفها."
                : "Design does not end at the interface. These are products I built to connect the user experience with what happens behind it."}
            </p>
          }
        />
        <section className="studio-section product-pillars-section" aria-label={ar ? "كيف أبني المنتجات" : "How I build products"}>
          <div className="studio-container">
            <ul className="product-pillars">
              {pillars.map((p, i) => (
                <li key={p.title} data-reveal>
                  <span dir="ltr">0{i + 1}</span>
                  <h2>{p.title}</h2>
                  <p>{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <LifeTentShowcase />
        <section className="studio-section">
          <div className="studio-container">
            <ul className="featured-rows">
              {d.home.products.items.slice(1).map((p) => (
                <li className="featured-row" key={p.name} data-reveal>
                  <div className="featured-row-media" aria-hidden="true">
                    <ProductVisual kind="agent" />
                  </div>
                  <div className="featured-row-body">
                    <p className="studio-eyebrow" dir="ltr">
                      AI AUTOMATION
                    </p>
                    <h2 dir="ltr">{p.name}</h2>
                    <p>{p.body}</p>
                    <ul className="product-feature-list">
                      {features[1].map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noreferrer" className="studio-text-link">
                        {d.home.products.visit}
                        <ArrowUpRight size={18} className={isRtl ? "-scale-x-100" : ""} />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="studio-cta">
          <div className="studio-container">
            <p className="studio-eyebrow">LET’S BUILD</p>
            <h2>
              {ar ? "فكرتك تستحق\nأن تعمل." : "Your idea deserves\nto work."}
            </h2>
            <div>
              <p>
                {ar
                  ? "ابدأ بالسياق والهدف. نحدد النسخة الأولى، نصمم التجربة، ونبني ما يخدم المستخدم والعمل."
                  : "Start with the context and goal. Define the first release, design the experience, and build what serves your users and your business."}
              </p>
              <Link to={`${prefix}/start?service=digital`} className="nav-pill nav-pill--solid">
                <span>{d.navigation.start}</span>
                <span className="nav-pill-dot" aria-hidden="true">
                  <ArrowUpRight size={18} />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
