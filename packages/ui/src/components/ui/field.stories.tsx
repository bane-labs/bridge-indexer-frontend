import { Checkbox } from "./checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "./field";
import { Input } from "./input";
import { RadioGroup, RadioGroupItem } from "./radio-group";

import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Field> = {
  title: "UI/Field",
  component: Field,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Field>;

export const Default: Story = {
  render: () => (
    <div style={{ width: "400px" }}>
      <Field>
        <FieldContent>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="Enter your email" />
          <FieldDescription>We&apos;ll never share your email.</FieldDescription>
        </FieldContent>
      </Field>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div style={{ width: "400px" }}>
      <Field data-invalid>
        <FieldContent>
          <FieldLabel htmlFor="email-error">Email</FieldLabel>
          <Input id="email-error" type="email" placeholder="Enter your email" aria-invalid />
          <FieldError>Please enter a valid email address.</FieldError>
        </FieldContent>
      </Field>
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div style={{ width: "500px" }}>
      <Field orientation="horizontal">
        <FieldContent className="w-32">
          <FieldTitle>Username</FieldTitle>
          <FieldDescription>Choose a unique username.</FieldDescription>
        </FieldContent>
        <FieldContent>
          <Input placeholder="username" />
        </FieldContent>
      </Field>
    </div>
  ),
};

export const FieldSetExample: Story = {
  render: () => (
    <div style={{ width: "400px" }}>
      <FieldSet>
        <FieldLegend>Personal Information</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldContent>
              <FieldLabel htmlFor="first-name">First Name</FieldLabel>
              <Input id="first-name" placeholder="John" />
            </FieldContent>
          </Field>
          <Field>
            <FieldContent>
              <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
              <Input id="last-name" placeholder="Doe" />
            </FieldContent>
          </Field>
          <Field>
            <FieldContent>
              <FieldLabel htmlFor="field-email">Email</FieldLabel>
              <Input id="field-email" type="email" placeholder="john@example.com" />
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  ),
};

export const WithSeparator: Story = {
  render: () => (
    <div style={{ width: "400px" }}>
      <FieldSet>
        <FieldLegend>Account Settings</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldContent>
              <FieldLabel htmlFor="sep-username">Username</FieldLabel>
              <Input id="sep-username" placeholder="username" />
            </FieldContent>
          </Field>
          <FieldSeparator>or</FieldSeparator>
          <Field>
            <FieldContent>
              <FieldLabel htmlFor="sep-email">Email</FieldLabel>
              <Input id="sep-email" type="email" placeholder="email@example.com" />
            </FieldContent>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div style={{ width: "400px" }}>
      <Field>
        <div className="flex items-center gap-2">
          <Checkbox id="terms" />
          <FieldLabel htmlFor="terms">Accept terms and conditions</FieldLabel>
        </div>
        <FieldDescription className="ml-6">
          You agree to our Terms of Service and Privacy Policy.
        </FieldDescription>
      </Field>
    </div>
  ),
};

/**
 * Choice Card - This is how shadcn/ui creates card-style radio selection.
 * Instead of a custom RadioCards component, they use FieldLabel wrapping
 * a Field with RadioGroupItem and FieldContent.
 */
export const ChoiceCard: Story = {
  render: () => (
    <div style={{ width: "400px" }}>
      <FieldGroup>
        <FieldSet>
          <FieldLabel htmlFor="compute-environment">Compute Environment</FieldLabel>
          <FieldDescription>Select the compute environment for your cluster.</FieldDescription>
          <RadioGroup defaultValue="kubernetes">
            <FieldLabel htmlFor="kubernetes">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Kubernetes</FieldTitle>
                  <FieldDescription>
                    Run GPU workloads on a K8s configured cluster.
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem value="kubernetes" id="kubernetes" />
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor="vm">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Virtual Machine</FieldTitle>
                  <FieldDescription>
                    Access a VM configured cluster to run GPU workloads.
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem value="vm" id="vm" />
              </Field>
            </FieldLabel>
          </RadioGroup>
        </FieldSet>
      </FieldGroup>
    </div>
  ),
};

/**
 * Choice Card Grid - Multiple choice cards in a grid layout
 */
export const ChoiceCardGrid: Story = {
  render: () => (
    <div style={{ width: "500px" }}>
      <FieldGroup>
        <FieldSet>
          <FieldLabel>Subscription Plan</FieldLabel>
          <FieldDescription>Choose your subscription plan.</FieldDescription>
          <RadioGroup defaultValue="plus" className="grid grid-cols-2 gap-2">
            <FieldLabel htmlFor="plus">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Plus</FieldTitle>
                  <FieldDescription className="text-xs">For individuals</FieldDescription>
                </FieldContent>
                <RadioGroupItem value="plus" id="plus" />
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor="pro">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Pro</FieldTitle>
                  <FieldDescription className="text-xs">For small teams</FieldDescription>
                </FieldContent>
                <RadioGroupItem value="pro" id="pro" />
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor="enterprise">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Enterprise</FieldTitle>
                  <FieldDescription className="text-xs">For large teams</FieldDescription>
                </FieldContent>
                <RadioGroupItem value="enterprise" id="enterprise" />
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor="custom">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Custom</FieldTitle>
                  <FieldDescription className="text-xs">Contact us</FieldDescription>
                </FieldContent>
                <RadioGroupItem value="custom" id="custom" />
              </Field>
            </FieldLabel>
          </RadioGroup>
        </FieldSet>
      </FieldGroup>
    </div>
  ),
};
