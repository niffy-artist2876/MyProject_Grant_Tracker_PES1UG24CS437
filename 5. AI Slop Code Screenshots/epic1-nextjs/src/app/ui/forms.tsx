"use client";

import { useActionState } from "react";
import {
  allocateGrantAction,
  decideOverdraftAction,
  logExpenseAction,
  type ActionState,
} from "@/app/actions";

const TONE_CLASS = { ok: "text-ok", warn: "text-warn", error: "text-bad" } as const;

function Message({ state }: { state: ActionState }) {
  if (!state) return null;
  return (
    <p
      role={state.tone === "ok" ? "status" : "alert"}
      className={`text-sm font-medium ${TONE_CLASS[state.tone]}`}
    >
      {state.message}
    </p>
  );
}

export function AllocateGrantForm({ faculty }: { faculty: { id: number; name: string }[] }) {
  const [state, action, pending] = useActionState(allocateGrantAction, null);
  return (
    <form action={action} className="card space-y-4">
      <h2 className="text-lg font-semibold">Allocate a grant</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="id">Grant ID</label>
          <input className="input" id="id" name="id" placeholder="G-2026-001" required />
        </div>
        <div>
          <label className="label" htmlFor="amount">Sanctioned amount (₹)</label>
          <input className="input" id="amount" name="amount" inputMode="decimal" placeholder="10,00,000" required />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="title">Title</label>
          <input className="input" id="title" name="title" required />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="piId">Principal investigator</label>
          <select className="input" id="piId" name="piId" required>
            {faculty.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="btn" disabled={pending}>{pending ? "Allocating…" : "Allocate grant"}</button>
        <Message state={state} />
      </div>
    </form>
  );
}

export function LogExpenseForm({ grantId }: { grantId: string }) {
  const [state, action, pending] = useActionState(logExpenseAction.bind(null, grantId), null);
  return (
    <form action={action} className="card space-y-4">
      <h2 className="text-lg font-semibold">Log an expense</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="description">Item / description</label>
          <input className="input" id="description" name="description" placeholder="Oscilloscope" required />
        </div>
        <div>
          <label className="label" htmlFor="amount">Amount (₹)</label>
          <input className="input" id="amount" name="amount" inputMode="decimal" placeholder="25,000.50" required />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button className="btn" disabled={pending}>{pending ? "Logging…" : "Log expense"}</button>
        <Message state={state} />
      </div>
    </form>
  );
}

export function DecisionForm({ expenseId }: { expenseId: number }) {
  const [state, action, pending] = useActionState(
    decideOverdraftAction.bind(null, expenseId),
    null,
  );
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <button className="btn" name="decision" value="APPROVE" disabled={pending}>Approve override</button>
      <button className="btn-secondary" name="decision" value="REJECT" disabled={pending}>Reject</button>
      <Message state={state} />
    </form>
  );
}
