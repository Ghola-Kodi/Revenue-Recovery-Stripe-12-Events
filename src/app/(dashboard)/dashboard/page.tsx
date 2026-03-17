// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

type SignalResponse = {
  authorizationRate: number;
  paymentFailureRate: number;
  recoveryRate: number;
  disputeRate: number;
  dunningExitCompliance: number;
  paymentMethodDistribution: Record<string, number>;
  healthScore: number;
};

export default function DashboardPage() {
  const { user, isLoading } = useAuthStore();
  const [signals, setSignals] = useState<SignalResponse | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadSignals = async () => {
      const res = await fetch("/api/signals");
      if (!res.ok) return;
      const data = await res.json();
      setSignals(data);
    };
    void loadSignals();
  }, []);

  if (isLoading) return <div>Loading…</div>;
  if (!user) return <div>You are not logged in.</div>;

  const healthScore = signals?.healthScore ?? 0;
  const healthColor =
    healthScore >= 80 ? "text-emerald-400 border-emerald-500/40" :
    healthScore >= 60 ? "text-amber-300 border-amber-400/40" :
    "text-red-400 border-red-500/40";

  const healthLabel =
    healthScore >= 80 ? "Healthy" :
    healthScore >= 60 ? "Needs attention" :
    "At risk";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Stripe Billing Health</h1>
          <p className="text-sm text-slate-400">
            A founder-friendly view: one score, three headline metrics, and critical actions.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-300">
          <div>Signed in as <span className="font-medium text-slate-100">{user.email}</span></div>
          <div className="mt-1 text-slate-500">
            This demo runs on synthetic data similar to a typical first audit.
          </div>
        </div>
      </div>

      {/* Row 1: Health + 3 key metrics */}
      <section className="grid gap-4 md:grid-cols-4">
        {/* Health score */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Overall health score</div>
              <div className={`mt-2 inline-flex items-baseline gap-2 rounded-full border px-3 py-1 ${healthColor}`}>
                <span className="text-3xl font-bold">{healthScore}</span>
                <span className="text-[11px] uppercase tracking-wide">{healthLabel}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="rounded border border-slate-700 px-3 py-1 text-[11px] text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
            >
              {showDetails ? "Hide full breakdown" : "View full breakdown"}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-300">
            Score is weighted by recovery, authorization, disputes, and whether your dunning engine exits correctly.
          </p>
        </div>

        {/* Key metrics: auth, recovery, disputes */}
        <KeyMetricCard
          label="Authorization rate"
          value={signals?.authorizationRate}
          unit="%"
          good={valueAbove(signals?.authorizationRate, 95)}
          warning={valueBetween(signals?.authorizationRate, 90, 95)}
          description="Succeeded payments ÷ all attempts."
        />
        <KeyMetricCard
          label="Recovery rate"
          value={signals?.recoveryRate}
          unit="%"
          good={valueAbove(signals?.recoveryRate, 35)}
          warning={valueBetween(signals?.recoveryRate, 20, 35)}
          description="Failures that eventually recover."
        />
        <KeyMetricCard
          label="Dispute rate"
          value={signals?.disputeRate}
          unit="%"
          invert
          good={valueBelow(signals?.disputeRate, 0.5)}
          warning={valueBetween(signals?.disputeRate, 0.5, 1, true)}
          description="Disputes ÷ successful charges."
        />
      </section>

      {/* Row 2: Dunning card + Action Center */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <DunningSummary signals={signals} />
        </div>
        <ActionCenter signals={signals} />
      </section>

      {/* Row 3: collapsible detailed grid */}
      {showDetails && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">Full signal breakdown</h2>
            <p className="text-xs text-slate-500">
              Use this view when you want to dig into why the score looks the way it does.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <SignalCard
              label="Authorization rate"
              value={signals?.authorizationRate}
              unit="%"
              good={valueAbove(signals?.authorizationRate, 95)}
              warning={valueBetween(signals?.authorizationRate, 90, 95)}
              description="Aim for 95%+. Below that, check 3DS and card expiry coverage."
              action="Verify invoice.payment_action_required + invoice.upcoming handlers."
            />
            <SignalCard
              label="Payment failure rate"
              value={signals?.paymentFailureRate}
              unit="%"
              good={valueBelow(signals?.paymentFailureRate, 5)}
              warning={valueBetween(signals?.paymentFailureRate, 5, 10, true)}
              description="Keep below 5%. Above 10% needs investigation."
              action="Inspect decline codes & retry timing."
            />
            <SignalCard
              label="Recovery rate"
              value={signals?.recoveryRate}
              unit="%"
              good={valueAbove(signals?.recoveryRate, 35)}
              warning={valueBetween(signals?.recoveryRate, 20, 35)}
              description="Most SaaS stacks sit around 8% by default."
              action="Wire decline-based dunning sequences."
            />
            <SignalCard
              label="Dispute rate"
              value={signals?.disputeRate}
              unit="%"
              good={valueBelow(signals?.disputeRate, 0.5)}
              warning={valueBetween(signals?.disputeRate, 0.5, 1, true)}
              description="Above 1% puts the account in a risk zone."
              action="Alert on charge.dispute.created instantly."
            />
            <SignalCard
              label="Dunning exit compliance"
              value={signals?.dunningExitCompliance}
              unit="%"
              good={valueAbove(signals?.dunningExitCompliance, 95)}
              warning={valueBetween(signals?.dunningExitCompliance, 80, 95)}
              description="Recovered customers should never see a Day 7 email."
              action="Confirm invoice.payment_succeeded suppresses all flows."
            />
            <SignalCard
              label="Payment methods"
              value={signals ? signals.paymentMethodDistribution.card ?? 0 : undefined}
              unit="% cards"
              neutral
              description="Card-heavy revenue needs strong expiry + retry handling."
              action="Add proactive expiry emails via invoice.upcoming."
            />
          </div>
        </section>
      )}
    </div>
  );
}

