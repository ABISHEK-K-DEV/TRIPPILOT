import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMFORT_TIERS, INTERESTS, MAX_TRIP_NIGHTS, nightsBetween, ORIGIN_HUBS, plannerRequestSchema, TRAVEL_PACES, type PlannerRequestInput } from '@trippilot/shared';
import { useDestinations } from '../lib/queries';
import { defaultDates, planToSearchParams } from '../lib/plan-params';
import { inr } from '../lib/format';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';
import { Field } from './ui/Field';

const BUDGET_PRESETS = [30000, 60000, 100000, 200000];

function Segmented<T extends string>({ value, onChange, options, name }: { value: T; onChange: (v: T) => void; options: readonly { id: string; label: string; description: string }[]; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="grid grid-cols-3 gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id as T)}
          className={`rounded-xl border px-3 py-2.5 text-left transition ${value === o.id ? 'border-pine-600 bg-pine-50 ring-1 ring-pine-600' : 'border-line bg-white hover:border-pine-200'}`}
        >
          <div className="text-sm font-semibold">{o.label}</div>
          <div className="mt-0.5 text-[11px] leading-snug text-muted">{o.description}</div>
        </button>
      ))}
    </div>
  );
}

function Stepper({ id, value, min, max, onChange }: { id: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex h-[46px] items-center justify-between rounded-xl border border-line bg-white px-1.5">
      <button type="button" aria-label="Decrease" className="grid size-8 place-items-center rounded-lg text-lg hover:bg-sand disabled:opacity-30" disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
      <output id={id} className="font-semibold tabular">{value}</output>
      <button type="button" aria-label="Increase" className="grid size-8 place-items-center rounded-lg text-lg hover:bg-sand disabled:opacity-30" disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

export function PlannerForm({ initial }: { initial?: Partial<PlannerRequestInput> }) {
  const navigate = useNavigate();
  const { data: destData } = useDestinations({});
  const dates = useMemo(() => defaultDates(), []);
  const [form, setForm] = useState<PlannerRequestInput>({
    origin: 'DEL',
    region: 'any',
    adults: 2,
    children: 0,
    tier: 'standard',
    pace: 'balanced',
    interests: [],
    includeInsurance: true,
    ...dates,
    ...initial,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof PlannerRequestInput>(k: K, v: PlannerRequestInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  let nights: number | null = null;
  try { nights = nightsBetween(form.startDate, form.endDate); } catch { nights = null; }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = plannerRequestSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path.join('.'), i.message])));
      return;
    }
    setErrors({});
    navigate(`/plan/results?${planToSearchParams(form)}`);
  };

  const domestic = destData?.destinations.filter((d) => !d.international) ?? [];
  const intl = destData?.destinations.filter((d) => d.international) ?? [];

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-sm font-semibold text-ink">Where</legend>
        <Field label="Flying or travelling from" htmlFor="origin">
          <select id="origin" className="input" value={form.origin} onChange={(e) => set('origin', e.target.value)}>
            {ORIGIN_HUBS.map((o) => <option key={o.code} value={o.code}>{o.city} ({o.code})</option>)}
          </select>
        </Field>
        <Field label="Destination" htmlFor="destination" hint={!form.destination ? 'We’ll pick the best match for your dates, interests and budget.' : undefined}>
          <select id="destination" className="input" value={form.destination ?? ''} onChange={(e) => set('destination', e.target.value || undefined)}>
            <option value="">✨ Suggest a destination for me</option>
            <optgroup label="India">{domestic.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}</optgroup>
            <optgroup label="International">{intl.map((d) => <option key={d.slug} value={d.slug}>{d.name}, {d.country.name}</option>)}</optgroup>
          </select>
        </Field>
        {!form.destination && (
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            {(['any', 'domestic', 'international'] as const).map((r) => (
              <Chip key={r} active={form.region === r} onClick={() => set('region', r)}>
                {r === 'any' ? 'Anywhere' : r === 'domestic' ? '🇮🇳 Within India' : '🌏 International'}
              </Chip>
            ))}
          </div>
        )}
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-4">
        <legend className="mb-3 text-sm font-semibold text-ink">When & who</legend>
        <Field label="Departure" htmlFor="start" error={errors.startDate}>
          <input id="start" type="date" className="input" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
        </Field>
        <Field label="Return" htmlFor="end" error={errors.endDate} hint={nights && nights > 0 ? `${nights} night${nights > 1 ? 's' : ''} · max ${MAX_TRIP_NIGHTS}` : undefined}>
          <input id="end" type="date" className="input" min={form.startDate} value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
        </Field>
        <Field label="Adults" htmlFor="adults">
          <Stepper id="adults" value={Number(form.adults)} min={1} max={12} onChange={(n) => set('adults', n)} />
        </Field>
        <Field label="Children" htmlFor="children" hint="Under 12">
          <Stepper id="children" value={Number(form.children ?? 0)} min={0} max={10} onChange={(n) => set('children', n)} />
        </Field>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">Total budget <span className="font-normal text-muted">(optional, all travellers)</span></legend>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:w-56">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">₹</span>
            <input
              aria-label="Total budget in rupees"
              inputMode="numeric"
              className="input pl-8 tabular"
              placeholder="e.g. 1,00,000"
              value={form.budget ? Number(form.budget).toLocaleString('en-IN') : ''}
              onChange={(e) => {
                const n = Number(e.target.value.replace(/[^0-9]/g, ''));
                set('budget', n > 0 ? n : undefined);
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {BUDGET_PRESETS.map((b) => <Chip key={b} active={form.budget === b} onClick={() => set('budget', form.budget === b ? undefined : b)}>{inr(b)}</Chip>)}
          </div>
        </div>
        {errors.budget && <p className="mt-1.5 text-[13px] text-coral">{errors.budget}</p>}
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">Comfort level</legend>
        <Segmented name="Comfort level" value={form.tier ?? 'standard'} onChange={(v) => set('tier', v)} options={COMFORT_TIERS} />
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">Pace</legend>
        <Segmented name="Pace" value={form.pace ?? 'balanced'} onChange={(v) => set('pace', v)} options={TRAVEL_PACES} />
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">Interests <span className="font-normal text-muted">(pick a few)</span></legend>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => {
            const on = form.interests?.includes(i.id) ?? false;
            return (
              <Chip key={i.id} active={on} onClick={() => set('interests', on ? form.interests!.filter((x) => x !== i.id) : [...(form.interests ?? []), i.id])}>
                {i.label}
              </Chip>
            );
          })}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white p-4">
        <input type="checkbox" className="mt-0.5 size-4 accent-[var(--color-pine-600)]" checked={form.includeInsurance !== false} onChange={(e) => set('includeInsurance', e.target.checked)} />
        <span>
          <span className="block text-sm font-semibold">Include travel insurance estimate</span>
          <span className="block text-sm text-muted">Strongly recommended for international trips.</span>
        </span>
      </label>

      <div className="flex flex-col-reverse items-stretch gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">Milestone 1 uses a rule-based planner over clearly labelled sample data. No live prices yet.</p>
        <Button type="submit" size="lg">Build my trip plan →</Button>
      </div>
    </form>
  );
}
