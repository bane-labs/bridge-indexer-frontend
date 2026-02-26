import { toast } from "sonner";

import { Button } from "./button";
import { Toaster } from "./sonner";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Toaster> = {
  title: "UI/Sonner",
  component: Toaster,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      <Button
        variant="outline"
        onClick={() =>
          toast("Event has been created", {
            description: "Sunday, December 03, 2023 at 9:00 AM",
          })
        }
        style={{ backgroundColor: "white", color: "black", border: "1px solid #e5e7eb" }}
      >
        Show Toast
      </Button>
    </div>
  ),
};

export const Success: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast.success("Success!", {
          description: "Your action was completed successfully.",
        })
      }
      style={{ backgroundColor: "white", color: "black", border: "1px solid #e5e7eb" }}
    >
      Success Toast
    </Button>
  ),
};

export const Error: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast.error("Error!", {
          description: "Something went wrong. Please try again.",
        })
      }
      style={{ backgroundColor: "white", color: "black", border: "1px solid #e5e7eb" }}
    >
      Error Toast
    </Button>
  ),
};

export const Warning: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast.warning("Warning!", {
          description: "This action might have unintended consequences.",
        })
      }
      style={{ backgroundColor: "white", color: "black", border: "1px solid #e5e7eb" }}
    >
      Warning Toast
    </Button>
  ),
};

export const Info: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast.info("Information", {
          description: "Here is some helpful information.",
        })
      }
      style={{ backgroundColor: "white", color: "black", border: "1px solid #e5e7eb" }}
    >
      Info Toast
    </Button>
  ),
};

export const WithAction: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() =>
        toast("File deleted", {
          description: "The file has been permanently deleted.",
          action: {
            label: "Undo",
            onClick: () => console.log("Undo clicked"),
          },
        })
      }
      style={{ backgroundColor: "white", color: "black", border: "1px solid #e5e7eb" }}
    >
      Toast with Action
    </Button>
  ),
};

export const PromiseToast: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => {
        toast.loading("Loading...", {
          description: "Please wait while we process your request.",
        });
      }}
      style={{ backgroundColor: "white", color: "black", border: "1px solid #e5e7eb" }}
    >
      Loading Toast
    </Button>
  ),
};
