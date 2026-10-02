import Link from "next/link";
import { AllocateGrantForm } from "@/app/ui/forms";
import { getDb } from "@/lib/db";
import { listGrants, listUsers } from "@/lib/ledger";
import { formatPaise } from "@/lib/money";
import { getCurrentUser } from "@/lib/session";

export default async function GrantsPage() {
  const db = getDb();
  const user = await getCurrentUser();
  const grants = listGrants(db);

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold">Grants</h1>
        <p className="text-sm text-muted">Sanctioned budgets and what remains of each.</p>
      </div>

      <div className="card overflow-x-auto p-0">
        {grants.length === 0 ? (
          <p className="p-5 text-sm text-muted">
            No grants yet.
            {user.role === "DEAN" ? " Allocate one below." : " The Dean allocates grants."}
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Grant</th>
                <th>Principal investigator</th>
                <th className="text-right">Sanctioned</th>
                <th className="text-right">Spent</th>
                <th className="text-right">Remaining</th>
                <th>Awaiting Dean</th>
              </tr>
            </thead>
            <tbody>
              {grants.map((g) => (
                <tr key={g.id}>
                  <td>
                    <Link href={`/grants/${g.id}`} className="font-medium text-accent hover:underline">
                      {g.id}
                    </Link>
                    <div className="text-muted">{g.title}</div>
                  </td>
                  <td>{g.piName}</td>
                  <td className="text-right tabular-nums">{formatPaise(g.sanctionedPaise)}</td>
                  <td className="text-right tabular-nums">{formatPaise(g.spentPaise)}</td>
                  <td className={`text-right font-medium tabular-nums ${g.remainingPaise < 0 ? "text-bad" : ""}`}>
                    {formatPaise(g.remainingPaise)}
                  </td>
                  <td>
                    {g.pendingCount > 0 ? (
                      <span className="badge badge-PENDING">
                        {g.pendingCount} · {formatPaise(g.pendingPaise)}
                      </span>
                    ) : (
                      <span className="text-muted">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {user.role === "DEAN" && (
        <AllocateGrantForm faculty={listUsers(db).filter((u) => u.role === "FACULTY")} />
      )}
    </>
  );
}
