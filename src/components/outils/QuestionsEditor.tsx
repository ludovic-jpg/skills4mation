import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  QUESTION_VIDE,
  TYPES_QUESTION,
  deplacer,
  type QuestionOutil,
  type TypeQuestion,
} from "@/lib/outils";

/** Éditeur simple de questions : modification, réordonnancement, ajout et suppression. */
export function QuestionsEditor({
  questions,
  onChange,
}: {
  questions: QuestionOutil[];
  onChange: (questions: QuestionOutil[]) => void;
}) {
  function maj(index: number, patch: Partial<QuestionOutil>) {
    onChange(questions.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  return (
    <div className="grid gap-3">
      {questions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucune question pour le moment : générez-les depuis un parcours ou créez-les de toutes
          pièces.
        </p>
      ) : null}
      {questions.map((q, index) => (
        <div key={index} className="grid gap-2 rounded-xl border border-border p-4">
          <div className="flex items-start gap-2">
            <span className="mt-2 text-xs font-semibold text-muted-foreground">{index + 1}.</span>
            <Textarea
              value={q.enonce}
              rows={2}
              onChange={(e) => maj(index, { enonce: e.target.value })}
              placeholder="Énoncé de la question"
            />
            <div className="grid gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Monter la question"
                onClick={() => onChange(deplacer(questions, index, -1))}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Descendre la question"
                onClick={() => onChange(deplacer(questions, index, 1))}
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Supprimer la question"
                onClick={() => onChange(questions.filter((_, i) => i !== index))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-[220px_1fr]">
            <div className="grid gap-1.5">
              <Label>Type de question</Label>
              <Select
                value={q.type}
                onValueChange={(type) =>
                  maj(index, {
                    type: type as TypeQuestion,
                    options: type === "qcm" ? q.options : [],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_QUESTION.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {q.type === "qcm" ? (
              <div className="grid gap-1.5">
                <Label>Propositions (séparées par « ; »)</Label>
                <Input
                  value={q.options.join(" ; ")}
                  onChange={(e) =>
                    maj(index, {
                      options: e.target.value
                        .split(";")
                        .map((o) => o.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            ) : null}
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="justify-self-start"
        onClick={() => onChange([...questions, { ...QUESTION_VIDE }])}
      >
        <Plus className="mr-2 size-4" /> Ajouter une question
      </Button>
    </div>
  );
}
