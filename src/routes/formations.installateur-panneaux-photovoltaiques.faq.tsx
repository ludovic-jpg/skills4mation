import { createFileRoute } from "@tanstack/react-router";

import { PublicLayout } from "@/components/site/PublicLayout";
import {
  CtaInformationPv,
  EntetePagePv,
  LiensParcoursPv,
  MentionsPv,
  StatutOuverturePv,
} from "@/components/site/PhotovoltaiqueBlocs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { enTetePv, FAQ_PV, META_PV } from "@/data/formation-photovoltaique";

export const Route = createFileRoute("/formations/installateur-panneaux-photovoltaiques/faq")({
  head: () => enTetePv(META_PV.faq, ["faq"]),
  component: PageFaq,
});

function PageFaq() {
  return (
    <PublicLayout>
      <EntetePagePv
        meta={META_PV.faq}
        eyebrow="Formation installateur photovoltaïque"
        titre="Questions fréquentes sur la formation installateur de panneaux photovoltaïques"
        introduction="Durée, prérequis, évaluation, financement, habilitation : les réponses aux questions que l'on nous pose le plus souvent."
      />

      <section className="section-shell py-10">
        <StatutOuverturePv />
      </section>

      <section className="section-shell pb-14">
        <Accordion type="single" collapsible className="max-w-3xl">
          {FAQ_PV.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left text-base font-semibold">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <LiensParcoursPv courante="/formations/installateur-panneaux-photovoltaiques/faq" />
      <CtaInformationPv />
      <MentionsPv />
    </PublicLayout>
  );
}
