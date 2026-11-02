import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { loginSchema, registerSchema } from '@trippilot/shared';
import { useAuthMutations, useMe } from '../lib/queries';
import { fieldErrors } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Postcard } from '../components/Postcard';

/** Only allow same-site relative paths after sign-in (blocks //evil.com and /\evil.com). */
export function safeNext(next: string | null) {
  return next && /^\/(?![/\\])/.test(next) ? next : '/trips';
}

function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="container-page grid min-h-[calc(100dvh-4rem)] items-center gap-12 py-12 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-md">
        <h1 className="display text-4xl">{title}</h1>
        <p className="mt-2 text-muted">{subtitle}</p>
        <div className="card mt-8 p-6 sm:p-8">{children}</div>
        <p className="mt-6 text-center text-sm text-muted">{footer}</p>
      </div>
      <div className="relative hidden overflow-hidden rounded-[32px] lg:block" aria-hidden>
        <Postcard scene="mountain" palette={['#A8DADC', '#457B9D', '#1D3557']} alt="" className="h-[560px] w-full" />
        <div className="absolute inset-x-8 bottom-8 rounded-2xl bg-white/90 p-5 backdrop-blur">
          <div className="display text-xl">“Finally, a trip budget that includes the visa and the airport cab.”</div>
          <div className="mt-2 text-sm text-muted">Save plans, compare options and share with your travel group.</div>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const [sp] = useSearchParams();
  const next = safeNext(sp.get('next'));
  const { data: me } = useMe();
  const { login } = useAuthMutations();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (me) return <Navigate to={next} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) return setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path.join('.'), i.message])));
    setErrors({});
    login.mutate(parsed.data, { onSuccess: () => navigate(next, { replace: true }), onError: (err) => setErrors(fieldErrors(err)) });
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to see your saved trips." footer={<>New to TripPilot? <Link className="font-semibold text-pine-700 hover:underline" to={`/register?next=${encodeURIComponent(next)}`}>Create an account</Link></>}>
      <form onSubmit={submit} noValidate className="space-y-4">
        {login.isError && !Object.keys(errors).length && <p role="alert" className="rounded-xl bg-coral/10 px-3 py-2 text-sm text-coral">{(login.error as Error).message}</p>}
        <Field label="Email" htmlFor="email" error={errors.email}>
          <input id="email" type="email" autoComplete="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password}>
          <input id="password" type="password" autoComplete="current-password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <Button type="submit" className="w-full" loading={login.isPending}>Sign in</Button>
        {import.meta.env.DEV && <p className="text-center text-xs text-muted">Local demo: demo@trippilot.dev / TripPilot123</p>}
      </form>
    </AuthShell>
  );
}

export function RegisterPage() {
  const [sp] = useSearchParams();
  const next = safeNext(sp.get('next'));
  const { data: me } = useMe();
  const { register } = useAuthMutations();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', homeCity: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (me) return <Navigate to={next} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse({ ...form, homeCity: form.homeCity || undefined });
    if (!parsed.success) return setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path.join('.'), i.message])));
    setErrors({});
    register.mutate(parsed.data, { onSuccess: () => navigate(next, { replace: true }), onError: (err) => setErrors(fieldErrors(err)) });
  };

  return (
    <AuthShell title="Create your account" subtitle="Save trips, compare plans and get ready for group planning." footer={<>Already have an account? <Link className="font-semibold text-pine-700 hover:underline" to={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link></>}>
      <form onSubmit={submit} noValidate className="space-y-4">
        {register.isError && !Object.keys(errors).length && <p role="alert" className="rounded-xl bg-coral/10 px-3 py-2 text-sm text-coral">{(register.error as Error).message}</p>}
        <Field label="Full name" htmlFor="name" error={errors.name}>
          <input id="name" autoComplete="name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <input id="email" type="email" autoComplete="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters with a letter and a number.">
          <input id="password" type="password" autoComplete="new-password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <Field label="Home city (optional)" htmlFor="homeCity">
          <input id="homeCity" autoComplete="address-level2" className="input" value={form.homeCity} onChange={(e) => setForm({ ...form, homeCity: e.target.value })} />
        </Field>
        <Button type="submit" className="w-full" loading={register.isPending}>Create account</Button>
        <p className="text-center text-xs text-muted">We never sell your data. Marketing emails are opt-in.</p>
      </form>
    </AuthShell>
  );
}
