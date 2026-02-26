import { Bar, BarChart, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof ChartContainer> = {
  title: "UI/Chart",
  component: ChartContainer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChartContainer>;

const barChartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const barChartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(221, 83%, 53%)",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(262, 83%, 58%)",
  },
} satisfies ChartConfig;

export const BarChartExample: Story = {
  render: () => (
    <ChartContainer config={barChartConfig} className="h-75 w-125">
      <BarChart accessibilityLayer data={barChartData}>
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
};

const lineChartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const lineChartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(221, 83%, 53%)",
  },
} satisfies ChartConfig;

export const LineChartExample: Story = {
  render: () => (
    <ChartContainer config={lineChartConfig} className="h-75 w-125">
      <LineChart
        accessibilityLayer
        data={lineChartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Line
          dataKey="desktop"
          type="natural"
          stroke="var(--color-desktop)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  ),
};

const stackedData = [
  { month: "January", desktop: 186, mobile: 80, tablet: 45 },
  { month: "February", desktop: 305, mobile: 200, tablet: 100 },
  { month: "March", desktop: 237, mobile: 120, tablet: 80 },
  { month: "April", desktop: 73, mobile: 190, tablet: 60 },
  { month: "May", desktop: 209, mobile: 130, tablet: 90 },
  { month: "June", desktop: 214, mobile: 140, tablet: 70 },
];

const stackedConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(221, 83%, 53%)",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(262, 83%, 58%)",
  },
  tablet: {
    label: "Tablet",
    color: "hsl(142, 71%, 45%)",
  },
} satisfies ChartConfig;

export const StackedBarChart: Story = {
  render: () => (
    <ChartContainer config={stackedConfig} className="h-75 w-125">
      <BarChart accessibilityLayer data={stackedData}>
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" stackId="a" fill="var(--color-desktop)" radius={[0, 0, 4, 4]} />
        <Bar dataKey="mobile" stackId="a" fill="var(--color-mobile)" radius={[0, 0, 0, 0]} />
        <Bar dataKey="tablet" stackId="a" fill="var(--color-tablet)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  ),
};
