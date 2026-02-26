import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Tooltip> = {
  title: "UI/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <button
          style={{
            padding: "8px 16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            background: "white",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Hover me
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Add to library</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithSide: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px" }}>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Top
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Tooltip on top</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Right
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Tooltip on right</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Bottom
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Tooltip on bottom</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Left
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Tooltip on left</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};
