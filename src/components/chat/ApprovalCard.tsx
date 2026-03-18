import { useState } from 'react';
import { ShieldCheck, Pencil, X, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface ApprovalData {
  id: string;
  action: string;
  suggestion: string;
  reasoning: string;
  metadata?: Record<string, unknown>;
}

interface Props {
  approval: ApprovalData;
  onResolved: (result: string) => void;
}

const ApprovalCard = ({ approval, onResolved }: Props) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [editedContent, setEditedContent] = useState(approval.suggestion);
  const [loading, setLoading] = useState(false);
  const [resolved, setResolved] = useState(false);

  const handleAction = async (action: 'approve' | 'deny', content?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('approve', {
        body: {
          approvalId: approval.id,
          action,
          content: content || approval.suggestion,
          metadata: approval.metadata,
        },
      });

      if (error) throw error;

      setResolved(true);
      const label = action === 'approve' ? '✅ Approved' : '❌ Denied';
      onResolved(data?.output || `${label} — action processed.`);
    } catch {
      onResolved('⚠️ Failed to process approval. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (resolved) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 animate-slide-up">
        <div className="flex items-center gap-2 text-sm text-primary font-medium">
          <Check className="w-4 h-4" />
          Action processed
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-approval-border bg-approval-bg shadow-medium animate-slide-up overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-approval-border/30 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-approval-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-approval-foreground">Approval Required</h3>
          <p className="text-xs text-approval-foreground/70">{approval.action}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-3 space-y-3">
        {/* Suggestion */}
        <div className="bg-card rounded-xl p-3.5 border border-border">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">Suggested Action</p>
          {mode === 'edit' ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full text-sm text-foreground bg-secondary rounded-lg p-2.5 border border-border resize-none outline-none focus:ring-2 focus:ring-ring min-h-[80px]"
            />
          ) : (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{approval.suggestion}</p>
          )}
        </div>

        {/* Reasoning */}
        {approval.reasoning && (
          <div className="bg-card rounded-xl p-3.5 border border-border">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">Reasoning</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{approval.reasoning}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-4 flex items-center gap-2">
        <button
          onClick={() => handleAction('approve', mode === 'edit' ? editedContent : undefined)}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          {mode === 'edit' ? 'Approve Edited' : 'Approve'}
        </button>

        <button
          onClick={() => setMode(mode === 'edit' ? 'view' : 'edit')}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
        >
          <Pencil className="w-3.5 h-3.5" />
          {mode === 'edit' ? 'Cancel' : 'Edit'}
        </button>

        <button
          onClick={() => handleAction('deny')}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-destructive/20 text-destructive text-sm font-medium hover:bg-destructive/5 transition-colors disabled:opacity-50"
        >
          <X className="w-3.5 h-3.5" />
          Deny
        </button>
      </div>
    </div>
  );
};

export default ApprovalCard;
