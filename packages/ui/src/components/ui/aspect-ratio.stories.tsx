import { AspectRatio } from "./aspect-ratio";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof AspectRatio> = {
  title: "UI/AspectRatio",
  component: AspectRatio,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

export const Default: Story = {
  render: () => (
    <div className="w-112.5">
      <AspectRatio ratio={16 / 9} className="bg-muted overflow-hidden rounded-md">
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
          alt="Gray abstract background"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  render: () => (
    <div className="w-75">
      <AspectRatio ratio={1} className="bg-muted overflow-hidden rounded-md">
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
          alt="Gray abstract background"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  ),
};

export const Portrait: Story = {
  render: () => (
    <div className="w-50">
      <AspectRatio ratio={3 / 4} className="bg-muted overflow-hidden rounded-md">
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
          alt="Gray abstract background"
          className="h-full w-full object-cover"
        />
      </AspectRatio>
    </div>
  ),
};
