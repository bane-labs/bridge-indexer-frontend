import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof RadioGroup> = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="comfortable">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  ),
};

export const Form: Story = {
  render: () => (
    <div className="space-y-3">
      <Label>Choose a shipping method</Label>
      <RadioGroup defaultValue="standard">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="standard" id="standard" />
          <Label htmlFor="standard">Standard Shipping - Free</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="express" id="express" />
          <Label htmlFor="express">Express Shipping - $9.99</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="overnight" id="overnight" />
          <Label htmlFor="overnight">Overnight Shipping - $24.99</Label>
        </div>
      </RadioGroup>
    </div>
  ),
};
