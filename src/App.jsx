import React, { useState } from "react";

const WEBHOOK_URL = "https://hudsonsawyer.app.n8n.cloud/webhook/signup";

export default function App() {
  const [form, setForm] = useState({ company: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ type: "", msg: "" });
  const [result, setResult] = useState(null);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setToast({ type: "", msg: "" });

    if (!form.email || !form.email.includes("@") || !form.email.includes(".")) {
      setToast({ type: "error", msg: "Please enter a valid email address" });
      return;
    }
    if ((form.email.includes("..")) || form.email.startsWith(".") || form.email.endsWith(".")) {
      setToast({ type: "error", msg: "Please enter a valid email address" });
      return;
    }
    if (!form.company || form.company.trim().length < 2) {
      setToast({ type: "error", msg: "Please enter your company name" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          company: form.company.trim(),
          phone: form.phone.trim(),
        }),
        mode: "cors",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data?.message || "Signup failed. Please try again.");
      }
      setResult(data);
      setToast({ type: "success", msg: data.message || "Welcome to PermitPulse!" });
    } catch (err) {
      setToast({ type: "error", msg: err.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-600" />
            <span className="font-semibold tracking-tight text-lg">PermitPulse</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
            <a href="#signup" className="inline-flex items-center rounded-xl border border-slate-300 px-3 py-1.5 hover:bg-slate-50">Start Free Trial</a>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full mb-4">
              New permits → daily at 7 AM
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Be first to every roofing job
            </h1>
            <p className="mt-4 text-slate-600 text-lg">
              We scan Hartford & West Hartford permits every morning and send the ones that match your business. Quick, clean, and actionable.
            </p>
            <ul className="mt-6 space-y-2 text-slate-700">
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-blue-600"/>Daily email digest with fresh permits</li>
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-blue-600"/>Keyword filters for roofs, shingles, gutters</li>
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-blue-600"/>One-click to track & follow up</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#signup" className="inline-flex items-center rounded-2xl bg-blue-600 text-white px-5 py-3 font-medium shadow-sm hover:shadow-md active:scale-[.99]">Start 7‑day free trial</a>
              <a href="#pricing" className="inline-flex items-center rounded-2xl border border-slate-300 px-5 py-3 font-medium hover:bg-slate-50">See pricing</a>
            </div>
            <p className="mt-3 text-xs text-slate-500">No credit card required to start. Cancel anytime.</p>
          </div>
          <div className="relative">
            <div className="rounded-3xl border border-slate-200 shadow-sm p-6 bg-white">
              <FormCard form={form} onChange={onChange} onSubmit={onSubmit} loading={loading} toast={toast} result={result} />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-slate-200 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-6">
          <Feature icon="📬" title="Morning digests" desc="Your first digest lands at 7 AM tomorrow—no setup required." />
          <Feature icon="🎯" title="Smart filters" desc="Include: roofing, shingles, gutters. Exclude what you don't want." />
          <Feature icon="⚡" title="Instant signup" desc="Enter company, email, phone. You're in—lead flow starts." />
        </div>
      </section>

      <section id="pricing">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight">Simple pricing</h2>
          <p className="text-slate-600 mt-2">Start free. Then just $49/month—cancel anytime.</p>
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-slate-200 p-6 bg-white shadow-sm">
              <h3 className="text-xl font-semibold">Trial</h3>
              <p className="text-slate-600 mt-1">7 days free</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>✓ Daily permit emails (Hartford + West Hartford)</li>
                <li>✓ Basic keyword filters</li>
                <li>✓ Email support</li>
              </ul>
              <a href="#signup" className="mt-6 inline-flex items-center rounded-2xl bg-blue-600 text-white px-5 py-3 font-medium shadow-sm hover:shadow-md">Start free trial</a>
            </div>
            <div className="rounded-3xl border-2 border-blue-600 p-6 bg-white shadow-sm">
              <h3 className="text-xl font-semibold">Core</h3>
              <p className="text-slate-600 mt-1">$49/month</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>✓ Everything in Trial</li>
                <li>✓ Advanced filters & towns</li>
                <li>✓ Priority support</li>
              </ul>
              <a href="#signup" className="mt-6 inline-flex items-center rounded-2xl bg-blue-600 text-white px-5 py-3 font-medium shadow-sm hover:shadow-md">Subscribe</a>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight">FAQ</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <Faq q="When will I get my first permits?" a="Tomorrow at 7 AM Eastern. We email you a clean list with links and key details." />
            <Faq q="Which towns are included?" a="Hartford and West Hartford to start. More as we expand." />
            <Faq q="Can I cancel anytime?" a="Yes. Trial is free for 7 days; then $49/month unless you cancel." />
            <Faq q="Do I need a credit card for the trial?" a="Nope. Email + company + phone is all you need to start." />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} PermitPulse. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-700">Terms</a>
            <a href="#" className="hover:text-slate-700">Privacy</a>
            <a href="mailto:hello@permitpulse.com" className="hover:text-slate-700">Contact</a>
          </div>
        </div>
      </footer>

      {toast.msg && (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-lg ${toast.type === "error" ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function FormCard({ form, onChange, onSubmit, loading, toast, result }) {
  return (
    <form id="signup" onSubmit={onSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold">Start your 7‑day free trial</h3>
      <p className="text-slate-600 text-sm">No credit card required.</p>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-sm font-medium">Company</label>
          <input
            name="company"
            value={form.company}
            onChange={onChange}
            placeholder="e.g., AOK Roofing"
            className="mt-1 w-full rounded-2xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-blue-100"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Work Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@company.com"
            className="mt-1 w-full rounded-2xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-blue-100"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="(555) 555-5555"
            className="mt-1 w-full rounded-2xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center rounded-2xl bg-blue-600 text-white px-5 py-3 font-medium shadow-sm hover:shadow-md disabled:opacity-60"
      >
        {loading ? "Signing you up…" : "Start free trial"}
      </button>
      {result?.customer_id && (
        <div className="text-xs text-slate-500">
          Customer ID: <span className="font-mono">{result.customer_id}</span>
        </div>
      )}
      <p className="text-xs text-slate-500">By continuing, you agree to our Terms and Privacy Policy.</p>
    </form>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-2 font-semibold">{title}</h3>
      <p className="text-slate-600 text-sm mt-1">{desc}</p>
    </div>
  );
}

function Faq({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <button onClick={() => setOpen((v) => !v)} className="w-full text-left font-medium flex items-center justify-between">
        {q}
        <span className="text-slate-400">{open ? "–" : "+"}</span>
      </button>
      {open && <p className="mt-3 text-slate-600 text-sm">{a}</p>}
    </div>
  );
}
