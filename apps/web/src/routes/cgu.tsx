import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/LegalPage";
import { m } from "../paraglide/messages.js";

export const Route = createFileRoute("/cgu")({
  ssr: false,
  component: CguPage,
});

function CguPage() {
  return (
    <LegalPage title={m.legal_cgu_title()}>
      <p>{m.legal_cgu_intro()}</p>

      <h2>{m.legal_cgu_service_heading()}</h2>
      <p>{m.legal_cgu_service_body()}</p>

      <h2>{m.legal_cgu_account_heading()}</h2>
      <p>{m.legal_cgu_account_body()}</p>

      <h2>{m.legal_cgu_conduct_heading()}</h2>
      <p>{m.legal_cgu_conduct_body()}</p>

      <h2>{m.legal_cgu_liability_heading()}</h2>
      <p>{m.legal_cgu_liability_body()}</p>

      <h2>{m.legal_cgu_law_heading()}</h2>
      <p>{m.legal_cgu_law_body()}</p>
    </LegalPage>
  );
}
