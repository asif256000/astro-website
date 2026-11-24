/**
 * Central SEO / structured-data definitions.
 *
 * Everything user-visible to a crawler that is NOT page body copy lives here:
 * per-page titles and descriptions, the canonical origin, and the schema.org
 * JSON-LD graph. Pulling it into one module means a wording change is a
 * one-line edit rather than a hunt through six page templates.
 *
 * Facts are read from profile.db wherever possible so the structured data can
 * never drift from what the pages actually render. Only things the DB does not
 * model (research-area tagline, Scholar/ORCID handles) are constants below.
 */
import { getData } from './db.js';

/** Fallback origin. `Astro.site` (astro.config.mjs) is preferred at call sites. */
export const SITE_URL = 'https://asifiqbal.xyz';

/** Short role line used in the home-page title and Person.jobTitle. */
export const ROLE = 'ML & Computational Biology Researcher';

/** Profiles not modelled in profile.db, surfaced in the footer and in sameAs. */
export const SCHOLAR_URL = 'https://scholar.google.com/citations?hl=en&user=EImUgsAAAAAJ';
export const ORCID_URL = 'https://orcid.org/0009-0008-8317-8133';

/** Research/domain topics for Person.knowsAbout, on top of the DB skill list. */
export const RESEARCH_AREAS = [
  'Machine Learning',
  'Computational Biology',
  'Bioinformatics',
  'Phylo-oncology',
  'Genomics',
  'Phylogenetics',
  'Introgression',
  'DNA Methylation',
];

export interface PageMeta {
  /** <title>; the full name is appended for every page except home. */
  title: string;
  /** Unique <meta name="description">, 120-160 chars. */
  description: string;
  /** Human label used in the breadcrumb trail and the visually-hidden <h1>. */
  heading: string;
  /**
   * Exact served route, used for canonical URLs, breadcrumbs and the llms.txt
   * index. Inner pages carry a trailing slash because Astro's directory build
   * emits `<name>/index.html` and Cloudflare Pages 308-redirects the
   * slash-free form to it. A canonical pointing at a redirect is worse than
   * useless, so this must match what the server actually serves.
   */
  path: string;
  /** Keep out of search indexes (404 only). */
  noindex?: boolean;
}

/**
 * Keyed by the `current_page` value each page already passes to BaseLayout,
 * so adding descriptions required no changes to the page templates.
 */
export const PAGE_META: Record<string, PageMeta> = {
  home: {
    title: ROLE,
    heading: 'Home',
    path: '/',
    description:
      'PhD researcher at Virginia Tech applying machine learning to phylo-oncology, genomics and bioinformatics. Former software engineer at Ericsson and Seclore.',
  },
  overview: {
    title: 'Overview',
    heading: 'Overview',
    path: '/overview/',
    description:
      "A full overview of Asif Iqbal Rahaman's background: career timeline, technical skills, projects, certifications, awards and research interests.",
  },
  experience_education: {
    title: 'Experience & Education',
    heading: 'Experience & Education',
    path: '/experience_education/',
    description:
      'Work history and academic background: a Virginia Tech PhD and MS, a BTech from VIT Vellore, and software engineering roles at Ericsson and Seclore.',
  },
  projects_certificates: {
    title: 'Projects & Certifications',
    heading: 'Projects & Certifications',
    path: '/projects_certificates/',
    description:
      'Selected projects and professional certifications spanning machine learning, bioinformatics, generative AI, computer vision and web development.',
  },
  awards_interests: {
    title: 'Awards & Interests',
    heading: 'Awards & Interests',
    path: '/awards_interests/',
    description:
      'Honors and awards earned by Asif Iqbal Rahaman, alongside personal interests and a photo gallery from travel, hiking and photography.',
  },
  resume: {
    title: 'Resume & Blog',
    heading: 'Resume & Blog',
    path: '/resume/',
    description:
      "Download Asif Iqbal Rahaman's latest resume as a PDF, and read recent posts from his personal blog on research, engineering and side projects.",
  },
  not_found: {
    title: 'Page Not Found',
    heading: 'Page not found',
    path: '/404',
    noindex: true,
    description:
      "That page doesn't exist. It may have moved, or the link may be wrong. Head back to the home page to keep browsing.",
  },
};

