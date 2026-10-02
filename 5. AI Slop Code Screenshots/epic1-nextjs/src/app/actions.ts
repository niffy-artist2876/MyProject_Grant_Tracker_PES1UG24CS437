"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import {
  LedgerError,
  createGrant,
  decideOverdraft,
  describeResult,
  getUser,
  logExpense,
} from "@/lib/ledger";
import { parseAmountToPaise } from "@/lib/money";
import { USER_COOKIE, getCurrentUser } from "@/lib/session";

export type ActionState = { tone: "ok" | "warn" | "error"; message: string } | null;

// Runs a mutation, turning rule violations into a message for the form.
// Anything else is a real bug and is rethrown.
function run(mutation: () => string | NonNullable<ActionState>): ActionState {
  try {
    const result = mutation();
    revalidatePath("/", "layout");
    return typeof result === "string" ? { tone: "ok", message: result } : result;
  } catch (error) {
    if (error instanceof LedgerError) return { tone: "error", message: error.message };
    throw error;
  }
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function allocateGrantAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await getCurrentUser();
  const sanctionedPaise = parseAmountToPaise(text(formData, "amount"));
  if (sanctionedPaise === null) {
    return { tone: "error", message: "Enter a sanctioned amount greater than zero." };
  }
  return run(() => {
    createGrant(getDb(), actor, {
      id: text(formData, "id"),
      title: text(formData, "title"),
      piId: Number(text(formData, "piId")),
      sanctionedPaise,
    });
    return `Grant ${text(formData, "id").trim().toUpperCase()} allocated.`;
  });
}

export async function logExpenseAction(
  grantId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await getCurrentUser();
  const amountPaise = parseAmountToPaise(text(formData, "amount"));
  if (amountPaise === null) {
    return { tone: "error", message: "Enter an amount greater than zero, e.g. 25000 or 25,000.50." };
  }
  return run(() => {
    const result = logExpense(getDb(), actor, {
      grantId,
      description: text(formData, "description"),
      amountPaise,
    });
    return {
      tone: result.status === "APPROVED" ? "ok" : "warn",
      message: describeResult(result),
    };
  });
}

export async function decideOverdraftAction(
  expenseId: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await getCurrentUser();
  const decision = text(formData, "decision");
  if (decision !== "APPROVE" && decision !== "REJECT") {
    return { tone: "error", message: "Unknown decision." };
  }
  return run(() => {
    decideOverdraft(getDb(), actor, expenseId, decision);
    return decision === "APPROVE" ? "Override approved." : "Expense rejected.";
  });
}

// Placeholder until authentication: switch which seeded user you act as.
export async function switchUserAction(formData: FormData): Promise<void> {
  const user = getUser(getDb(), Number(text(formData, "userId")));
  if (!user) return;
  (await cookies()).set(USER_COOKIE, String(user.id), { httpOnly: true, sameSite: "lax" });
  revalidatePath("/", "layout");
}
