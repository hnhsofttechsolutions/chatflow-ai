import { Chat } from '@/lib/chat-store';
import { Plus, MessageSquare, Trash2, X } from 'lucide-react';

interface Props {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

const ChatSidebar = ({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, open, onClose }: Props) => {
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-foreground/20 z-30 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed md:relative z-40 top-0 left-0 h-full w-[280px] bg-sidebar-bg border-r border-border flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground text-sm">Chat History</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onNewChat}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">No conversations yet</p>
          )}
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => { onSelectChat(chat.id); onClose(); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer group transition-colors text-sm ${
                chat.id === activeChatId
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="truncate flex-1">{chat.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-[11px] text-muted-foreground text-center">n8n Chat Assistant</p>
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;
