import { ChatMessage } from './chat-store';
import { supabase } from '@/integrations/supabase/client';

export async function sendMessageToN8n(
  message: string,
  userId: string,
  history: ChatMessage[]
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('chat', {
    body: {
      message,
      userId,
      history: history.map((m) => ({ role: m.role, content: m.content })),
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to send message');
  }

  return data.output || 'No response received.';
}
