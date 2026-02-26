import { useEffect, useState } from "react";

import { Progress } from "./progress";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Progress> = {
  title: "UI/Progress",
  component: Progress,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "The progress value (0-100)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: {
    value: 33,
  },
  render: (args) => (
    <div style={{ width: "400px" }}>
      <Progress {...args} />
    </div>
  ),
};

export const Half: Story = {
  args: {
    value: 50,
  },
  render: (args) => (
    <div style={{ width: "400px" }}>
      <Progress {...args} />
    </div>
  ),
};

export const Complete: Story = {
  args: {
    value: 100,
  },
  render: (args) => (
    <div style={{ width: "400px" }}>
      <Progress {...args} />
    </div>
  ),
};

const AnimatedProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 0;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 500);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return <Progress value={progress} className="w-full" />;
};

export const Animated: Story = {
  render: () => (
    <div style={{ width: "400px" }}>
      <AnimatedProgress />
    </div>
  ),
};
