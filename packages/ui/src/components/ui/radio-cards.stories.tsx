import * as React from "react";

import { RadioCards, RadioCardsDescription, RadioCardsItem, RadioCardsTitle } from "./radio-cards";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof RadioCards> = {
  title: "UI/RadioCards",
  component: RadioCards,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RadioCards>;

export const Default: Story = {
  render: () => (
    <RadioCards defaultValue="startup" className="grid-cols-2" style={{ width: "500px" }}>
      <RadioCardsItem value="startup">
        <RadioCardsTitle>Startup</RadioCardsTitle>
        <RadioCardsDescription>For small teams getting started</RadioCardsDescription>
      </RadioCardsItem>
      <RadioCardsItem value="business">
        <RadioCardsTitle>Business</RadioCardsTitle>
        <RadioCardsDescription>For growing businesses</RadioCardsDescription>
      </RadioCardsItem>
      <RadioCardsItem value="enterprise">
        <RadioCardsTitle>Enterprise</RadioCardsTitle>
        <RadioCardsDescription>For large organizations</RadioCardsDescription>
      </RadioCardsItem>
      <RadioCardsItem value="custom">
        <RadioCardsTitle>Custom</RadioCardsTitle>
        <RadioCardsDescription>Contact us for custom pricing</RadioCardsDescription>
      </RadioCardsItem>
    </RadioCards>
  ),
};

export const SingleColumn: Story = {
  render: () => (
    <RadioCards defaultValue="free" className="grid-cols-1" style={{ width: "350px" }}>
      <RadioCardsItem value="free">
        <RadioCardsTitle>Free</RadioCardsTitle>
        <RadioCardsDescription>$0/month - Basic features</RadioCardsDescription>
      </RadioCardsItem>
      <RadioCardsItem value="pro">
        <RadioCardsTitle>Pro</RadioCardsTitle>
        <RadioCardsDescription>$29/month - Advanced features</RadioCardsDescription>
      </RadioCardsItem>
      <RadioCardsItem value="team">
        <RadioCardsTitle>Team</RadioCardsTitle>
        <RadioCardsDescription>$99/month - Everything included</RadioCardsDescription>
      </RadioCardsItem>
    </RadioCards>
  ),
};

export const ThreeColumns: Story = {
  render: () => (
    <RadioCards defaultValue="small" className="grid-cols-3" style={{ width: "600px" }}>
      <RadioCardsItem value="small">
        <RadioCardsTitle>Small</RadioCardsTitle>
        <RadioCardsDescription>1-10 users</RadioCardsDescription>
      </RadioCardsItem>
      <RadioCardsItem value="medium">
        <RadioCardsTitle>Medium</RadioCardsTitle>
        <RadioCardsDescription>11-50 users</RadioCardsDescription>
      </RadioCardsItem>
      <RadioCardsItem value="large">
        <RadioCardsTitle>Large</RadioCardsTitle>
        <RadioCardsDescription>50+ users</RadioCardsDescription>
      </RadioCardsItem>
    </RadioCards>
  ),
};

function ControlledExample() {
  const [value, setValue] = React.useState("monthly");
  return (
    <div className="space-y-4" style={{ width: "400px" }}>
      <RadioCards value={value} onValueChange={setValue} className="grid-cols-2">
        <RadioCardsItem value="monthly">
          <RadioCardsTitle>Monthly</RadioCardsTitle>
          <RadioCardsDescription>Pay each month</RadioCardsDescription>
        </RadioCardsItem>
        <RadioCardsItem value="yearly">
          <RadioCardsTitle>Yearly</RadioCardsTitle>
          <RadioCardsDescription>Save 20%</RadioCardsDescription>
        </RadioCardsItem>
      </RadioCards>
      <p className="text-muted-foreground text-center text-sm">Selected: {value}</p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
};

export const Disabled: Story = {
  render: () => (
    <RadioCards defaultValue="active" className="grid-cols-2" style={{ width: "400px" }}>
      <RadioCardsItem value="active">
        <RadioCardsTitle>Active</RadioCardsTitle>
        <RadioCardsDescription>This option is available</RadioCardsDescription>
      </RadioCardsItem>
      <RadioCardsItem value="disabled" disabled>
        <RadioCardsTitle>Disabled</RadioCardsTitle>
        <RadioCardsDescription>This option is not available</RadioCardsDescription>
      </RadioCardsItem>
    </RadioCards>
  ),
};
