import { Client } from '@elastic/elasticsearch';

const globalForES = globalThis as unknown as { es?: Client };

const url = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
export const INDEX = process.env.ELASTICSEARCH_INDEX || 'logos';

export const es =
  globalForES.es ??
  new Client({
    node: url,
    requestTimeout: 5000,
  });

if (process.env.NODE_ENV !== 'production') globalForES.es = es;

export type LogoDoc = {
  id: string;
  slug: string;
  name: string;
  description: string;
  tags: string[];
  formats: string[];
  backgrounds: string[];
  variantCount: number;
  updatedAt: string;
};

export async function ensureIndex() {
  try {
    const exists = await es.indices.exists({ index: INDEX });
    if (exists) return;
    await es.indices.create({
      index: INDEX,
      settings: {
        analysis: {
          analyzer: {
            default: { type: 'standard' },
          },
        },
      },
      mappings: {
        properties: {
          id: { type: 'keyword' },
          slug: { type: 'keyword' },
          name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
          description: { type: 'text' },
          tags: { type: 'keyword' },
          formats: { type: 'keyword' },
          backgrounds: { type: 'keyword' },
          variantCount: { type: 'integer' },
          updatedAt: { type: 'date' },
        },
      },
    });
  } catch (err) {
    console.error('Elasticsearch ensureIndex failed:', err);
  }
}

export async function indexLogo(doc: LogoDoc) {
  try {
    await ensureIndex();
    await es.index({ index: INDEX, id: doc.id, document: doc, refresh: 'wait_for' });
  } catch (err) {
    console.error('Elasticsearch indexLogo failed:', err);
  }
}

export async function removeLogo(id: string) {
  try {
    await es.delete({ index: INDEX, id, refresh: 'wait_for' });
  } catch (err) {
    // ignore 404s
  }
}

export async function searchLogos(query: string, size = 60): Promise<LogoDoc[]> {
  await ensureIndex();
  const q = query.trim();
  const body = q
    ? {
        query: {
          multi_match: {
            query: q,
            fields: ['name^3', 'slug^2', 'tags^2', 'description'],
            fuzziness: 'AUTO',
            type: 'best_fields' as const,
          },
        },
      }
    : { query: { match_all: {} }, sort: [{ updatedAt: { order: 'desc' as const } }] };

  const res = await es.search<LogoDoc>({
    index: INDEX,
    size,
    ...body,
  });
  return res.hits.hits.map((h) => h._source as LogoDoc);
}
