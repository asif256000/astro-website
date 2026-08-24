// Build-time logo map: Astro optimises every PNG in src/assets/logos/
const logoMap = import.meta.glob<{ default: ImageMetadata }>('../assets/logos/*.png', { eager: true });

export const getLogo = (name: string): ImageMetadata | null =>
    logoMap[`../assets/logos/${name}.png`]?.default ?? null;

// Proportionally scale any logo to fit inside a square box — no name lists needed.
export const logoFitProps = (meta: ImageMetadata, box: number) =>
    meta.width >= meta.height ? { width: box } : { height: box };
