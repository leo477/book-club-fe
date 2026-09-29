import { Cinzel, Inter, Playfair_Display } from 'next/font/google';

// Same families, weights and subsets the Angular app requests from Google Fonts (src/styles.css), but self-hosted.
const inter = Inter({ subsets: ['latin', 'cyrillic'], weight: ['300', '400', '500', '600', '700'], display: 'swap', variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin', 'cyrillic'], weight: ['400', '600', '700'], display: 'swap', variable: '--font-playfair' });
// Cinzel has no Cyrillic glyphs (Angular falls back to serif for them too)
const cinzel = Cinzel({ subsets: ['latin'], weight: ['700', '900'], display: 'swap', variable: '--font-cinzel' });

export const fontVariables = `${inter.variable} ${playfair.variable} ${cinzel.variable}`;
