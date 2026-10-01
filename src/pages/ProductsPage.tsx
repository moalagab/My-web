import { ArrowUpRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
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
  return (
    <>
      <Helmet>
        <title>{`${d.navigation.products} — ${d.brand.name}`}</title>
        <meta
          name="description"
          content={d.home.products.items.map((p) => p.body).join(" ")}
        />
        <link rel="canonical" href={`https://moalagab.art${prefix}/products`} />
      </Helmet>
      <Navigation />
      <main className="pt-20 products-page" id="main-content">
        <section className="bg-primary text-primary-foreground">
          <div className="studio-container">
            <p className="studio-eyebrow">PRODUCTS / BUILT TO WORK</p>
            <h1 className="mt-6 max-w-4xl">{title}</h1>
            <p className="mt-6 max-w-xl text-base leading-8 opacity-80">
              {ar
                ? "التصميم لا يتوقف عند الواجهة. هذه منتجات بنيتها لربط تجربة المستخدم بما يحدث خلفها."
                : "Design does not end at the interface. These are products I built to connect the user experience with what happens behind it."}
            </p>
          </div>
        </section>
        <section className="studio-section">
          <div className="studio-container product-detail-list">
            {d.home.products.items.map((p, i) => (
              <article className="product-detail" key={p.name} data-reveal>
                <ProductVisual kind={i === 0 ? "life" : "agent"} />
                <div>
                  <p className="studio-eyebrow" dir="ltr">
                    0{i + 1} / {i === 0 ? "DIGITAL PRODUCT" : "AI AUTOMATION"}
                  </p>
                  <h2 dir="ltr">{p.name}</h2>
                  <p>{p.body}</p>
                  <ul className="product-feature-list">
                    {features[i].map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="studio-button"
                  >
                    {d.home.products.visit}
                    <ArrowUpRight
                      size={18}
                      className={isRtl ? "-scale-x-100" : ""}
                    />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="studio-cta">
          <div className="studio-container">
            <p className="studio-eyebrow">LET’S BUILD /</p>
            <h2>
              {ar ? "فكرتك تستحق\nأن تعمل." : "Your idea deserves\nto work."}
            </h2>
            <div>
              <p>
                {ar
                  ? "ابدأ بالسياق والهدف. نحدد النسخة الأولى، نصمم التجربة، ونبني ما يخدم المستخدم والعمل."
                  : "Start with the context and goal. Define the first release, design the experience, and build what serves your users and your business."}
              </p>
              <Link
                to={`${prefix}/start?service=digital`}
                className="studio-button studio-button-light"
              >
                {d.navigation.start}
                <ArrowUpRight size={19} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
