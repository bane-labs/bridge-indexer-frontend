import * as React from "react";

import { Calendar } from "./calendar";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Calendar> = {
  title: "UI/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Calendar>;

function DefaultExample() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "8px" }}>
      <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
    </div>
  );
}

function RangeExample() {
  const [dateRange, setDateRange] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 7)),
  });
  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "8px" }}>
      <Calendar
        mode="range"
        selected={dateRange}
        onSelect={(range) =>
          setDateRange(range as { from: Date | undefined; to: Date | undefined })
        }
        className="rounded-md border"
        numberOfMonths={2}
      />
    </div>
  );
}

function MultipleExample() {
  const [dates, setDates] = React.useState<Date[] | undefined>([new Date()]);
  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "8px" }}>
      <Calendar
        mode="multiple"
        selected={dates}
        onSelect={setDates}
        className="rounded-md border"
      />
    </div>
  );
}

function WithoutOutsideDaysExample() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "8px" }}>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        showOutsideDays={false}
        className="rounded-md border"
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultExample />,
};

export const Range: Story = {
  render: () => <RangeExample />,
};

export const Multiple: Story = {
  render: () => <MultipleExample />,
};

export const WithoutOutsideDays: Story = {
  render: () => <WithoutOutsideDaysExample />,
};
