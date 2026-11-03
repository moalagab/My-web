import { useLanguage } from "@/contexts/LanguageContext";

// Vector logos in public/clients, cut from Mo's logo archive (navy and light versions),
// with each file's width / height ratio.
const clients = [
  ["almahrizi", "Almahrizi Group", 1.675],
  ["sabaa", "Sabaa Construction", 1.295],
  ["talia", "Talia Bakery", 0.835],
  ["rivers", "Rivers Essential Oils", 1.165],
  ["gyptech", "Gyptech", 1.862],
  ["majlan", "Majlan", 1.094],
  ["nasaq", "Nasaq", 2.004],
  ["waselny", "Waselny", 2.379],
  ["libra", "Libra Engineering & Constructions", 1.766],
  ["diamond-style", "Diamond Style", 4.172],
  ["viviano", "Viviano", 0.936],
  ["first-value", "First Value", 3.228],
  ["sahar-almakan", "Sahar Almakan Investment", 1.301],
  ["rabya-al-oud", "Rabya Al Oud", 1.018],
  ["aspar-impex", "Aspar Impex", 1.042],
  ["bloc9-burger", "Bloc9 Burger", 4.144],
  ["daris", "Daris", 2.481],
  ["eve", "Eve Digital Marketing Agency", 2.011],
  ["yaz-academy", "YAZ Academy", 2.459],
  ["harvest", "Harvest", 4.579],
  ["location-cafe", "Location Cafe", 1.0],
  ["relax-day", "Relax Day Hotel Suit", 2.38],
  ["sevenart", "Sevenart Creative Agency", 3.793],
  ["rozllex", "Rozllex Consulting", 3.896],
  ["pianca", "Pianca", 2.702],
  ["paper-product-sheet", "Paper Product Sheet", 3.407],
] as const;

/** Visual area each logo gets, in px²: a square mark lands near 63px tall. */
const LOGO_AREA = 4000;

/** Client logos as one still wall, each sized to the same visual area. */
export default function ClientMarquee() {
  const { dictionary } = useLanguage();
  return (
    <section className="client-band" aria-label={dictionary.home.proof.logosLabel}>
      <div className="studio-container client-band-inner">
        <p className="client-band-label">{dictionary.home.proof.logosLabel}</p>
        <ul className="client-wall">
          {clients.map(([file, name, ratio]) => {
            // Equal visual area for every mark: square logos stand taller, wide ones run longer.
            const height = Math.round(Math.min(64, Math.max(28, Math.sqrt(LOGO_AREA / ratio))));
            return (
              <li key={file}>
                <img
                  src={`/clients/${file}-navy.svg`}
                  alt={name}
                  width={Math.round(height * ratio)}
                  height={height}
                  loading="lazy"
                  decoding="async"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
