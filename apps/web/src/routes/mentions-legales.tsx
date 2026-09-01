import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/LegalPage";
import { m } from "../paraglide/messages.js";

export const Route = createFileRoute("/mentions-legales")({
  ssr: false,
  component: MentionsLegalesPage,
});

function MentionsLegalesPage() {
  return (
    <LegalPage title={m.legal_mentions_legales_title()}>
      <p>{m.legal_mentions_intro()}</p>

      <h2>{m.legal_mentions_publisher_heading()}</h2>
      <p>{m.legal_mentions_publisher_body()}</p>

      <h2>{m.legal_mentions_hosting_heading()}</h2>
      <p>{m.legal_mentions_hosting_body()}</p>

      <h2>{m.legal_mentions_ip_heading()}</h2>
      <p>{m.legal_mentions_ip_body()}</p>
    </LegalPage>
  );
}
