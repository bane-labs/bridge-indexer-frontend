import { EyeIcon, EyeOffIcon, MailIcon, SearchIcon } from "lucide-react";
import * as React from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "./input-group";
import { Kbd } from "./kbd";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof InputGroup> = {
  title: "UI/InputGroup",
  component: InputGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InputGroup>;

export const Default: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <InputGroup>
        <InputGroupAddon>
          <MailIcon className="h-4 w-4" />
        </InputGroupAddon>
        <InputGroupInput placeholder="Email address" type="email" />
      </InputGroup>
    </div>
  ),
};

export const WithTextAddon: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
      </InputGroup>
    </div>
  ),
};

function PasswordInputExample() {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <div style={{ width: "300px" }}>
      <InputGroup>
        <InputGroupInput type={showPassword ? "text" : "password"} placeholder="Password" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={() => setShowPassword(!showPassword)} size="icon-xs">
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

export const WithButton: Story = {
  render: () => <PasswordInputExample />,
};

export const WithKeyboardShortcut: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon className="h-4 w-4" />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon align="inline-end">
          <Kbd>⌘K</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const WithTextarea: Story = {
  render: () => (
    <div style={{ width: "400px" }}>
      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText>Message</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea placeholder="Enter your message here..." rows={4} />
      </InputGroup>
    </div>
  ),
};

export const BlockStartAddon: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <InputGroup>
        <InputGroupAddon align="block-start">
          <InputGroupText>Label</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="Enter value..." />
      </InputGroup>
    </div>
  ),
};

export const BlockEndAddon: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <InputGroup>
        <InputGroupInput placeholder="Enter value..." />
        <InputGroupAddon align="block-end">
          <InputGroupText>Helper text</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const BothEndsAddon: Story = {
  render: () => (
    <div style={{ width: "300px" }}>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="0.00" type="number" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>USD</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};
