import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Skeleton, SkeletonText, SkeletonList } from "../skeleton";

describe("Skeleton", () => {
  it("renders with data-slot attribute", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toHaveClass("custom-class");
  });

  it("applies radius variants", () => {
    const { container } = render(<Skeleton radius="lg" />);
    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toHaveClass("rounded-lg");
  });

  it("has pulse animation class", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toHaveClass("animate-pulse");
  });
});

describe("SkeletonText", () => {
  it("renders default 3 lines", () => {
    const { container } = render(<SkeletonText />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons).toHaveLength(3);
  });

  it("renders custom number of lines", () => {
    const { container } = render(<SkeletonText lines={5} />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons).toHaveLength(5);
  });

  it("makes last line shorter", () => {
    const { container } = render(<SkeletonText lines={2} />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons[1]).toHaveClass("w-4/5");
  });

  it("applies custom line className", () => {
    const { container } = render(<SkeletonText lines={2} lineClassName="h-6" />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons[0]).toHaveClass("h-6");
  });
});

describe("SkeletonList", () => {
  it("renders default 5 items", () => {
    const { container } = render(<SkeletonList />);
    const list = container.querySelector('[data-slot="skeleton-list"]');
    expect(list?.children).toHaveLength(5);
  });

  it("renders custom number of items", () => {
    const { container } = render(<SkeletonList count={3} />);
    const list = container.querySelector('[data-slot="skeleton-list"]');
    expect(list?.children).toHaveLength(3);
  });

  it("renders custom items with renderItem", () => {
    render(
      <SkeletonList
        count={2}
        renderItem={(i) => (
          <div key={i} data-testid={`item-${i}`}>
            Custom {i}
          </div>
        )}
      />
    );
    expect(screen.getByTestId("item-0")).toBeInTheDocument();
    expect(screen.getByTestId("item-1")).toBeInTheDocument();
  });

  it("applies list variant classes", () => {
    const { container } = render(<SkeletonList variant="list" />);
    const list = container.querySelector('[data-slot="skeleton-list"]');
    expect(list).toHaveClass("space-y-3");
  });

  it("applies card variant classes", () => {
    const { container } = render(<SkeletonList variant="card" />);
    const list = container.querySelector('[data-slot="skeleton-list"]');
    expect(list).toHaveClass("grid");
  });
});
