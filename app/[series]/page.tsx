import { notFound, permanentRedirect } from 'next/navigation';

type SeriesAliasPageProps = {
  params: Promise<{ series: string }>;
};

const canonicalSeriesRoutes = new Map([
  ['junkyardpirate', '/JunkyardPirate'],
  ['privateertales', '/PrivateerTales'],
  ['spaceshipmechanic', '/SpaceshipMechanic'],
]);

function normalizeSeriesRoute(value: string) {
  return value.toLocaleLowerCase('en-US').replaceAll('-', '');
}

export default async function SeriesAliasPage({
  params,
}: SeriesAliasPageProps) {
  const { series } = await params;
  const canonicalRoute = canonicalSeriesRoutes.get(
    normalizeSeriesRoute(series),
  );

  if (!canonicalRoute) notFound();
  permanentRedirect(canonicalRoute);
}
