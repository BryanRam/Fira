import { describe, it, expect } from "bun:test";
import { validateTransition, dispatchTransitionCommand } from "./transitions";

describe("validateTransition", () => {
  it("allows todo → in-progress for engineer", () => {
    expect(validateTransition("todo", "in-progress", "engineer")).toBe(true);
  });

  it("allows todo → done for admin", () => {
    expect(validateTransition("todo", "done", "admin")).toBe(true);
  });

  it("denies todo → done for engineer", () => {
    expect(validateTransition("todo", "done", "engineer")).toBe(false);
  });

  it("allows in-progress → in-review for engineer", () => {
    expect(validateTransition("in-progress", "in-review", "engineer")).toBe(true);
  });

  it("allows in-review → done for engineer", () => {
    expect(validateTransition("in-review", "done", "engineer")).toBe(true);
  });

  it("allows in-review → in-progress for engineer", () => {
    expect(validateTransition("in-review", "in-progress", "engineer")).toBe(true);
  });

  it("allows done → in-progress for admin", () => {
    expect(validateTransition("done", "in-progress", "admin")).toBe(true);
  });

  it("denies done → in-progress for engineer", () => {
    expect(validateTransition("done", "in-progress", "engineer")).toBe(false);
  });

  it("denies invalid status combination", () => {
    expect(validateTransition("todo", "in-review", "admin")).toBe(false);
  });

  it("denies unknown from-status", () => {
    expect(validateTransition("unknown", "in-progress", "admin")).toBe(false);
  });

  it("admin can perform any allowed transition regardless of requiredRole", () => {
    expect(validateTransition("in-progress", "done", "admin")).toBe(true);
  });
});

describe("dispatchTransitionCommand", () => {
  it("returns command for valid transition", () => {
    const result = dispatchTransitionCommand("task-1", "todo", "in-progress");
    expect(result).not.toBeNull();
    expect(result?.command).toBe("field-update");
    expect(result?.taskId).toBe("task-1");
    expect(result?.fromStatus).toBe("todo");
    expect(result?.toStatus).toBe("in-progress");
  });

  it("returns null for invalid transition", () => {
    expect(dispatchTransitionCommand("task-1", "todo", "in-review")).toBeNull();
  });

  it("returns webhook command for in-review → done", () => {
    const result = dispatchTransitionCommand("task-2", "in-review", "done");
    expect(result?.command).toBe("webhook");
  });

  it("returns notification command for in-progress → in-review", () => {
    const result = dispatchTransitionCommand("task-3", "in-progress", "in-review");
    expect(result?.command).toBe("notification");
  });
});
