import { formatTimestamp } from "./formatters";

test("timestamps include the local timezone instead of an unlabeled wall-clock time", () => {
  const instant = "2026-11-24T16:57:03Z";
  const timezone = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
    .formatToParts(new Date(instant))
    .find((part) => part.type === "timeZoneName")?.value;

  expect(timezone).toBeDefined();
  expect(formatTimestamp(instant)).toContain(timezone);
});
