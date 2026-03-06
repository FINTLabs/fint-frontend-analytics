import type {Route} from "./+types/home";
import {VStack} from "@navikt/ds-react";
import {useLoaderData} from "react-router";
import {getLatestEvents, getPageViewsByDayByApp} from "~/server/analytics.repo";
import type {AnalyticsEvent, PageViewsByDayAppRow} from "~/types/analytics";
import EventsTable from "~/components/EventsTable";
import SimpleBarChart from "~/components/SimpleBarChart";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Novari Analytics" },
    { name: "description", content: "Novari Analytics" },
  ];
}

export const loader = async () => {
  const now = new Date();
  const to = new Date(now);
  to.setHours(0, 0, 0, 0);
  to.setDate(to.getDate() + 1);
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - 29);

  const [rows, chartRows] = await Promise.all([
    getLatestEvents(50),
    getPageViewsByDayByApp({ from, to }),
  ]);

  return { rows, chartRows };
};

export default function Home() {
  const { rows, chartRows } = useLoaderData<{
    rows: AnalyticsEvent[];
    chartRows: PageViewsByDayAppRow[];
  }>();

  return (
    <>
      <h1>Latest events</h1>

      <VStack gap="space-24" marginBlock="space-24">
        <SimpleBarChart rows={chartRows} />

        <EventsTable events={rows} emptyMessage="No events yet" />
      </VStack>
    </>
  );
}
