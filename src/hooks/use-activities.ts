import { useQuery } from '@tanstack/react-query';
import { fetchActivities, ActivitiesResponse } from '@/lib/activities-client';

export function useActivities(pollInterval = 10000) {
  return useQuery<ActivitiesResponse>({
    queryKey: ['activities'],
    queryFn: fetchActivities,
    refetchInterval: pollInterval,
    refetchIntervalInBackground: false,
  });
}