/* Helpers */

function valueAbove(v: number | undefined, threshold: number) {
  return v != null && v >= threshold;
}
function valueBelow(v: number | undefined, threshold: number) {
  return v != null && v <= threshold;
}
function valueBetween(
  v: number | undefined,
  low: number,
  high: number,
  inclusiveHigh = false
) {
  if (v == null) return false;
  return inclusiveHigh ? v >= low && v <= high : v >= low && v < high;
}

/* Components */

type KeyMetricCardProps = {
  label: string;
  value?: number;
  unit?: string;
  invert?: boolean;
  good?: boolean;
  warning?: boolean;
  description: string;
};

function KeyMetricCard({
  label,
  value,
  unit,
  invert,
  good,
  warning,
  description,
}: KeyMetricCardProps) {
  const hasValue = value != null;

  let dot = "bg-slate-500";
  if (hasValue) {
    if (good) dot = invert ? "bg-emerald-400" : "bg-emerald-400";
    else if (warning) dot = "bg-amber-400";
    else dot = "bg-red-400";
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
        <span className={`h-2 w-2 rounded-full ${dot}`} />
      </div>
      <div className="mt-1 text-2xl font-semibold text-slate-50">
        {hasValue ? (
          <>
            {value!.toFixed(1)}
            {unit && <span className="ml-1 text-xs text-slate-400">{unit}</span>}
          </>
        ) : (
          <span className="text-slate-500">–</span>
        )}
      </div>
      <p className="mt-1 text-[11px] text-slate-400">{description}</p>
    </div>
  );
}

type SignalCardProps = {
  label: string;
  value?: number;
  unit?: string;
  good?: boolean;
  warning?: boolean;
  neutral?: boolean;
  description: string;
  action: string;
};

function SignalCard({
  label,
  value,
  unit,
  good,
  warning,
  neutral,
  description,
  action,
}: SignalCardProps) {
  const hasValue = value != null;
  let border = "border-slate-800";
  let accent = "text-slate-100";
  let chipBg = "bg-slate-800 text-slate-300";

  if (!neutral && hasValue) {
    if (good) {
      border = "border-emerald-500/40";
      accent = "text-emerald-300";
      chipBg = "bg-emerald-500/10 text-emerald-300";
    } else if (warning) {
      border = "border-amber-400/40";
      accent = "text-amber-300";
      chipBg = "bg-amber-500/10 text-amber-200";
    } else {
      border = "border-red-500/40";
      accent = "text-red-300";
      chipBg = "bg-red-500/10 text-red-200";
    }
  }

  return (
    <div className={`flex flex-col justify-between rounded-lg border bg-slate-900 p-3 ${border}`}>
      <div>
        <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
        <div className={`mt-1 text-2xl font-semibold ${accent}`}>
          {hasValue ? (
            <>
              {value!.toFixed(1)}
              {unit && <span className="ml-1 text-xs text-slate-400">{unit}</span>}
            </>
          ) : (
            <span className="text-slate-500">–</span>
          )}
        </div>
        <p className="mt-1 text-[11px] text-slate-400">{description}</p>
      </div>
      <div className="mt-2 text-[11px]">
        <span className={`inline-flex rounded-full px-2 py-1 ${chipBg}`}>
          Next action: {action}
        </span>
      </div>
    </div>
  );
}