/** Pages in nav order; drives the sitemap and the llms.txt page index. */
export const NAV_ORDER = [
  'home',
  'overview',
  'experience_education',
  'projects_certificates',
  'awards_interests',
  'resume',
] as const;

/** Strip `www.` so sameAs entries match the canonical profile URLs. */
const normalizeUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  return url.replace(/^(https?:\/\/)www\./i, '$1').replace(/\/+$/, '');
};

/** One profile.db read, reused by the layout, sitemap and llms endpoints. */
export function getProfile() {
  return getData({
    education: 'SELECT * FROM education WHERE fk_user = ? ORDER BY duration_start DESC',
    experience: 'SELECT * FROM experience WHERE fk_user = ? ORDER BY duration_start DESC',
    skills: 'SELECT DISTINCT skill FROM skills WHERE fk_user = ? ORDER BY skill',
    projects: 'SELECT * FROM projects WHERE fk_user = ?',
    certifications: 'SELECT * FROM certifications WHERE fk_user = ?',
    honors_and_awards: 'SELECT * FROM honors_and_awards WHERE fk_user = ?',
    resume: 'SELECT * FROM resume WHERE fk_user = ? AND is_latest = 1',
  });
}

interface SchemaArgs {
  pageId: string;
  /** Absolute canonical URL of the page being rendered. */
  canonical: string;
  /** Site origin, no trailing slash. */
  origin: string;
  /** Absolute URL of the social/profile image. */
  imageUrl: string;
  /** Pre-fetched profile.db data, so one page render makes one DB read. */
  profile: ReturnType<typeof getProfile>;
}

/**
 * Build the schema.org JSON-LD @graph for a page.
 *
 * A single @graph with stable @ids (rather than separate <script> blocks) lets
 * consumers resolve one Person node that every page points at, which is what
 * Google and the LLM crawlers use to tie the pages to one identity.
 *
 * Deliberately omits `telephone`: the number is already a tel: link on
 * /overview, and there is no reason to also hand it to bulk scrapers.
 */
