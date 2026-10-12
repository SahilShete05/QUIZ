import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const CHART_COLORS = [
  '#8bf0cf',
  '#8bb8ff',
  '#c4a7ff',
  '#ffc58b',
  '#ff9da8',
  '#82d9e8',
];

function EmptyChart({ message }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-[var(--border)] px-6 text-center text-sm text-[var(--text-muted)]">
      {message}
    </div>
  );
}

export default function AnalyticsChart({
  title,
  description,
  data = [],
  type = 'line',
  xKey = 'date',
  series = [],
  nameKey = 'name',
  valueKey = 'value',
  height = 300,
  emptyMessage = 'No analytics data is available for this period.',
}) {
  const hasData = Array.isArray(data) && data.length > 0;

  const hasSeriesData =
    type === 'pie'
      ? data.some((item) => Number(item?.[valueKey]) > 0)
      : series.some((item) =>
          data.some((row) => Number.isFinite(Number(row?.[item.dataKey]))),
        );

  const tooltipStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
  };

  return (
    <section className="glass-panel min-w-0 rounded-2xl p-5 sm:p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {description}
          </p>
        )}
      </div>

      {!hasData || !hasSeriesData ? (
        <EmptyChart message={emptyMessage} />
      ) : (
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart
                data={data}
                margin={{ top: 8, right: 8, left: -16, bottom: 8 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey={xKey}
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip contentStyle={tooltipStyle} />
                <Legend />

                {series.map((item, index) => (
                  <Bar
                    key={item.dataKey}
                    dataKey={item.dataKey}
                    name={item.label || item.dataKey}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    radius={[5, 5, 0, 0]}
                    maxBarSize={48}
                  />
                ))}
              </BarChart>
            ) : type === 'pie' ? (
              <PieChart>
                <Pie
                  data={data}
                  dataKey={valueKey}
                  nameKey={nameKey}
                  cx="50%"
                  cy="50%"
                  outerRadius="78%"
                  innerRadius="48%"
                  paddingAngle={3}
                >
                  {data.map((item, index) => (
                    <Cell
                      key={`${item[nameKey]}-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            ) : (
              <LineChart
                data={data}
                margin={{ top: 8, right: 8, left: -16, bottom: 8 }}
              >
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey={xKey}
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip contentStyle={tooltipStyle} />
                <Legend />

                {series.map((item, index) => (
                  <Line
                    key={item.dataKey}
                    type="monotone"
                    dataKey={item.dataKey}
                    name={item.label || item.dataKey}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}