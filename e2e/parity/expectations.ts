export interface RouteExpectation {
  title: RegExp;
  description: RegExp;
  jsonLd: string[];
  /** where the route lands when it redirects before rendering (default: the route itself) */
  landsOn?: string;
}

const anyLd: string[] = [];

export const nextExpectations: Record<string, RouteExpectation> = {
  '/': { title: /Події/, description: /клуб/i, jsonLd: anyLd, landsOn: '/events' },
  '/clubs': { title: /Книжкові клуби/, description: /клуб/i, jsonLd: anyLd },
  '/login': { title: /Вхід/, description: /.{20,}/, jsonLd: anyLd },
  '/register': { title: /Реєстрація/, description: /.{20,}/, jsonLd: anyLd },
  '/privacy': { title: /конфіденційн/i, description: /.{20,}/, jsonLd: anyLd },
  '/terms': { title: /умови|Угода/i, description: /.{20,}/, jsonLd: anyLd },
  '/support': { title: /Підтримка/i, description: /.{20,}/, jsonLd: anyLd },
};

export const expectations: Record<string, Record<string, RouteExpectation>> = {
  next: nextExpectations,
};
