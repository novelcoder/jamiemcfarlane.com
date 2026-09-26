type SeriesRoute = {
  landing: `/${string}`;
  readingOrder?: `/${string}`;
};

const seriesRoutes = {
  'privateer-tales': {
    landing: '/PrivateerTales',
    readingOrder: '/PrivateerTales/books',
  },
  'afterwar-saga': {
    landing: '/PrivateerTales#afterwar',
  },
  'spaceship-mechanic': {
    landing: '/SpaceshipMechanic',
  },
  'junkyard-pirate': {
    landing: '/JunkyardPirate',
  },
  'crownlocked-heirs': {
    landing: '/CrownlockedHeirs',
  },
  'witchy-world': {
    landing: '/WitchyWorld',
  },
  'oldest-starfighter': {
    landing: '/ScienceFictionAdventures#oldest-starfighter',
  },
  'space-troopers': {
    landing: '/ScienceFictionAdventures#space-troopers',
  },
  'tinker-knight-adventures': {
    landing: '/ScienceFictionAdventures#tinker-knight',
  },
} as const satisfies Record<string, SeriesRoute>;

function routeForSeries(slug: string): SeriesRoute | undefined {
  return seriesRoutes[slug as keyof typeof seriesRoutes];
}

export function seriesLandingPath(slug: string) {
  return routeForSeries(slug)?.landing ?? '/';
}

export function seriesReadingOrderPath(slug: string) {
  const route = routeForSeries(slug);
  return route?.readingOrder ?? route?.landing ?? '/';
}
