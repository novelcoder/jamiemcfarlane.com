export const canonicalSeriesRoutes = new Map([
  ['afterwarsaga', '/PrivateerTales#afterwar'],
  ['crownlockedheirs', '/CrownlockedHeirs'],
  ['junkyardpirate', '/JunkyardPirate'],
  ['oldeststarfighter', '/ScienceFictionAdventures#oldest-starfighter'],
  ['privateertales', '/PrivateerTales'],
  ['sciencefictionadventures', '/ScienceFictionAdventures'],
  ['spacetroopers', '/ScienceFictionAdventures#space-troopers'],
  ['spaceshipmechanic', '/SpaceshipMechanic'],
  ['tinkerknight', '/ScienceFictionAdventures#tinker-knight'],
  ['tinkerknightadventures', '/ScienceFictionAdventures#tinker-knight'],
  ['witchyworld', '/WitchyWorld'],
]);

export function normalizeSeriesRoute(value: string) {
  return value.toLocaleLowerCase('en-US').replaceAll('-', '');
}

export function canonicalSeriesRoute(value: string) {
  return canonicalSeriesRoutes.get(normalizeSeriesRoute(value));
}
