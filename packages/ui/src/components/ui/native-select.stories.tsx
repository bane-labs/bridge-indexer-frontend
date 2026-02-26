import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "./native-select";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof NativeSelect> = {
  title: "UI/NativeSelect",
  component: NativeSelect,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NativeSelect>;

export const Default: Story = {
  render: () => (
    <NativeSelect>
      <NativeSelectOption value="">Select an option</NativeSelectOption>
      <NativeSelectOption value="option1">Option 1</NativeSelectOption>
      <NativeSelectOption value="option2">Option 2</NativeSelectOption>
      <NativeSelectOption value="option3">Option 3</NativeSelectOption>
    </NativeSelect>
  ),
};

export const WithOptGroups: Story = {
  render: () => (
    <NativeSelect>
      <NativeSelectOption value="">Select a fruit</NativeSelectOption>
      <NativeSelectOptGroup label="Citrus">
        <NativeSelectOption value="orange">Orange</NativeSelectOption>
        <NativeSelectOption value="lemon">Lemon</NativeSelectOption>
        <NativeSelectOption value="grapefruit">Grapefruit</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Berries">
        <NativeSelectOption value="strawberry">Strawberry</NativeSelectOption>
        <NativeSelectOption value="blueberry">Blueberry</NativeSelectOption>
        <NativeSelectOption value="raspberry">Raspberry</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  ),
};

export const Small: Story = {
  render: () => (
    <NativeSelect size="sm">
      <NativeSelectOption value="">Select size</NativeSelectOption>
      <NativeSelectOption value="xs">Extra Small</NativeSelectOption>
      <NativeSelectOption value="sm">Small</NativeSelectOption>
      <NativeSelectOption value="md">Medium</NativeSelectOption>
      <NativeSelectOption value="lg">Large</NativeSelectOption>
    </NativeSelect>
  ),
};

export const Disabled: Story = {
  render: () => (
    <NativeSelect disabled>
      <NativeSelectOption value="">Disabled select</NativeSelectOption>
      <NativeSelectOption value="option1">Option 1</NativeSelectOption>
      <NativeSelectOption value="option2">Option 2</NativeSelectOption>
    </NativeSelect>
  ),
};

export const WithDefaultValue: Story = {
  render: () => (
    <NativeSelect defaultValue="option2">
      <NativeSelectOption value="option1">Option 1</NativeSelectOption>
      <NativeSelectOption value="option2">Option 2 (Default)</NativeSelectOption>
      <NativeSelectOption value="option3">Option 3</NativeSelectOption>
    </NativeSelect>
  ),
};
