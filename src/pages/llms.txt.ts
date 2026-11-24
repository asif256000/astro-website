import type { APIRoute } from 'astro';
import { PAGE_META, NAV_ORDER, SITE_URL, SCHOLAR_URL, ORCID_URL, getProfile } from '../utils/seo';

/**
 * /llms.txt - the llmstxt.org index file.
 *
 * Generated from profile.db instead of hand-maintained. The previous static
 * version had already drifted (it still advertised an embedded resume on the
 * home page, which was removed in Sept 2026); generating it means the only way
 * for it to go stale is for the site itself to be wrong.
 *
 * Keep this one short - it is a map. The prose lives in /llms-full.txt.
 */
export const GET: APIRoute = ({ site }) => {
  const origin = (site?.origin ?? SITE_URL).replace(/\/+$/, '');
  const { basic_info, education, resume } = getProfile();
  const name = basic_info?.name ?? 'Asif Iqbal Rahaman';
  const current = education[0];
  const resumePath = resume.length ? resume[0].file_path : null;

  const lines: string[] = [
    `# ${name}`,
    '',
    `> ${PAGE_META.home.description}`,
    '',
    current
      ? `Currently a ${current.degree} candidate in ${current.major} ` +
        `(${current.minor}) at ${current.institution}, ${current.location}.`
      : '',
    '',
    '## Pages',
    '',
  ];

  for (const id of NAV_ORDER) {
    const meta = PAGE_META[id];
    const url = meta.path === '/' ? `${origin}/` : `${origin}${meta.path}`;
    lines.push(`- [${meta.heading}](${url}): ${meta.description}`);
  }

  lines.push(
    '',
    '## Full content',
    '',
    `- [Complete profile as plain text](${origin}/llms-full.txt): One Markdown file with every fact on this site: bio, education, work history, skills, projects, certifications and awards.`,
  );

  if (resumePath) {
    lines.push(`- [Resume (PDF)](${origin}/${resumePath}): Current one-page resume.`);
  }

  lines.push(
    '',
    '## Contact',
    '',
    ...(basic_info?.email ? [`- Email: ${basic_info.email}`] : []),
    ...(basic_info?.location ? [`- Location: ${basic_info.location}`] : []),
    ...(basic_info?.github ? [`- GitHub: ${basic_info.github}`] : []),
    ...(basic_info?.linkedin ? [`- LinkedIn: ${basic_info.linkedin}`] : []),
    `- Google Scholar: ${SCHOLAR_URL}`,
    `- ORCID: ${ORCID_URL}`,
    '',
  );

  return new Response(lines.filter((l) => l !== undefined).join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
