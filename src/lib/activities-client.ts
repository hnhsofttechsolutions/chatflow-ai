import { supabase } from '@/integrations/supabase/client';

export interface NewsSummary {
  _id: string;
  date: string;
  source_count: number;
  summary: string;
}

export interface EmailActivity {
  _id: string;
  subject: string;
  from: string;
  bodyPreview: string;
  category: 'Spam' | 'FYI' | 'Action Required';
  reasoning: string;
  processedAt: string;
}

export interface ActivitiesResponse {
  summaries: NewsSummary[];
  emails: EmailActivity[];
}

export async function fetchActivities(): Promise<ActivitiesResponse> {
  const { data, error } = await supabase.functions.invoke('activities');

  if (error) {
    throw new Error(error.message || 'Failed to fetch activities');
  }

  return {
    summaries: data?.summaries || [],
    emails: data?.emails || [],
  };
}
