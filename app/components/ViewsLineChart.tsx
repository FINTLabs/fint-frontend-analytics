import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

type ChartDatum = Record<string, string | number>;

type LineConfig<T extends ChartDatum> = {
  dataKey: Extract<keyof T, string>;
  stroke: string;
  name?: string;
  type?: "monotone" | "linear" | "step";
};

type ViewsLineChartProps<T extends ChartDatum> = {
  data: T[];
  xKey: Extract<keyof T, string>;
  lines: Array<LineConfig<T>>;
};

export default function ViewsLineChart<T extends ChartDatum>({
  data,
  xKey,
  lines,
}: ViewsLineChartProps<T>) {
    return (
        <LineChart
            style={{ width: '100%', maxWidth: '700px', height: '100%', maxHeight: '70vh', aspectRatio: 1.618 }}
            responsive
            data={data}
            margin={{
                top: 5,
                right: 0,
                left: 0,
                bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis width="auto" />
            <Tooltip />
            <Legend />
            {lines.map((line, index) => (
              <Line
                key={`${line.dataKey}-${index}`}
                type={line.type ?? "monotone"}
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.stroke}
                activeDot={index === 0 ? { r: 8 } : undefined}
              />
            ))}
        </LineChart>
    );
}