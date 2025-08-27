import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Card } from "@/components/ui/card";

interface RiskChartProps {
  data: Array<{ fxRate: number; pnl: number; hedgedPnl: number }>;
  title: string;
  height?: number;
}

export function RiskChart({ data, title, height = 300 }: RiskChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-elegant">
          <p className="text-sm text-muted-foreground mb-2">
            FX Rate: <span className="text-foreground font-medium">{label?.toFixed(4)}</span>
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-medium">${entry.value?.toFixed(2)}M</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-card shadow-elegant border-border/50 p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="fxRate" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.toFixed(3)}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="pnl"
            stroke="rgb(239 68 68)"
            strokeWidth={3}
            dot={false}
            name="Unhedged P&L"
          />
          <Line
            type="monotone"
            dataKey="hedgedPnl"
            stroke="hsl(var(--profit))"
            strokeWidth={3}
            dot={false}
            name="Hedged P&L"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

interface DistributionChartProps {
  data: Array<{ scenario: string; probability: number; loss: number }>;
  title: string;
  height?: number;
}

export function DistributionChart({ data, title, height = 300 }: DistributionChartProps) {
  return (
    <Card className="bg-gradient-card shadow-elegant border-border/50 p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="scenario" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <Tooltip 
            formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Probability']}
            labelFormatter={(label) => `Scenario: ${label}`}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Area
            type="monotone"
            dataKey="probability"
            stroke="hsl(var(--primary))"
            fill="url(#gradient)"
            fillOpacity={0.6}
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}