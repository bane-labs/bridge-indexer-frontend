import { FileIcon, InboxIcon, PlusIcon, SearchIcon } from "lucide-react";

import { Button } from "./button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Empty> = {
  title: "UI/Empty",
  component: Empty,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Empty>;

export const Default: Story = {
  render: () => (
    <div style={{ width: "500px" }}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <InboxIcon className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>No messages</EmptyTitle>
          <EmptyDescription>
            You don&apos;t have any messages yet. Start a conversation to see them here.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Message
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  ),
};

export const NoResults: Story = {
  render: () => (
    <div style={{ width: "500px" }}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchIcon className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>No results found</EmptyTitle>
          <EmptyDescription>
            We couldn&apos;t find any items matching your search. Try adjusting your filters.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  ),
};

export const NoFiles: Story = {
  render: () => (
    <div style={{ width: "500px" }}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileIcon className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>No files uploaded</EmptyTitle>
          <EmptyDescription>
            Get started by uploading your first file. Drag and drop or click the button below.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline">Upload File</Button>
        </EmptyContent>
      </Empty>
    </div>
  ),
};

export const WithImage: Story = {
  render: () => (
    <div style={{ width: "500px" }}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <img
              src="https://illustrations.popsy.co/gray/crashed-error.svg"
              alt="No data"
              className="h-32 w-32"
            />
          </EmptyMedia>
          <EmptyTitle>No data available</EmptyTitle>
          <EmptyDescription>
            There&apos;s nothing to display right now. Check back later or add some data.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  ),
};

export const Simple: Story = {
  render: () => (
    <div style={{ width: "400px" }}>
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>Empty state</EmptyTitle>
          <EmptyDescription>
            This is a simple empty state without an icon or action.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  ),
};
