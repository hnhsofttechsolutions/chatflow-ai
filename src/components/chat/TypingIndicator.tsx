import { Bot } from 'lucide-react';

const TypingIndicator = () => (
  <div className="flex items-start gap-2.5 animate-slide-up px-4 md:px-0">
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
      <Bot className="w-4 h-4 text-primary" />
    </div>
    <div className="bg-chat-ai border border-chat-ai-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-soft">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-dot" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-dot" style={{ animationDelay: '200ms' }} />
        <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse-dot" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  </div>
);

export default TypingIndicator;
