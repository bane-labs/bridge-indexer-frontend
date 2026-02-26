import { Checkbox } from "./checkbox";
import { Label } from "./label";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the checkbox is disabled",
    },
    checked: {
      control: "boolean",
      description: "Whether the checkbox is checked",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label
        htmlFor="terms"
        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Accept terms and conditions
      </Label>
    </div>
  ),
};

export const MultipleWithLabels: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="item1" defaultChecked />
        <Label htmlFor="item1">Receive notifications</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="item2" />
        <Label htmlFor="item2">Marketing emails</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="item3" disabled />
        <Label htmlFor="item3">Product updates (disabled)</Label>
      </div>
    </div>
  ),
};
