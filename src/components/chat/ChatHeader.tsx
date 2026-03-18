import { Menu, Trash2 } from 'lucide-react';

interface Props {
  title: string;
  onToggleSidebar: () => void;
  onClearChat: () => void;
  hasMessages: boolean;
}

const ChatHeader = ({ title, onToggleSidebar, onClearChat, hasMessages }: Props) => (
  <header className="border-b border-border glass sticky top-0 z-20">
    <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-muted transition-colors md:hidden"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="font-semibold text-foreground text-sm">{title}</h1>
          <p className="text-[11px] text-accent flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            Online
          </p>
        </div>
      </div>
      {hasMessages && (
        <button
          onClick={onClearChat}
          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="Clear chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  </header>
);

export default ChatHeader;
