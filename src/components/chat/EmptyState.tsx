import { Bot, Mail, BarChart3, CalendarCheck, ListChecks } from 'lucide-react';

interface Props {
  onSuggestion: (text: string) => void;
}

const suggestions = [
  { icon: Mail, text: 'Check my emails and summarize the urgent ones', label: 'Email Triage', color: 'text-primary' },
  { icon: BarChart3, text: "Analyze today's financial Twitter sentiment", label: 'Financial Intel', color: 'text-primary' },
  { icon: CalendarCheck, text: 'Optimize my calendar for this week', label: 'Calendar', color: 'text-primary' },
  { icon: ListChecks, text: 'What tasks need my attention today?', label: 'Task Management', color: 'text-primary' },
];

const EmptyState = ({ onSuggestion }: Props) => (
  <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 shadow-glow">
      <Bot className="w-10 h-10 text-primary" />
    </div>
    <h2 className="text-2xl font-display font-bold text-foreground mb-2">Chief of Staff AI</h2>
    <p className="text-sm text-muted-foreground text-center max-w-md mb-10 leading-relaxed">
      Your intelligent executive assistant. I manage your emails, analyze financial data, optimize your calendar, and handle tasks — all through conversation.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
      {suggestions.map((s) => (
        <button
          key={s.label}
          onClick={() => onSuggestion(s.text)}
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-border bg-card hover:bg-primary/5 hover:border-primary/20 transition-all text-left shadow-soft group"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
            <s.icon className={`w-4 h-4 ${s.color}`} />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">{s.label}</p>
            <p className="text-[11px] text-muted-foreground leading-snug">{s.text}</p>
          </div>
        </button>
      ))}
    </div>
  </div>
);

export default EmptyState;
