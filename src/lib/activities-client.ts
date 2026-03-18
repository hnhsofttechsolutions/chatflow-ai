import { supabase } from '@/integrations/supabase/client';

export interface Activity {
  _id?: string;
  type: 'email' | 'twitter' | 'task' | 'alert';
  title: string;
  category?: string;
  content: string;
  timestamp: string;
}

export async function fetchActivities(): Promise<Activity[]> {
  const { data, error } = await supabase.functions.invoke('activities');

  if (error) {
    throw new Error(error.message || 'Failed to fetch activities');
  }

  return (data?.data || []) as Activity[];
}
