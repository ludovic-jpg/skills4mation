import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StepProps } from "@/components/dossier/steps/types";

export function SessionsStep({ d, setD }: StepProps) {
  return (
    <div className="grid gap-3">
      <h3 className="text-sm font-semibold">Planning des sessions (20 maximum)</h3>
      {d.sessions.map((sess, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
          <Input
            type="date"
            value={sess.date}
            onChange={(e) =>
              setD({
                ...d,
                sessions: d.sessions.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)),
              })
            }
          />
          <Input
            type="time"
            value={sess.heureDebut}
            onChange={(e) =>
              setD({
                ...d,
                sessions: d.sessions.map((x, j) =>
                  j === i ? { ...x, heureDebut: e.target.value } : x,
                ),
              })
            }
          />
          <Input
            type="time"
            value={sess.heureFin}
            onChange={(e) =>
              setD({
                ...d,
                sessions: d.sessions.map((x, j) =>
                  j === i ? { ...x, heureFin: e.target.value } : x,
                ),
              })
            }
          />
          <Input
            placeholder="Module"
            value={sess.module ?? ""}
            onChange={(e) =>
              setD({
                ...d,
                sessions: d.sessions.map((x, j) => (j === i ? { ...x, module: e.target.value } : x)),
              })
            }
          />
          <Input
            placeholder="Lieu / connexion"
            value={sess.lieu ?? ""}
            onChange={(e) =>
              setD({
                ...d,
                sessions: d.sessions.map((x, j) => (j === i ? { ...x, lieu: e.target.value } : x)),
              })
            }
          />
          <Button
            variant="outline"
            onClick={() => setD({ ...d, sessions: d.sessions.filter((_, j) => j !== i) })}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        className="justify-self-start"
        disabled={d.sessions.length >= 20}
        onClick={() =>
          setD({
            ...d,
            sessions: [
              ...d.sessions,
              { date: "", heureDebut: "", heureFin: "", lieu: "", module: "" },
            ],
          })
        }
      >
        <Plus className="mr-1.5 size-4" /> Ajouter une session
      </Button>
    </div>
  );
}
