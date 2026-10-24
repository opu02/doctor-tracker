"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Activity, BarChart3, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin, useMe } from "@/hooks/use-auth";
import { zodResolver } from "@/lib/zodResolver";

const schema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

const DEMO = { email: "admin@doctortracker.com", password: "Admin@12345" };

function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const me = useMe();
  const login = useLogin();
  const [slow, setSlow] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver<FormValues>(schema), defaultValues: { email: "", password: "" } });

  // Already signed in? Skip the form.
  useEffect(() => {
    if (me.data) router.replace(next);
  }, [me.data, next, router]);

  // The free hosting tier sleeps when idle; tell the user why the first login can take a while.
  useEffect(() => {
    if (!login.isPending) {
      setSlow(false);
      return;
    }
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, [login.isPending]);

  const onSubmit = handleSubmit((values) => login.mutate(values, { onSuccess: () => router.replace(next) }));

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {login.isError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
          {login.error.message}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />

      <Button type="submit" size="lg" className="w-full" loading={login.isPending}>
        {login.isPending ? (slow ? "Waking up the server…" : "Signing in…") : "Sign in"}
      </Button>

      {slow && (
        <p className="text-center text-xs text-slate-500">
          The server runs on a free plan and sleeps when idle. The first request can take up to a minute.
        </p>
      )}

      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3.5 text-xs text-slate-600">
        <p className="font-medium text-slate-700">Demo admin account</p>
        <p className="mt-1 font-mono">
          {DEMO.email} / {DEMO.password}
        </p>
        <button
          type="button"
          className="mt-2 font-medium text-brand-700 hover:underline"
          onClick={() => {
            setValue("email", DEMO.email);
            setValue("password", DEMO.password);
          }}
        >
          Fill demo credentials
        </button>
      </div>
    </form>
  );
}

const FEATURES = [
  { icon: Users, text: "Manage doctors and their patients in one place" },
  { icon: BarChart3, text: "Live analytics with clear, chart-ready insights" },
  { icon: ShieldCheck, text: "Secure, cookie-based admin authentication" },
];

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2.5 text-lg font-semibold">
          <span className="grid size-9 place-items-center rounded-lg bg-white/15">
            <Activity className="size-5" aria-hidden />
          </span>
          Doctor Tracker
        </div>
        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight">Every doctor. Every patient. One clear view.</h1>
          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-brand-50/90">
                <span className="grid size-8 place-items-center rounded-md bg-white/10">
                  <Icon className="size-4" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-brand-100/70">Administrative portal</p>
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand-400/20 blur-3xl" />
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 text-lg font-semibold text-slate-900 lg:hidden">
            <span className="grid size-9 place-items-center rounded-lg bg-brand-600 text-white">
              <Activity className="size-5" aria-hidden />
            </span>
            Doctor Tracker
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
          <p className="mb-8 mt-1.5 text-sm text-slate-500">Sign in to access the admin portal.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
