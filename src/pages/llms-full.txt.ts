import type { APIRoute } from 'astro';
import { PAGE_META, SITE_URL, SCHOLAR_URL, ORCID_URL, RESEARCH_AREAS, getProfile } from '../utils/seo';
import { formatDate, isFutureDate } from '../utils/format';

/**
 * /llms-full.txt - the whole site as one Markdown file.
 *
 * An LLM (or anyone) can read this instead of crawling six HTML pages and
 * reassembling the content out of the glass-panel markup. Built entirely from
 * profile.db, so it stays in lockstep with the rendered pages.
 */

/** profile.db stores intro as HTML; flatten to Markdown-ish plain text. */
const htmlToText = (html: string): string =>
  html
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/** SQLite hands back JSON columns as strings. */
const parseJSON = <T>(raw: unknown, fallback: T): T => {
  if (!raw || typeof raw !== 'string') return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

/** "2022-08-15" + "2029-05-20" -> "2022-08 to 2029-05 (expected)" */
const range = (start?: string, end?: string): string => {
  const from = formatDate(start, 'YYYY-MM');
  if (!end) return `${from} to present`;
  const to = formatDate(end, 'YYYY-MM');
  return isFutureDate(end) ? `${from} to ${to} (expected)` : `${from} to ${to}`;
};

export const GET: APIRoute = ({ site }) => {
  const origin = (site?.origin ?? SITE_URL).replace(/\/+$/, '');
  const p = getProfile();
  const bi = p.basic_info;
  const name = bi?.name ?? 'Asif Iqbal Rahaman';
  const out: string[] = [];
  const push = (...l: string[]) => out.push(...l);

  push(`# ${name}`, '', `> ${PAGE_META.home.description}`, '');
  push(
    `Source: ${origin}/`,
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    '',
    '---',
    '',
  );

  // ---- Profile -------------------------------------------------------------
  push('## Profile', '');
  if (bi?.location) push(`- **Location:** ${bi.location}`);
  if (bi?.email) push(`- **Email:** ${bi.email}`);
  if (bi?.website) push(`- **Website:** ${bi.website}`);
  if (bi?.github) push(`- **GitHub:** ${bi.github}`);
  if (bi?.linkedin) push(`- **LinkedIn:** ${bi.linkedin}`);
  push(`- **Google Scholar:** ${SCHOLAR_URL}`, `- **ORCID:** ${ORCID_URL}`);
  push(`- **Research areas:** ${RESEARCH_AREAS.join(', ')}`, '');

  // ---- Introduction --------------------------------------------------------
  if (bi?.intro) push('## Introduction', '', htmlToText(bi.intro), '');

  // ---- Education -----------------------------------------------------------
  if (p.education.length) {
    push('## Education', '');
    for (const e of p.education) {
      push(`### ${e.degree} in ${e.major} at ${e.institution}`, '');
      if (e.minor) push(`- **Specialization:** ${e.minor}`);
      if (e.location) push(`- **Location:** ${e.location}`);
      push(`- **Dates:** ${range(e.duration_start, e.duration_end)}`);
      if (e.gpa) push(`- **GPA:** ${e.gpa}`);
      if (e.institution_link) push(`- **Institution:** ${e.institution_link}`);
      if (e.courses) push(`- **Courses:** ${e.courses}`);
      push('');
    }
  }

  // ---- Experience ----------------------------------------------------------
  if (p.experience.length) {
    push('## Experience', '');
    for (const x of p.experience) {
      push(`### ${x.title} at ${x.company}`, '');
      if (x.location) push(`- **Location:** ${x.location}`);
      push(`- **Dates:** ${range(x.duration_start, x.duration_end)}`);
      if (x.company_link) push(`- **Organization:** ${x.company_link}`);
      if (x.tech_stack) push(`- **Tech stack:** ${x.tech_stack}`);
      push('');
      // description is JSON: [[heading, body], ...]
      const bullets = parseJSON<[string, string][]>(x.description, []);
      for (const entry of bullets) {
        if (Array.isArray(entry) && entry.length >= 2) {
          push(`- **${entry[0]}:** ${entry[1]}`);
        }
      }
      if (bullets.length) push('');
    }
  }

  // ---- Skills --------------------------------------------------------------
  if (p.skills.length) {
    push(
      '## Technical skills',
      '',
      p.skills.map((s: { skill: string }) => s.skill).join(', '),
      '',
      `Grouped by category and proficiency at ${origin}/overview#skills`,
      '',
    );
  }

  // ---- Projects ------------------------------------------------------------
  if (p.projects.length) {
    push('## Projects', '');
    for (const pr of p.projects) {
      push(`### ${pr.title}`, '');
      if (pr.description) push(pr.description, '');
      if (pr.link) push(`Link: ${pr.link}`, '');
    }
  }

  // ---- Certifications ------------------------------------------------------
  if (p.certifications.length) {
    push('## Certifications', '');
    for (const c of p.certifications) {
      const date = c.achievement_date ? ` (${formatDate(c.achievement_date, 'YYYY-MM')})` : '';
      push(`- **${c.title}**${c.issuer ? `, ${c.issuer}` : ''}${date}`);
      if (c.description) push(`  ${c.description}`);
      if (c.link) push(`  Link: ${c.link}`);
    }
    push('');
  }

  // ---- Awards --------------------------------------------------------------
  if (p.honors_and_awards.length) {
    push('## Honors and awards', '');
    for (const a of p.honors_and_awards) {
      push(`- **${a.title}**${a.description ? `: ${a.description}` : ''}`);
    }
    push('');
  }

  // ---- Resume --------------------------------------------------------------
  if (p.resume.length) {
    push('## Resume', '', `PDF: ${origin}/${p.resume[0].file_path}`, '');
  }

  return new Response(out.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
