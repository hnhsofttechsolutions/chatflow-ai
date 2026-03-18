import { supabase } from '@/integrations/supabase/client';

export interface MongoAction {
  action: 'listDatabases' | 'listCollections' | 'find' | 'count' | 'overview';
  database?: string;
  collection?: string;
  filter?: Record<string, unknown>;
  limit?: number;
}

export async function queryMongoDB(params: MongoAction) {
  const { data, error } = await supabase.functions.invoke('mongodb', {
    body: params,
  });

  if (error) {
    throw new Error(error.message || 'Failed to query MongoDB');
  }

  return data.data;
}

export function formatMongoResult(data: unknown): string {
  if (!data) return 'No data returned.';

  if (Array.isArray(data) && data.length === 0) return 'No results found.';

  // Overview format
  if (Array.isArray(data) && data[0]?.database) {
    const lines: string[] = ['## 📊 MongoDB Overview\n'];
    for (const db of data as Array<{ database: string; collections: Array<{ name: string; count: number; sample: unknown[] }> }>) {
      lines.push(`### 🗄️ Database: \`${db.database}\`\n`);
      if (db.collections.length === 0) {
        lines.push('_No collections_\n');
        continue;
      }
      for (const coll of db.collections) {
        lines.push(`**📁 ${coll.name}** — ${coll.count} documents\n`);
        if (coll.sample.length > 0) {
          lines.push('```json');
          lines.push(JSON.stringify(coll.sample[0], null, 2));
          lines.push('```\n');
        }
      }
    }
    return lines.join('\n');
  }

  // Simple array of docs
  if (Array.isArray(data)) {
    return '```json\n' + JSON.stringify(data, null, 2) + '\n```';
  }

  // Count result
  if (typeof data === 'object' && data !== null && 'count' in data) {
    return `**Document count:** ${(data as { count: number }).count}`;
  }

  return '```json\n' + JSON.stringify(data, null, 2) + '\n```';
}
