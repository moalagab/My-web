import { useLanguage } from "@/contexts/LanguageContext";

// Vector logos in public/clients, cut from Mo's logo archive (navy and light versions).
const clients = [
  ["almahrizi", "Almahrizi Group"],
  ["sabaa", "Sabaa Construction"],
  ["talia", "Talia Bakery"],
  ["rivers", "Rivers Essential Oils"],
  ["gyptech", "Gyptech"],
  ["majlan", "Majlan"],
  ["nasaq", "Nasaq"],
  ["waselny", "Waselny"],
  ["libra", "Libra Engineering & Constructions"],
  ["diamond-style", "Diamond Style"],
  ["viviano", "Viviano"],
  ["first-value", "First Value"],
  ["sahar-almakan", "Sahar Almakan Investment"],
  ["rabya-al-oud", "Rabya Al Oud"],
  ["aspar-impex", "Aspar Impex"],
  ["bloc9-burger", "Bloc9 Burger"],
  ["daris", "Daris"],
  ["eve", "Eve Digital Marketing Agency"],
  ["yaz-academy", "YAZ Academy"],
  ["harvest", "Harvest"],
  ["location-cafe", "Location Cafe"],
  ["relax-day", "Relax Day Hotel Suit"],
  ["sevenart", "Sevenart Creative Agency"],
  ["rozllex", "Rozllex Consulting"],
  ["pianca", "Pianca"],
  ["paper-product-sheet", "Paper Product Sheet"],
] as const;

/** Client logos drifting in one direction; hover pauses, reduced motion shows a still row. */
export default function ClientMarquee() {
  const { dictionary } = useLanguage();
  const row = (copy: boolean) => (
    <ul className="marquee-row" aria-hidden={copy || undefined}>
      {clients.map(([file, name]) => (
        <li key={file}>
          <img src={`/clients/${file}-navy.svg`} alt={copy ? "" : name} height={40} loading="lazy" decoding="async" />
        </li>
      ))}
    </ul>
  );
  return (
    <section className="client-band" aria-label={dictionary.home.proof.logosLabel}>
      <div className="studio-container client-band-inner">
        <p className="client-band-label">{dictionary.home.proof.logosLabel}</p>
        <div className="marquee" dir="ltr">
          <div className="marquee-track">
            {row(false)}
            {row(true)}
          </div>
        </div>
      </div>
    </section>
  );
}
