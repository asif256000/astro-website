import type { APIRoute } from 'astro';
import { SITE_URL } from '../utils/seo';

/**
 * robots.txt, generated rather than static so the sitemap URL is always
 * derived from `site` in astro.config.mjs and can never go stale.
 *
 * Policy: this is a public portfolio whose entire purpose is to be found and
 * cited - by search engines and by LLM answer engines alike. So everything is
 * allowed, and the AI agents are named explicitly rather than left to the
 * wildcard, to make that an on-the-record choice instead of an accident.
 *
 * To opt out of AI training while staying in search results, move the agent
 * from the allow list to the opt-out block at the bottom of this file.
 */

/** Crawlers that feed AI training sets and/or LLM answer engines. */
const AI_AGENTS = [
  'GPTBot',            // OpenAI, model training
  'OAI-SearchBot',     // OpenAI, ChatGPT Search index
  'ChatGPT-User',      // OpenAI, user-initiated page fetch
  'ClaudeBot',         // Anthropic, model training
  'Claude-User',       // Anthropic, user-initiated page fetch
  'Claude-SearchBot',  // Anthropic, search indexing
  'anthropic-ai',      // Anthropic, legacy agent name
  'PerplexityBot',     // Perplexity, index
  'Perplexity-User',   // Perplexity, user-initiated page fetch
  'Google-Extended',   // Google, Gemini training (separate from Googlebot)
  'Applebot-Extended', // Apple, Apple Intelligence training
  'meta-externalagent',// Meta, model training
  'Amazonbot',         // Amazon, Alexa / Rufus
  'CCBot',             // Common Crawl, feeds many open datasets
  'cohere-ai',         // Cohere
  'YouBot',            // You.com
  'DuckAssistBot',     // DuckDuckGo AI assist
  'MistralAI-User',    // Mistral, user-initiated page fetch
];

/** Conventional search engine crawlers. */
const SEARCH_AGENTS = ['Googlebot', 'Bingbot', 'DuckDuckBot', 'Applebot', 'Slurp'];

export const GET: APIRoute = ({ site }) => {
  const origin = (site?.origin ?? SITE_URL).replace(/\/+$/, '');

  const block = (agents: string[], heading: string) =>
    [`# ${heading}`, ...agents.map((a) => `User-agent: ${a}`), 'Allow: /', ''].join('\n');

  const body = [
    `# robots.txt for ${origin}`,
    '# Generated at build time from src/pages/robots.txt.ts',
    '',
    '# Default: everything is open to everyone.',
    'User-agent: *',
    'Allow: /',
    '',
    block(SEARCH_AGENTS, 'Search engines'),
    block(AI_AGENTS, 'AI / LLM crawlers: allowed deliberately, see source comment'),
    '# Plain-text summaries of this site, maintained for LLM consumption:',
    `#   ${origin}/llms.txt       (index)`,
    `#   ${origin}/llms-full.txt  (full profile content)`,
    '',
    `Sitemap: ${origin}/sitemap-index.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
