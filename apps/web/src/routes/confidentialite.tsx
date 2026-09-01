import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/LegalPage";
import { m } from "../paraglide/messages.js";

export const Route = createFileRoute("/confidentialite")({
  ssr: false,
  component: ConfidentialitePage,
});

function ConfidentialitePage() {
  return (
    <LegalPage title={m.legal_confidentialite_title()}>
      <p>{m.legal_confidentialite_intro()}</p>

      <h2>{m.legal_confidentialite_local_heading()}</h2>
      <p>{m.legal_confidentialite_local_body()}</p>

      <h2>{m.legal_confidentialite_account_heading()}</h2>
      <p>{m.legal_confidentialite_account_body()}</p>

      <h2>{m.legal_confidentialite_hosting_heading()}</h2>
      <p>{m.legal_confidentialite_hosting_body()}</p>

      <h2>{m.legal_confidentialite_rights_heading()}</h2>
      <p>{m.legal_confidentialite_rights_body()}</p>
    </LegalPage>
  );
}
