import localFont from 'next/font/local';

// Self-hosted copies of the exact files Google's CSS serves Angular (src/styles.css request, Chrome UA, fonts.gstatic.com):
// next/font/google fetches with its own UA and gets different pinned instances that render 2-3% wider, so lines wrap differently.
// Latin + Cyrillic as two families (unicode-range is unsupported by next/font/local); no adjusted fallback, or its Arial would shadow the Cyrillic file.
const interLatin = localFont({ src: './fonts/inter-latin.woff2', weight: '100 900', display: 'swap', variable: '--font-inter-latin', adjustFontFallback: false });
const interCyrillic = localFont({ src: './fonts/inter-cyrillic.woff2', weight: '100 900', display: 'swap', variable: '--font-inter-cyrillic', adjustFontFallback: false });
const playfairLatin = localFont({ src: './fonts/playfair-latin.woff2', weight: '400 900', display: 'swap', variable: '--font-playfair-latin', adjustFontFallback: false });
const playfairCyrillic = localFont({ src: './fonts/playfair-cyrillic.woff2', weight: '400 900', display: 'swap', variable: '--font-playfair-cyrillic', adjustFontFallback: false });
// Cinzel has no Cyrillic glyphs (Angular falls back to serif for them too)
const cinzel = localFont({ src: './fonts/cinzel-latin.woff2', weight: '400 900', display: 'swap', variable: '--font-cinzel', adjustFontFallback: false });

export const fontVariables = [interLatin, interCyrillic, playfairLatin, playfairCyrillic, cinzel].map((f) => f.variable).join(' ');
