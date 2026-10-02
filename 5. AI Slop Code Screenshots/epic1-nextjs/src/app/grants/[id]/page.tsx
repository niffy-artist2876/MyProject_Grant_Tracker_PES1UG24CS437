import Link from "next/link";
import { notFound } from "next/navigation";
import { LogExpenseForm } from "@/app/ui/forms";
import { getDb } from "@/lib/db";
import { getGrant, listExpenses } from "@/lib/ledger";
import { formatPaise } from "@/lib/money";
import { getCurrentUser } from "@/lib/session";

export default async function GrantPage(props: PageProps<"/grants/[id]">) {
  const { id } = await props.params;
  const db = getDb();
  const grant = getGrant(db, decodeURIComponent(id));
  if (!grant) notFound();
  const user = await getCurrentUser();
  const expenses = listExpenses(db, grant.id);
  const spentShare = Math.min(grant.spentPaise / grant.sanctionedPaise, 1);
  const overdrawn = grant.remainingPaise < 0;

  return (
    <>
      <div>
        <Link href="/" className="text-sm text-muted hover:text-accent">← All grants</Link>
        <h1 className="mt-1 text-2xl font-semibold">{grant.id}: {grant.title}</h1>
        <p className="text-sm text-muted">Principal investigator: {grant.piName}</p>
      </div>

      <section className="card space-y-4" aria-label="Balance">
        <dl className="grid gap-4 sm:grid-cols-4">
          <Stat label="Sanctioned" value={formatPaise(grant.sanctionedPaise)} />
          <Stat label="Spent" value={formatPaise(grant.spentPaise)} />
          <Stat
            label="Remaining balance"
            value={formatPaise(grant.remainingPaise)}
            tone={overdrawn ? "text-bad" : undefined}
          />
          <Stat
            label="Awaiting Dean"
            value={`${formatPaise(grant.pendingPaise)} (${grant.pendingCount})`}
            tone={grant.pendingCount > 0 ? "text-warn" : undefined}
          />
        </dl>
        <div
          className="h-2 overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-label="Share of budget spent"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(spentShare * 100)}
        >
          <div
            className={`h-full ${overdrawn ? "bg-bad" : "bg-accent"}`}
            style={{ width: `${spentShare * 100}%` }}
          />
        </div>
        {overdrawn && (
          <p className="text-sm text-bad">
            Overdrawn through a Dean override. New expenses will be held for review.
          </p>
        )}
      </section>

      {user.role === "FACULTY" && <LogExpenseForm grantId={grant.id} />}

      <section className="card overflow-x-auto p-0">
        <h2 className="px-5 pt-5 pb-2 text-lg font-semibold">Expenses</h2>
        {expenses.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-muted">No expenses logged yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Logged by</th>
                <th className="text-right">Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td className="text-muted tabular-nums">{e.id}</td>
                  <td>{e.description}</td>
                  <td>{e.loggedByName}</td>
                  <td className="text-right tabular-nums">{formatPaise(e.amountPaise)}</td>
                  <td>
                    <span className={`badge badge-${e.status}`}>{e.status}</span>
                    {e.isOverdraft && e.decidedByName && (
                      <div className="mt-1 text-xs text-muted">Overdraft, decided by {e.decidedByName}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className={`text-lg font-semibold tabular-nums ${tone ?? ""}`}>{value}</dd>
    </div>
  );
}
