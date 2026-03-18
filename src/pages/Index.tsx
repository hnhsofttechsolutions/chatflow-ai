import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Chat,
  ChatMessage,
  loadChats,
  saveChats,
  createChat,
  generateId,
  generateChatTitle,
} from '@/lib/chat-store';
import { sendMessageToN8n } from '@/lib/n8n-client';
import { queryMongoDB, formatMongoResult } from '@/lib/mongodb-client';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatInput from '@/components/chat/ChatInput';
import MessageBubble from '@/components/chat/MessageBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';
import EmptyState from '@/components/chat/EmptyState';

const USER_ID = (() => {
  let id = localStorage.getItem('n8n-user-id');
  if (!id) {
    id = generateId();
    localStorage.setItem('n8n-user-id', id);
  }
  return id;
})();

const Index = () => {
  const [chats, setChats] = useState<Chat[]>(() => loadChats());
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    const loaded = loadChats();
    return loaded.length > 0 ? loaded[0].id : null;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.messages.length, isTyping]);

  const updateChat = useCallback((chatId: string, updater: (chat: Chat) => Chat) => {
    setChats((prev) => prev.map((c) => (c.id === chatId ? updater(c) : c)));
  }, []);

  const handleNewChat = useCallback(() => {
    const chat = createChat();
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat.id);
  }, []);

  const handleDeleteChat = useCallback(
    (id: string) => {
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (activeChatId === id) {
        setActiveChatId((prev) => {
          const remaining = chats.filter((c) => c.id !== id);
          return remaining.length > 0 ? remaining[0].id : null;
        });
      }
    },
    [activeChatId, chats]
  );

  const handleClearChat = useCallback(() => {
    if (!activeChatId) return;
    updateChat(activeChatId, (c) => ({ ...c, messages: [], title: 'New Chat', updatedAt: Date.now() }));
  }, [activeChatId, updateChat]);

  const handleApprovalResolved = useCallback(
    (result: string) => {
      if (!activeChatId) return;
      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'ai',
        content: result,
        timestamp: Date.now(),
      };
      updateChat(activeChatId, (c) => ({
        ...c,
        messages: [...c.messages, aiMsg],
        updatedAt: Date.now(),
      }));
    },
    [activeChatId, updateChat]
  );

  const handleSend = useCallback(
    async (content: string) => {
      let chatId = activeChatId;

      if (!chatId) {
        const chat = createChat();
        setChats((prev) => [chat, ...prev]);
        chatId = chat.id;
        setActiveChatId(chatId);
      }

      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
        status: 'sent',
      };

      updateChat(chatId, (c) => {
        const isFirst = c.messages.length === 0;
        return {
          ...c,
          messages: [...c.messages, userMsg],
          title: isFirst ? generateChatTitle(content) : c.title,
          updatedAt: Date.now(),
        };
      });

      setTimeout(() => {
        updateChat(chatId!, (c) => ({
          ...c,
          messages: c.messages.map((m) => (m.id === userMsg.id ? { ...m, status: 'delivered' as const } : m)),
        }));
      }, 600);

      setIsTyping(true);

      try {
        let response: string;

        // Handle /db commands for MongoDB
        if (content.trim().startsWith('/db')) {
          const parts = content.trim().split(/\s+/);
          const subCommand = parts[1] || 'overview';

          if (subCommand === 'overview') {
            const data = await queryMongoDB({ action: 'overview' });
            response = formatMongoResult(data);
          } else if (subCommand === 'databases') {
            const data = await queryMongoDB({ action: 'listDatabases' });
            response = formatMongoResult(data);
          } else if (subCommand === 'collections' && parts[2]) {
            const data = await queryMongoDB({ action: 'listCollections', database: parts[2] });
            response = formatMongoResult(data);
          } else if (subCommand === 'find' && parts[2] && parts[3]) {
            const data = await queryMongoDB({ action: 'find', database: parts[2], collection: parts[3], limit: 10 });
            response = formatMongoResult(data);
          } else if (subCommand === 'count' && parts[2] && parts[3]) {
            const data = await queryMongoDB({ action: 'count', database: parts[2], collection: parts[3] });
            response = formatMongoResult(data);
          } else {
            response = `**MongoDB Commands:**\n- \`/db overview\` — Full overview of all databases\n- \`/db databases\` — List databases\n- \`/db collections <database>\` — List collections\n- \`/db find <database> <collection>\` — Sample documents\n- \`/db count <database> <collection>\` — Count documents`;
          }
        } else {
          const currentChat = chats.find((c) => c.id === chatId);
          const history = currentChat?.messages || [];
          response = await sendMessageToN8n(content, USER_ID, history);
        }

        const aiMsg: ChatMessage = {
          id: generateId(),
          role: 'ai',
          content: response,
          timestamp: Date.now(),
        };

        updateChat(chatId!, (c) => ({
          ...c,
          messages: [...c.messages, aiMsg],
          updatedAt: Date.now(),
        }));
      } catch {
        const errorMsg: ChatMessage = {
          id: generateId(),
          role: 'ai',
          content: '⚠️ Sorry, something went wrong. Please try again.',
          timestamp: Date.now(),
        };
        updateChat(chatId!, (c) => ({
          ...c,
          messages: [...c.messages, errorMsg],
          updatedAt: Date.now(),
        }));
      } finally {
        setIsTyping(false);
      }
    },
    [activeChatId, chats, updateChat]
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          title={activeChat?.title || 'Chief of Staff AI'}
          onToggleSidebar={() => setSidebarOpen(true)}
          onClearChat={handleClearChat}
          hasMessages={(activeChat?.messages.length || 0) > 0}
        />

        <div ref={scrollRef} className="flex-1 overflow-y-auto chat-pattern">
          {!activeChat || activeChat.messages.length === 0 ? (
            <EmptyState onSuggestion={handleSend} />
          ) : (
            <div className="max-w-3xl mx-auto py-4 space-y-4">
              {activeChat.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onApprovalResolved={handleApprovalResolved}
                />
              ))}
              {isTyping && <TypingIndicator />}
            </div>
          )}
        </div>

        <ChatInput onSend={handleSend} disabled={isTyping} />
      </main>
    </div>
  );
};

export default Index;
