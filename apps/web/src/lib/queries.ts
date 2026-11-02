import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  DestinationDetail,
  DestinationSummary,
  OriginHub,
  PlanResult,
  PlannerRequestInput,
  PublicUser,
  SavedTripSummary,
  SearchResult,
} from '@trippilot/shared';
import { api, ApiRequestError } from './api';

export interface MetaResponse {
  origins: OriginHub[];
  interests: { id: string; label: string }[];
  tiers: { id: string; label: string; description: string }[];
  paces: { id: string; label: string; description: string }[];
  providers: { itinerary: { id: string; label: string; kind: string }; flights: string; hotels: string; fx: string };
  milestone: number;
}

export const useMeta = () =>
  useQuery({ queryKey: ['meta'], queryFn: () => api<MetaResponse>('/meta'), staleTime: Infinity });

export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api<{ user: PublicUser | null }>('/auth/me')).user,
    staleTime: 5 * 60_000,
    retry: false,
  });

export function useAuthMutations() {
  const qc = useQueryClient();
  const onAuthed = (data: { user: PublicUser }) => qc.setQueryData(['me'], data.user);
  return {
    login: useMutation({
      mutationFn: (body: { email: string; password: string }) => api<{ user: PublicUser }>('/auth/login', { method: 'POST', json: body }),
      onSuccess: onAuthed,
    }),
    register: useMutation({
      mutationFn: (body: { name: string; email: string; password: string; homeCity?: string }) =>
        api<{ user: PublicUser }>('/auth/register', { method: 'POST', json: body }),
      onSuccess: onAuthed,
    }),
    logout: useMutation({
      mutationFn: () => api<void>('/auth/logout', { method: 'POST' }),
      onSuccess: () => {
        qc.setQueryData(['me'], null);
        qc.removeQueries({ queryKey: ['trips'] });
      },
    }),
  };
}

export const useDestinations = (params: Record<string, string>) =>
  useQuery({
    queryKey: ['destinations', params],
    queryFn: () =>
      api<{ destinations: DestinationSummary[]; total: number; dataSource: string }>(`/destinations?${new URLSearchParams(params)}`),
    placeholderData: keepPreviousData,
  });

export const useDestination = (slug: string | undefined) =>
  useQuery({
    queryKey: ['destination', slug],
    queryFn: () => api<{ destination: DestinationDetail }>(`/destinations/${slug}`).then((r) => r.destination),
    enabled: !!slug,
  });

export const useSearch = (q: string) =>
  useQuery({
    queryKey: ['search', q],
    queryFn: () => api<SearchResult>(`/search?q=${encodeURIComponent(q)}`),
    enabled: q.trim().length >= 2,
    staleTime: 60_000,
  });

export const usePlan = (request: PlannerRequestInput | null) =>
  useQuery({
    queryKey: ['plan', request],
    queryFn: () => api<{ plan: PlanResult }>('/planner/plan', { method: 'POST', json: request as unknown as Record<string, unknown> }).then((r) => r.plan),
    enabled: !!request,
    staleTime: 10 * 60_000,
    retry: (count, err) => !(err instanceof ApiRequestError && err.status < 500) && count < 1,
  });

export const useTrips = (enabled: boolean) =>
  useQuery({ queryKey: ['trips'], queryFn: () => api<{ trips: SavedTripSummary[] }>('/trips').then((r) => r.trips), enabled });

export const useTrip = (id: string | undefined) =>
  useQuery({
    queryKey: ['trip', id],
    queryFn: () => api<{ trip: SavedTripSummary; plan: PlanResult; request: PlannerRequestInput }>(`/trips/${id}`),
    enabled: !!id,
  });

export function useSaveTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title?: string; request: PlannerRequestInput }) =>
      api<{ trip: SavedTripSummary }>('/trips', { method: 'POST', json: body as unknown as Record<string, unknown> }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/trips/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });
}
