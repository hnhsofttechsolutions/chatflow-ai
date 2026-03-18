import { useQuery } from '@tanstack/react-query';
import { fetchActivities, Activity } from '@/lib/activities-client';

export function useActivities(pollInterval = 10000) {
  return useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: fetchActivities,
    refetchInterval: pollInterval,
    refetchIntervalInBackground: false,
  });
}
