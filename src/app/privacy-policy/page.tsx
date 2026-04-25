export default function PrivacyPolicy() {
  return (
    <main style={{
      padding: "48px 24px",
      maxWidth: "760px",
      margin: "auto",
      lineHeight: 1.7,
      color: "#1e1e2f",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <h1 style={{
        fontSize: "1.9rem",
        fontWeight: 700,
        marginBottom: "8px",
        color: "#0f172a"
      }}>
        Politique de confidentialité – Mobility
      </h1>

      <p style={{
        fontSize: "0.9rem",
        color: "#6b7280",
        marginBottom: "36px",
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: "20px"
      }}>
        Dernière mise à jour : 2026
      </p>

      <Section title="1. Données collectées">
        L’application peut collecter certaines informations telles que le nom,
        le numéro de téléphone, les informations liées aux véhicules ainsi que
        les images ajoutées par l’utilisateur.
      </Section>

      <Section title="2. Utilisation de la caméra">
        L’application accède à la caméra uniquement pour permettre aux utilisateurs
        de prendre des photos de leurs véhicules dans le cadre des fonctionnalités
        d’achat et de vente.
        <br /><br />
        Aucune photo n’est prise ni enregistrée sans l’action et le consentement
        explicite de l’utilisateur.
      </Section>

      <Section title="3. Utilisation des données">
        Les données collectées sont utilisées uniquement pour permettre la publication
        et la gestion des annonces ainsi que pour améliorer l’expérience utilisateur.
      </Section>

      <Section title="4. Partage des données">
        Aucune donnée personnelle n’est vendue ou partagée avec des tiers sans consentement.
      </Section>

      <Section title="5. Sécurité">
        Nous mettons en place des mesures de sécurité pour protéger les données des utilisateurs.
      </Section>

      <Section title="6. Contact" isLast>
        Email : <a href="mailto:mobilitymali.app@gmail.com" style={{ color: "#2563eb", textDecoration: "none" }}>mobilitymali.app@gmail.com</a>
      </Section>
    </main>
  );
}

function Section({ title, children, isLast }: { title: string; children: React.ReactNode; isLast?: boolean }) {
  return (
    <div style={{
      marginBottom: isLast ? "0" : "28px",
      padding: "20px 24px",
      backgroundColor: "#f9fafb",
      borderRadius: "10px",
      border: "1px solid #f3f4f6"
    }}>
      <h2 style={{
        fontSize: "1.2rem",
        fontWeight: 600,
        margin: "0 0 10px 0",
        color: "#111827"
      }}>
        {title}
      </h2>
      <p style={{ margin: 0, color: "#374151" }}>
        {children}
      </p>
    </div>
  );
}