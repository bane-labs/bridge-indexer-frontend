import { Command } from "lucide-react";

import { Kbd, KbdGroup } from "./kbd";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Kbd> = {
  title: "UI/Kbd",
  component: Kbd,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const Default: Story = {
  render: () => <Kbd>⌘</Kbd>,
};

export const WithText: Story = {
  render: () => <Kbd>Shift</Kbd>,
};

export const Group: Story = {
  render: () => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Kbd>
      <Command className="h-3 w-3" />
    </Kbd>
  ),
};

export const Shortcuts: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm">Copy:</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>C</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Paste:</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>V</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Save:</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>S</Kbd>
        </KbdGroup>
      </div>
    </div>
  ),
};
