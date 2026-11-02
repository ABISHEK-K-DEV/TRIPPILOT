import { useState } from 'react';
import type { FeasibilityIssue, ItineraryDay, ItineraryStop, PlanResult } from '@trippilot/shared';
import { formatDate, formatDuration, inr } from '../../lib/format';
import { ConfidenceBadge } from '../ui/ConfidenceBadge';
import { RouteSketch } from './RouteSketch';

const KIND_STYLE: Record<ItineraryStop['kind'], { dot: string; label: string }> = {
  arrival: { dot: 'bg-sky-600', label: 'Arrival' },
  attraction: { dot: 'bg-pine-600', label: 'Visit' },
  meal: { dot: 'bg-amber-ink', label: 'Meal' },
  free_time: { dot: 'bg-sand-deep', label: 'Free' },
  transfer: { dot: 'bg-sky-600', label: 'Transfer' },
  departure: { dot: 'bg-sky-600', label: 'Departure' },
};

function Stop({ s }: { s: ItineraryStop }) {
  const k = KIND_STYLE[s.kind];
  return (
    <li className="relative pl-8">
      {s.travelMinutesFromPrevious > 0 && (
        <div className="mb-2 flex items-center gap-2 text-xs text-muted">
          <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden><path d="M3 11h10M4 11l1.2-4h5.6L12 11M5 13.5a1 1 0 1 0 0-.01M11 13.5a1 1 0 1 0 0-.01" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" /></svg>
          ~{formatDuration(s.travelMinutesFromPrevious)} travel
        </div>
      )}
      <span className={`absolute left-[7px] top-1.5 size-3 rounded-full ring-4 ring-white ${k.dot}`} aria-hidden />
      <div className={`rounded-xl ${s.kind === 'attraction' ? 'border border-line bg-white p-4' : 'px-1 py-0.5'}`}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-sm font-semibold tabular text-pine-700">{s.startTime}</span>
          <span className={`font-medium ${s.kind === 'attraction' ? 'text-[15px]' : 'text-sm text-ink-soft'}`}>{s.title}</span>
          <span className="text-xs text-muted">{formatDuration(s.durationMinutes)}</span>
        </div>
        {s.kind === 'attraction' && (
          <>
            {s.description && <p className="mt-1.5 text-sm text-muted">{s.description}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {s.location && <span className="rounded-full bg-sand px-2 py-0.5 text-ink-soft">📍 {s.location.name}</span>}
              <span className="font-medium tabular">{s.costPerPerson > 0 ? `${inr(s.costPerPerson)} / person` : 'Free entry'}</span>
              {s.costPerPerson > 0 && <ConfidenceBadge confidence={s.confidence} compact />}
            </div>
          </>
        )}
        {s.kind !== 'attraction' && s.description && <p className="mt-0.5 text-xs text-muted">{s.description}</p>}
      </div>
    </li>
  );
}

function DayCard({ day, issues, active, onSelect }: { day: ItineraryDay; issues: FeasibilityIssue[]; active: boolean; onSelect: () => void }) {
  return (
    <section
      aria-labelledby={`day-${day.dayNumber}`}
      onMouseEnter={onSelect}
      onFocus={onSelect}
      className={`card p-5 transition sm:p-6 ${active ? 'ring-2 ring-pine-200' : ''}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-pine-50 text-center leading-none">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-pine-600">Day</div>
              <div className="display text-xl text-pine-700">{day.dayNumber}</div>
            </div>
          </div>
          <div>
            <h3 id={`day-${day.dayNumber}`} className="display text-lg">{day.title}</h3>
            <p className="text-sm text-muted">{formatDate(day.date, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
        </div>
        <div className="flex gap-3 text-xs text-muted">
          <span>🎟 {formatDuration(day.totalActivityMinutes)} sightseeing</span>
          <span>🚗 {formatDuration(day.totalTravelMinutes)} travel</span>
        </div>
      </header>
      {(day.notes.length > 0 || issues.length > 0) && (
        <div className="mt-4 space-y-1.5">
          {day.notes.map((n) => <p key={n} className="rounded-lg bg-sand px-3 py-2 text-sm text-ink-soft">{n}</p>)}
          {issues.map((i) => (
            <p key={i.message} className={`rounded-lg px-3 py-2 text-sm ${i.severity === 'error' ? 'bg-coral/10 text-coral' : 'bg-amber-soft text-amber-ink'}`}>⚠ {i.message}</p>
          ))}
        </div>
      )}
      <ol className="relative mt-5 space-y-4 before:absolute before:bottom-2 before:left-[12px] before:top-2 before:w-px before:bg-line">
        {day.stops.map((s) => <Stop key={s.id} s={s} />)}
      </ol>
    </section>
  );
}

export function ItineraryView({ plan }: { plan: PlanResult }) {
  const [activeDay, setActiveDay] = useState(1);
  const day = plan.itinerary.find((d) => d.dayNumber === activeDay) ?? plan.itinerary[0]!;
  const stay = plan.accommodation[0];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        {plan.itinerary.map((d) => (
          <DayCard key={d.dayNumber} day={d} active={d.dayNumber === activeDay} onSelect={() => setActiveDay(d.dayNumber)} issues={plan.feasibility.filter((f) => f.dayNumber === d.dayNumber)} />
        ))}
        {plan.plannerNotes.length > 0 && (
          <div className="rounded-2xl border border-dashed border-line p-4 text-sm text-muted">
            {plan.plannerNotes.map((n) => <p key={n}>💡 {n}</p>)}
          </div>
        )}
      </div>
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold">Day {day.dayNumber} route</h4>
            <div className="flex gap-1" role="tablist" aria-label="Select day">
              {plan.itinerary.map((d) => (
                <button key={d.dayNumber} role="tab" aria-selected={d.dayNumber === activeDay} onClick={() => setActiveDay(d.dayNumber)}
                  className={`size-7 rounded-full text-xs font-semibold transition ${d.dayNumber === activeDay ? 'bg-pine-700 text-white' : 'bg-sand text-ink-soft hover:bg-sand-deep'}`}>
                  {d.dayNumber}
                </button>
              ))}
            </div>
          </div>
          <RouteSketch day={day} base={{ lat: plan.destination.lat, lng: plan.destination.lng }} baseLabel="Your stay" />
        </div>
        {stay && (
          <div className="card p-5">
            <div className="eyebrow">Where to stay</div>
            <h4 className="display mt-1 text-lg">{stay.area}</h4>
            <p className="mt-1 text-sm text-muted">{stay.note}</p>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <div>
                <div className="text-xs text-muted">Typical nightly rate · {stay.rooms} room{stay.rooms > 1 ? 's' : ''}</div>
                <div className="text-lg font-semibold tabular">{inr(stay.nightlyRate)}<span className="text-sm font-normal text-muted"> + taxes</span></div>
              </div>
              <ConfidenceBadge confidence={stay.confidence} />
            </div>
            <p className="mt-3 text-xs text-muted">Live hotel comparison with cancellation policies and total payable prices arrives with provider integrations (Milestone 3).</p>
          </div>
        )}
      </aside>
    </div>
  );
}
