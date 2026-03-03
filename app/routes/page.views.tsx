import { Table, Select } from "@navikt/ds-react";
import {
  type LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router";
import {
  getHitsPerDayByApp,
  getPageViewsByAppAndPath,
} from "~/server/analytics.repo";
import { parseRange } from "~/utils/range";
import ViewsLineChart from "~/components/ViewsLineChart";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const { from, to, label } = parseRange(url);

  const [rows, chartRows] = await Promise.all([
    getPageViewsByAppAndPath({ from, to }),
    getHitsPerDayByApp({ from, to }),
  ]);

  return {
    rows,
    chartRows,
    rangeLabel: label,
  };
};

export default function PageViewsReport() {
  const { rows, chartRows, rangeLabel } = useLoaderData<{
    rangeLabel: string;
    rows: { app: string; path: string; views: number }[];
    chartRows: { day: string; app: string; hits: number }[];
  }>();
  const appNames = Array.from(new Set(chartRows.map((row) => row.app)));

  const chartData = Array.from(
    chartRows
      .reduce<Map<string, Record<string, string | number>>>((acc, row) => {
        const existing = acc.get(row.day) ?? { day: row.day };
        existing[row.app] = row.hits;
        acc.set(row.day, existing);
        return acc;
      }, new Map())
      .values(),
  );

  const chartLines = appNames.map((app, index) => ({
    dataKey: app,
    name: app,
    stroke: ["#8884d8", "#82ca9d", "#ff7300", "#0088fe", "#00C49F", "#FFBB28"][
      index % 6
    ],
  }));

  const [params] = useSearchParams();
  const navigate = useNavigate();
  const range = params.get("range") ?? "6m";

  return (
    <div style={{ padding: 16 }}>
      <h1>Page views</h1>
      <p>{rangeLabel}</p>
      <ViewsLineChart data={chartData} xKey="day" lines={chartLines} />
      <Select
        label="Date range"
        value={range}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          next.set("range", e.target.value);
          next.delete("from");
          next.delete("to");
          navigate(`?${next.toString()}`);
        }}
      >
        <option value="today">Today</option>
        <option value="30d">Last 30 days</option>
        <option value="6m">Last 6 months</option>
      </Select>

      <Table style={{ marginTop: 16 }}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">App</Table.HeaderCell>
            <Table.HeaderCell scope="col">Path</Table.HeaderCell>
            <Table.HeaderCell scope="col" align="right">
              Views
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {rows.map((r, i) => (
            <Table.Row key={`${r.app}-${r.path}-${i}`}>
              <Table.DataCell>{r.app}</Table.DataCell>
              <Table.DataCell>{r.path}</Table.DataCell>
              <Table.DataCell align="right">{r.views}</Table.DataCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
