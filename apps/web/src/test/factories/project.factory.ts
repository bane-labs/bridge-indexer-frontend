/**
 * Project Factory
 *
 * Factory for generating test project data.
 * Adjust this based on actual Atlas domain objects.
 */

import { Factory } from "fishery";

/**
 * Project type (example domain object for Atlas)
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "archived";
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// Predefined project names for deterministic testing
const projectNames = [
  "Apollo Project",
  "Atlas Initiative",
  "Phoenix Program",
  "Titan Platform",
  "Orion System",
  "Neptune Service",
  "Jupiter Framework",
  "Saturn Application",
];

const projectDescriptions = [
  "Enterprise platform modernization",
  "Cloud migration initiative",
  "Digital transformation program",
  "API integration platform",
  "Data analytics framework",
  "Customer portal application",
  "Internal tools system",
  "Performance optimization project",
];

/**
 * Project factory for generating test project data.
 *
 * @example
 * ```ts
 * const project = projectFactory.build();
 * const activeProject = projectFactory.build({ status: 'active' });
 * const projects = projectFactory.buildList(3);
 * ```
 */
export const projectFactory = Factory.define<Project>(({ sequence }) => {
  const baseDate = new Date("2024-01-01T00:00:00Z");
  const statuses: ("active" | "inactive" | "archived")[] = ["active", "inactive", "archived"];

  return {
    id: `project-${sequence}`,
    name: projectNames[sequence % projectNames.length]!,
    description: projectDescriptions[sequence % projectDescriptions.length]!,
    status: statuses[sequence % statuses.length]!,
    ownerId: `user-${sequence}`,
    createdAt: new Date(baseDate.getTime() + sequence * 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(baseDate.getTime() + sequence * 1000 * 60 * 60 * 24).toISOString(),
  };
});

/**
 * Preset: Active project
 */
export const activeProjectFactory = projectFactory.params({
  status: "active" as const,
});

/**
 * Preset: Archived project
 */
export const archivedProjectFactory = projectFactory.params({
  status: "archived" as const,
});
