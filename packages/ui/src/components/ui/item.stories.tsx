import { FileTextIcon, ImageIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "./item";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Item> = {
  title: "UI/Item",
  component: Item,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Item>;

export const Default: Story = {
  render: () => (
    <div style={{ width: "400px" }}>
      <Item>
        <ItemMedia variant="icon">
          <FileTextIcon className="h-5 w-5" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Document.pdf</ItemTitle>
          <ItemDescription>2.4 MB • Updated 2 hours ago</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="icon">
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </ItemActions>
      </Item>
    </div>
  ),
};

export const WithAvatar: Story = {
  render: () => (
    <div style={{ width: "400px" }}>
      <Item>
        <ItemMedia>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>John Doe</ItemTitle>
          <ItemDescription>john.doe@example.com</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  ),
};

export const WithImage: Story = {
  render: () => (
    <div style={{ width: "400px" }}>
      <Item>
        <ItemMedia variant="image">
          <img
            src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=80&h=80&fit=crop"
            alt="Landscape"
            className="h-full w-full object-cover"
          />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Nature Landscape</ItemTitle>
          <ItemDescription>Beautiful mountain scenery</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  ),
};

export const Outline: Story = {
  render: () => (
    <div style={{ width: "400px" }}>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <ImageIcon className="h-5 w-5" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Image.png</ItemTitle>
          <ItemDescription>1.2 MB • PNG Image</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="ghost" size="icon">
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </ItemActions>
      </Item>
    </div>
  ),
};

export const Small: Story = {
  render: () => (
    <div style={{ width: "400px" }}>
      <Item size="sm">
        <ItemMedia variant="icon">
          <FileTextIcon className="h-4 w-4" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Small Item</ItemTitle>
          <ItemDescription>Compact version</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <div style={{ width: "400px" }}>
      <ItemGroup>
        <Item>
          <ItemMedia variant="icon">
            <FileTextIcon className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Document 1.pdf</ItemTitle>
            <ItemDescription>2.4 MB</ItemDescription>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemMedia variant="icon">
            <FileTextIcon className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Document 2.pdf</ItemTitle>
            <ItemDescription>1.8 MB</ItemDescription>
          </ItemContent>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemMedia variant="icon">
            <ImageIcon className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Image.png</ItemTitle>
            <ItemDescription>3.1 MB</ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  ),
};

export const Clickable: Story = {
  render: () => (
    <div style={{ width: "400px" }}>
      <Item asChild>
        <button type="button">
          <ItemMedia variant="icon">
            <FileTextIcon className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Clickable Item</ItemTitle>
            <ItemDescription>Click to interact</ItemDescription>
          </ItemContent>
        </button>
      </Item>
    </div>
  ),
};
