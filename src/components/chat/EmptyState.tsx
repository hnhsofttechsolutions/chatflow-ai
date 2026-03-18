import { Bot, Mail, BarChart3 } from 'lucide-react';

interface Props {
  onSuggestion: (text: string) => void;
}

const suggestions = [
  { icon: Mail, text: 'Check my emails and summarize the urgent ones', label: 'Email Triage' },
  { icon: BarChart3, text: 'Analyze today\'s financial Twitter sentiment', label: 'Twitter Analysis' },
  { icon: Bot, text: 'What workflows do you support?', label: 'Get Started' },
];

const EmptyState = ({ onSuggestion }: Props) => (
  <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
      <Bot className="w-8 h-8 text-primary" />
    </div>
    <h2 className="text-xl font-semibold text-foreground mb-2">n8n AI Assistant</h2>
    <p className="text-sm text-muted-foreground text-center max-w-sm mb-8">
      Send a message to trigger your AI automation workflows. I can handle emails, analyze tweets, and more.
    </p>
    <div className="grid gap-2 w-full max-w-sm">
      {suggestions.map((s) => (
        <button
          key={s.label}
          onClick={() => onSuggestion(s.text)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-left shadow-soft group"
        >
          <s.icon className="w-4 h-4 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground">{s.label}</p>
            <p className="text-[11px] text-muted-foreground">{s.text}</p>
          </div>
        </button>
      ))}
    </div>
  </div>
);

export default EmptyState;
