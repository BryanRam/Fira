import { describe, it, expect } from "bun:test";
import { canCreateProject, canCreateTask, canEditTask, canManageMembers, canMoveTask } from "./permissions";

describe("canCreateTask", () => {
  it("allows admin", () => expect(canCreateTask("admin")).toBe(true));
  it("allows engineer", () => expect(canCreateTask("engineer")).toBe(true));
  it("denies read-only", () => expect(canCreateTask("read-only")).toBe(false));
});

describe("canEditTask", () => {
  it("allows admin", () => expect(canEditTask("admin")).toBe(true));
  it("allows engineer", () => expect(canEditTask("engineer")).toBe(true));
  it("denies read-only", () => expect(canEditTask("read-only")).toBe(false));
});

describe("canMoveTask", () => {
  it("allows admin", () => expect(canMoveTask("admin")).toBe(true));
  it("allows engineer", () => expect(canMoveTask("engineer")).toBe(true));
  it("denies read-only", () => expect(canMoveTask("read-only")).toBe(false));
});

describe("canManageMembers", () => {
  it("allows admin", () => expect(canManageMembers("admin")).toBe(true));
  it("denies engineer", () => expect(canManageMembers("engineer")).toBe(false));
  it("denies read-only", () => expect(canManageMembers("read-only")).toBe(false));
});

describe("canCreateProject", () => {
  it("allows admin", () => expect(canCreateProject("admin")).toBe(true));
  it("denies engineer", () => expect(canCreateProject("engineer")).toBe(false));
  it("denies read-only", () => expect(canCreateProject("read-only")).toBe(false));
});
