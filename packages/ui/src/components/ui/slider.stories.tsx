import { Slider } from "./slider";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Slider> = {
  title: "UI/Slider",
  component: Slider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "object",
      description: "Default value",
    },
    max: {
      control: "number",
      description: "Maximum value",
    },
    min: {
      control: "number",
      description: "Minimum value",
    },
    step: {
      control: "number",
      description: "Step increment",
    },
    disabled: {
      control: "boolean",
      description: "Whether the slider is disabled",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: () => (
    <div className="w-100">
      <Slider defaultValue={[50]} max={100} step={1} />
    </div>
  ),
};

export const Range: Story = {
  render: () => (
    <div className="w-100">
      <Slider defaultValue={[25, 75]} max={100} step={1} />
    </div>
  ),
};

export const WithSteps: Story = {
  render: () => (
    <div className="w-100">
      <Slider defaultValue={[50]} max={100} step={10} />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="w-100">
      <Slider defaultValue={[50]} max={100} step={1} disabled />
    </div>
  ),
};
