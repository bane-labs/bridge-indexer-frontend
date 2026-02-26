import { Spinner } from "./spinner";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Spinner> = {
  title: "UI/Spinner",
  component: Spinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  render: () => <Spinner className="size-3" />,
};

export const Large: Story = {
  render: () => <Spinner className="size-8" />,
};

export const ExtraLarge: Story = {
  render: () => <Spinner className="size-12" />,
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Spinner className="size-3" />
        <span className="text-muted-foreground text-xs">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner className="size-4" />
        <span className="text-muted-foreground text-xs">Default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner className="size-8" />
        <span className="text-muted-foreground text-xs">Large</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner className="size-12" />
        <span className="text-muted-foreground text-xs">XL</span>
      </div>
    </div>
  ),
};
