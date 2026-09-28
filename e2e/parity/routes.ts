export const publicRoutes = ['/', '/events', '/clubs', '/login', '/register', '/privacy', '/terms', '/support'];

export const slug = (route: string): string => (route === '/' ? 'root' : route.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-'));
