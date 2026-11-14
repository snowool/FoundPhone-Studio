import { expect, it } from "vitest";
import story from "../stories/template/story.json";
import { compileStory } from "./story-engine/compiler";
import { dispatch } from "./engine";
import { initialRuntime } from "./schema";
import { checklistRows } from "./checklist";
it("completes only the corresponding wedding task and retains marks after save reload", () => {
  const { work } = compileStory(story);
  const note = work.data.notes.find((item) => item.id === "wedding-todo")!;
  let state = initialRuntime(work);
  expect(checklistRows(note, state.variables)).toHaveLength(11);
  state = dispatch(work, state, "read", note.id);
  expect(checklistRows(note, state.variables).some((row) => row.done)).toBe(false);
  for (const task of checklistRows(note)) {
    state = dispatch(work, state, "variable", `wedding:${task.id}:confirmed`);
    const restored = JSON.parse(JSON.stringify(state));
    expect(checklistRows(note, restored.variables).find((row) => row.id === task.id)?.done).toBe(true);
  }
  expect(checklistRows(note, state.variables).every((row) => row.done)).toBe(true);
});
