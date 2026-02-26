import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Drawer> = {
  title: "UI/Drawer",
  component: Drawer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
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
          Open Drawer
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <p>Drawer content goes here.</p>
        </div>
        <DrawerFooter>
          <button
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "6px",
              background: "#0f172a",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Save changes
          </button>
          <DrawerClose asChild>
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
              Cancel
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