export function buildSchemaGraph({ pageId, canonical, origin, imageUrl, profile }: SchemaArgs) {
  const { basic_info, education, experience, skills } = profile;
  const meta = PAGE_META[pageId] ?? PAGE_META.home;
  const name = basic_info?.name ?? 'Asif Iqbal Rahaman';

  const personId = `${origin}/#person`;
  const websiteId = `${origin}/#website`;

  const sameAs = [
    normalizeUrl(basic_info?.linkedin),
    normalizeUrl(basic_info?.github),
    SCHOLAR_URL,
    ORCID_URL,
  ].filter((u): u is string => Boolean(u));

  // Most recent education row is the current degree in progress.
  const current = education[0];
  const person: Record<string, unknown> = {
    '@type': 'Person',
    '@id': personId,
    name,
    alternateName: 'Asif Iqbal',
    url: `${origin}/`,
    image: imageUrl,
    jobTitle: current ? `PhD Researcher, ${current.major}` : ROLE,
    description: PAGE_META.home.description,
    knowsAbout: [...RESEARCH_AREAS, ...skills.map((s: { skill: string }) => s.skill)],
    sameAs,
  };

  if (basic_info?.email) person.email = `mailto:${basic_info.email}`;

  if (basic_info?.location) {
    // "Blacksburg, VA, USA" -> structured PostalAddress.
    const [city, region, country] = basic_info.location.split(',').map((p: string) => p.trim());
    person.address = {
      '@type': 'PostalAddress',
      ...(city && { addressLocality: city }),
      ...(region && { addressRegion: region }),
      ...(country && { addressCountry: country }),
    };
  }

  if (education.length) {
    // Multiple degrees from one school (PhD + MS at Virginia Tech) must collapse
    // to a single alumniOf node, or consumers read it as two organisations.
    const seen = new Set<string>();
    person.alumniOf = education
      .filter((e: Record<string, string>) => {
        if (!e.institution || seen.has(e.institution)) return false;
        seen.add(e.institution);
        return true;
      })
      .map((e: Record<string, string>) => ({
        '@type': 'EducationalOrganization',
        name: e.institution,
        ...(e.institution_link && { url: e.institution_link }),
      }));
  }

  if (current?.institution) {
    person.affiliation = {
      '@type': 'EducationalOrganization',
      name: current.institution,
      ...(current.institution_link && { url: current.institution_link }),
    };
  }

  // schema.org `worksFor` is the CURRENT employer, not an employment history -
  // listing every past role (down to a 2018 internship) misrepresents it. Emit
  // it only for a role with no end date or one still in the future; otherwise
  // `affiliation` above already carries the current institution. Past roles are
  // conveyed by the /experience_education page and /llms-full.txt.
  const currentRoles = experience.filter(
    (e: Record<string, string>) => !e.duration_end || new Date(e.duration_end) > new Date(),
  );
  if (currentRoles.length) {
    person.worksFor = currentRoles.map((e: Record<string, string>) => ({
      '@type': 'Organization',
      name: e.company,
      ...(e.company_link && { url: e.company_link }),
    }));
  }

  const graph: Record<string, unknown>[] = [
    person,
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: `${origin}/`,
      name: `${name} Profile`,
      description: PAGE_META.home.description,
      inLanguage: 'en-US',
      publisher: { '@id': personId },
    },
    {
      // ProfilePage is the correct type for the page that *is* the person.
      '@type': pageId === 'home' ? 'ProfilePage' : 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: meta.title,
      description: meta.description,
      isPartOf: { '@id': websiteId },
      about: { '@id': personId },
      inLanguage: 'en-US',
      ...(pageId === 'home' && { mainEntity: { '@id': personId } }),
    },
  ];

  // Breadcrumbs only make sense below the root.
  if (pageId !== 'home' && !meta.noindex) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: meta.heading, item: canonical },
      ],
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

interface PageSeoArgs {
  /** `current_page` as passed to BaseLayout; keys into PAGE_META. */
  pageId: string;
  /** `Astro.site` - the configured origin. */
  site: URL | undefined;
  /** Build-time hashed path to the social image (e.g. /_astro/image.hash.png). */
  imagePath: string;
  /** Optional per-page overrides. */
  overrides?: { title?: string; description?: string };
}

/**
 * Everything the <head> needs, from one profile.db read.
 *
 * The canonical URL is built from the *configured* origin plus the current
 * pathname - never from Astro.url.origin. That is what makes the canonical
 * hostname-independent: the same HTML served from asifiqbal.xyz and from the
 * project's .pages.dev twin both point search engines at asifiqbal.xyz.
 */
export function getPageSeo({ pageId, site, imagePath, overrides }: PageSeoArgs) {
  const origin = (site?.origin ?? SITE_URL).replace(/\/+$/, '');
  const meta = PAGE_META[pageId] ?? PAGE_META.home;
  const profile = getProfile();
  const name = profile.basic_info?.name ?? 'Asif Iqbal Rahaman';

  const canonical = `${origin}${meta.path}`;
  const imageUrl = `${origin}${imagePath}`;

  // Home leads with the name (that is what people search); inner pages lead
  // with the section and carry the name as the suffix.
  const defaultTitle = pageId === 'home' ? `${name} | ${meta.title}` : `${meta.title} | ${name}`;
  const title = overrides?.title ?? defaultTitle;
  const description = overrides?.description ?? meta.description;

  return {
    title,
    description,
    canonical,
    imageUrl,
    origin,
    name,
    heading: meta.heading,
    noindex: meta.noindex ?? false,
    profile,
    schema: buildSchemaGraph({ pageId, canonical, origin, imageUrl, profile }),
  };
}
