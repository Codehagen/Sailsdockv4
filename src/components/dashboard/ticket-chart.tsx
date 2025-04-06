"use client";

import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Define a type for our ticket distribution data
type TicketDistributionData = {
  status: string;
  low: number;
  medium: number;
  high: number;
  urgent: number;
  total: number;
};

interface TicketChartProps {
  data: TicketDistributionData[];
  totalTickets: number;
}

// Chart configuration with colors
const chartConfig = {
  low: {
    label: "Lav",
    color: "hsl(var(--chart-1))",
  },
  medium: {
    label: "Medium",
    color: "hsl(var(--chart-2))",
  },
  high: {
    label: "Høy",
    color: "hsl(var(--chart-3))",
  },
  urgent: {
    label: "Kritisk",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

// Helper to format status labels
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    unassigned: "Ikke tildelt",
    open: "Åpen",
    in_progress: "Pågår",
    waiting_on_customer: "Venter på kunde",
    waiting_on_third_party: "Venter på tredjepart",
    resolved: "Løst",
    closed: "Lukket",
  };

  return statusMap[status] || status;
};

export function TicketChart({ data, totalTickets }: TicketChartProps) {
  // Get the formatted data with translated status names
  const formattedData = data.map((item) => ({
    ...item,
    status: formatStatus(item.status),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saksfordeling</CardTitle>
        <CardDescription>
          Fordeling av saker etter status og prioritet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-[4/3]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="status"
                tickLine={false}
                axisLine={true}
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="font-medium">
                          {payload[0].payload.status}
                        </div>
                        {payload.map((entry) => (
                          <div
                            key={`item-${entry.dataKey}`}
                            className="flex items-center gap-2 text-xs"
                          >
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ background: entry.color }}
                            />
                            <span>
                              {
                                chartConfig[
                                  entry.dataKey as keyof typeof chartConfig
                                ].label
                              }
                              :
                            </span>
                            <span className="font-medium">{entry.value}</span>
                          </div>
                        ))}
                        <div className="mt-1 text-xs font-medium border-t pt-1">
                          Total: {payload[0].payload.total}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={40}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-xs">
                    {chartConfig[value as keyof typeof chartConfig].label}
                  </span>
                )}
              />
              <Bar
                dataKey="low"
                stackId="a"
                fill="var(--color-low)"
                radius={[4, 4, 0, 0]}
              />
              <Bar dataKey="medium" stackId="a" fill="var(--color-medium)" />
              <Bar dataKey="high" stackId="a" fill="var(--color-high)" />
              <Bar dataKey="urgent" stackId="a" fill="var(--color-urgent)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Totalt {totalTickets} saker
        </div>
        <div className="leading-none text-muted-foreground">
          Fordelt på status og prioritet
        </div>
      </CardFooter>
    </Card>
  );
}
