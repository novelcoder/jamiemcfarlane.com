import { notFound, permanentRedirect } from 'next/navigation';

import { canonicalSeriesRoute } from '@/lib/series-aliases';

type SeriesAliasPageProps = {
  params: Promise<{ series: string }>;
};

export default async function SeriesAliasPage({
  params,
}: SeriesAliasPageProps) {
  const { series } = await params;
  const canonicalRoute = canonicalSeriesRoute(series);

  if (!canonicalRoute) notFound();
  permanentRedirect(canonicalRoute);
}
