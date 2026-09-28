export const publicRoutes = ['/clubs', '/login', '/register', '/privacy', '/terms'];

export const guestRedirects: Record<string, string> = { '/': '/login', '/events': '/login', '/support': '/login' };

export const rawRoutes = ['/', ...publicRoutes, '/support'];

export const slug = (route: string): string => (route === '/' ? 'root' : route.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-'));
