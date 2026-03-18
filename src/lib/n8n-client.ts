import { ChatMessage } from './chat-store';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || '';

export async function sendMessageToN8n(
  message: string,
  userId: string,
  history: ChatMessage[]
): Promise<string> {
  if (!N8N_WEBHOOK_URL) {
    // Demo mode: simulate AI response
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    return getDemoResponse(message);
  }

  const res = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      userId,
      history: history.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }

  const data = await res.json();
  return data.output || data.response || data.text || 'No response received.';
}

function getDemoResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('email') || lower.includes('inbox') || lower.includes('mail')) {
    return `📧 **Email Workflow Triggered**\n\nI've analyzed your recent emails and categorized them:\n\n- **3 Urgent** — Requires immediate response\n- **5 Important** — Follow-up needed this week\n- **12 Informational** — Newsletters & updates\n\nDraft replies have been prepared for the urgent items. Would you like me to send them?`;
  }

  if (lower.includes('twitter') || lower.includes('tweet') || lower.includes('financial') || lower.includes('market')) {
    return `📊 **Twitter Financial Analysis**\n\nHere's today's summary from financial Twitter:\n\n**Trending Topics:**\n1. Fed interest rate decision — Sentiment: *Cautiously bullish*\n2. Tech earnings season — Sentiment: *Mixed*\n3. Crypto market recovery — Sentiment: *Optimistic*\n\n**Key Insight:** Market consensus suggests a 75% probability of rate hold. Would you like a deeper analysis on any topic?`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `👋 Hello! I'm your AI automation assistant powered by n8n workflows.\n\nI can help you with:\n- **Email Management** — Triage, categorize, and draft replies\n- **Twitter Analysis** — Financial insights and sentiment analysis\n\nJust type your request and I'll route it to the right workflow!`;
  }

  return `I've processed your request: *"${message}"*\n\nThe appropriate n8n workflow has been triggered. Here's what I found:\n\n> Your request has been analyzed and the relevant automation is running. Results will appear here shortly.\n\nIs there anything specific you'd like me to focus on?`;
}
