import { ChatMessage } from '@/lib/chat-store';
import { Check, CheckCheck, Copy, Bot } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import ApprovalCard, { ApprovalData } from './ApprovalCard';

interface Props {
  message: ChatMessage;
  onApprovalResolved?: (result: string) => void;
}

function parseApproval(content: string): ApprovalData | null {
  try {
    // Check if the AI response contains an approval block
    const match = content.match(/\[APPROVAL_REQUIRED\]([\s\S]*?)\[\/APPROVAL_REQUIRED\]/);
    if (!match) return null;
    const parsed = JSON.parse(match[1].trim());
    return {
      id: parsed.id || crypto.randomUUID(),
      action: parsed.action || 'Review Required',
      suggestion: parsed.suggestion || parsed.content || '',
      reasoning: parsed.reasoning || '',
      metadata: parsed.metadata || {},
    };
  } catch {
    return null;
  }
}

function stripApprovalBlock(content: string): string {
  return content.replace(/\[APPROVAL_REQUIRED\][\s\S]*?\[\/APPROVAL_REQUIRED\]/, '').trim();
}

const MessageBubble = ({ message, onApprovalResolved }: Props) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const approval = !isUser ? parseApproval(message.content) : null;
  const displayContent = approval ? stripApprovalBlock(message.content) : message.content;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-end gap-2.5 animate-slide-up px-4 md:px-0 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mb-5">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}

      <div className={`max-w-[85%] md:max-w-[75%] group relative ${isUser ? 'order-1' : ''}`}>
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-chat-user text-chat-user-foreground rounded-2xl rounded-tr-sm shadow-soft'
              : 'bg-chat-ai text-chat-ai-foreground border border-chat-ai-border rounded-2xl rounded-tl-sm shadow-soft'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <>
              {displayContent && (
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-blockquote:my-2 prose-strong:text-chat-ai-foreground prose-code:text-primary prose-code:bg-primary/5 prose-code:rounded prose-code:px-1">
                  <ReactMarkdown>{displayContent}</ReactMarkdown>
                </div>
              )}
            </>
          )}
        </div>

        {/* Approval card inline */}
        {approval && (
          <div className="mt-2">
            <ApprovalCard approval={approval} onResolved={onApprovalResolved || (() => {})} />
          </div>
        )}

        <div className={`flex items-center gap-1.5 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[11px] text-muted-foreground">{time}</span>
          {isUser && message.status && (
            <span className="text-primary">
              {message.status === 'delivered' ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
            </span>
          )}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
              title="Copy"
            >
              <Copy className={`w-3 h-3 ${copied ? 'text-primary' : 'text-muted-foreground'}`} />
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mb-5">
          <span className="text-[10px] font-bold text-primary-foreground">You</span>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