function DunningSummary({ signals }: { signals: SignalResponse | null }) {
  const recoveryRate = signals?.recoveryRate ?? 0;
  const exitCompliance = signals?.dunningExitCompliance ?? 0;

  const recoveryColor =
    recoveryRate >= 35 ? "text-emerald-300" :
    recoveryRate >= 20 ? "text-amber-300" :
    "text-red-300";

  const exitColor =
    exitCompliance >= 95 ? "text-emerald-300" :
    exitCompliance >= 80 ? "text-amber-300" :
    "text-red-300";

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">Dunning engine overview</h2>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
          Decline-aware
        </span>
      </div>
      <p className="text-xs text-slate-400">
        We look at two things: how many failed payments you recover, and how reliably you stop
        dunning once a payment goes through.
      </p>
      <div className="grid gap-3 text-xs md:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">
            Recovery from dunning
          </div>
          <div className={`mt-1 text-2xl font-semibold ${recoveryColor}`}>
            {recoveryRate.toFixed(1)}%
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Below 20% means your current emails and retry logic are leaving money on the table.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">
            Exit on success
          </div>
          <div className={`mt-1 text-2xl font-semibold ${exitColor}`}>
            {exitCompliance.toFixed(1)}%
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Recovered customers should not receive final-warning emails. Each one is avoidable churn.
          </p>
        </div>
      </div>
      <p className="text-[11px] text-slate-500">
        In the full implementation, this panel is driven by real failure and recovery events from Stripe.
      </p>
    </div>
  );
}

function ActionCenter({ signals }: { signals: SignalResponse | null }) {
  const disputeRate = signals?.disputeRate ?? 0;
  const recoveryRate = signals?.recoveryRate ?? 0;
  const exitCompliance = signals?.dunningExitCompliance ?? 0;

  const items: { label: string; severity: "critical" | "warning"; body: string; action: string }[] = [];

  // Sensitive: disputes too high
  if (disputeRate >= 1) {
    items.push({
      label: "Dispute risk",
      severity: "critical",
      body: "Your dispute rate is at or above 1%. This puts your Stripe account in a risk zone.",
      action: "Turn on charge.dispute.created alerts and respond within 7 days."
    });
  }

  // Sensitive: very low recovery
  if (recoveryRate < 20) {
    items.push({
      label: "Revenue leakage",
      severity: "warning",
      body: "Most failed payments are not recovering. You’re closer to the default 8% than the 35–45% target.",
      action: "Group decline codes and build separate dunning flows for soft/hard/expiry/no-card."
    });
  }

  // Sensitive: bad exit compliance
  if (exitCompliance < 90) {
    items.push({
      label: "Dunning misfires",
      severity: "critical",
      body: "Some recovered customers are still inside dunning sequences and may receive final-warning emails.",
      action: "Make invoice.payment_succeeded the single exit gate for all dunning flows."
    });
  }

  // Demo-only findings if no items (so the panel isn’t empty in synthetic mode)
  if (items.length === 0) {
    items.push({
      label: "You’re in good shape",
      severity: "warning",
      body: "No critical issues detected in the synthetic dataset, but most real Stripe accounts do show gaps.",
      action: "Connect a test Stripe account in V2 to see real findings for your workspace."
    });
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="text-sm font-semibold text-slate-100">Action Center</h2>
      <p className="mt-1 text-xs text-slate-400">
        Only the sensitive items show up here: disputes, legal exposure, and big revenue leaks.
      </p>
      <ul className="mt-3 space-y-3 text-xs">
        {items.map((item, i) => {
          const dot =
            item.severity === "critical" ? "bg-red-500" : "bg-amber-400";
          return (
            <li
              key={i}
              className="rounded border border-slate-800 bg-slate-950 p-3"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-200">
                  {item.label}
                </span>
              </div>
              <p className="text-slate-300">{item.body}</p>
              <p className="mt-1 text-[11px] text-emerald-300">
                Next action: {item.action}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
