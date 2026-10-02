import Link from "next/link";
import { DecisionForm } from "@/app/ui/forms";
import { getDb } from "@/lib/db";
import { getGrant, listPendingOverdrafts } from "@/lib/ledger";
import { formatPaise } from "@/lib/money";
import { getCurrentUser } from "@/lib/session";

export default async function OverdraftsPage() {
  const user = await getCurrentUser();
  if (user.role !== "DEAN") {
    return (
      <div className="card">
        <h1 className="text-lg font-semibold">Overdraft review</h1>
        <p className="text-sm text-muted">Only the Dean can review blocked overdrafts.</p>
      </div>
    );
  }

  const db = getDb();
  const pending = listPendingOverdrafts(db);

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold">Overdraft review</h1>
        <p className="text-sm text-muted">
          Expenses blocked because they exceed their grant&apos;s remaining balance.
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="card text-sm text-muted">No blocked overdrafts.</div>
      ) : (
        <ul className="space-y-4">
          {pending.map((e) => {
            const grant = getGrant(db, e.grantId)!;
            const after = grant.remainingPaise - e.amountPaise;
            return (
              <li key={e.id} className="card space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="font-semibold">{e.description}</span>
                    <span className="text-muted"> · {e.loggedByName} · </span>
                    <Link href={`/grants/${e.grantId}`} className="text-accent hover:underline">
                      {e.grantId}
                    </Link>
                  </div>
                  <span className="text-lg font-semibold tabular-nums">{formatPaise(e.amountPaise)}</span>
                </div>
                <p className="text-sm text-muted">
                  Remaining now {formatPaise(grant.remainingPaise)}; approving leaves{" "}
                  <span className="font-medium text-bad">{formatPaise(after)}</span>.
                </p>
                <DecisionForm expenseId={e.id} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
