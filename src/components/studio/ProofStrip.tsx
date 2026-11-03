type Fact = { number: string; label: string; detail?: string };

/** The experience figures as one ruled row: the number large, its label and detail under it. */
export default function ProofStrip({ intro, facts, label }: { intro: string; facts: readonly Fact[]; label: string }) {
  return (
    <section className="studio-section studio-proof" aria-labelledby="proof-title">
      <div className="studio-container">
        <div className="section-heading">
          <div>
            <p className="studio-eyebrow">{label}</p>
            <h2 id="proof-title">{intro}</h2>
          </div>
        </div>
        <ul className="stat-cards">
          {facts.map((f) => (
            <li key={f.number} className="stat-card">
              <strong dir="ltr">{f.number}</strong>
              <span>{f.label}</span>
              {f.detail ? <small>{f.detail}</small> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
