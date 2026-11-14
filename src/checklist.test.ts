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
  const completed = (variables: typeof state.variables) =>
    checklistRows(note, variables)
      .filter((row) => row.done)
      .map((row) => row.id);
  expect(completed(state.variables)).toEqual([
    "ceremony",
    "officiant",
    "outfits",
  ]);
  state = dispatch(work, state, "read", note.id);
  expect(completed(state.variables)).toEqual([
    "ceremony",
    "officiant",
    "outfits",
  ]);
  state = dispatch(work, state, "openApp", "calendar");
  expect(completed(state.variables)).toEqual([
    "ceremony",
    "officiant",
    "outfits",
  ]);
  state = dispatch(work, state, "read", "wedding-date-november-01");
  expect(completed(state.variables)).toEqual([
    "date",
    "ceremony",
    "officiant",
    "outfits",
  ]);
  expect(completed(JSON.parse(JSON.stringify(state)).variables)).toEqual([
    "date",
    "ceremony",
    "officiant",
    "outfits",
  ]);
  for (const task of checklistRows(note)) {
    state = dispatch(work, state, "variable", `wedding:${task.id}:confirmed`);
    const restored = JSON.parse(JSON.stringify(state));
    expect(
      checklistRows(note, restored.variables).find((row) => row.id === task.id)
        ?.done,
    ).toBe(true);
  }
  expect(checklistRows(note, state.variables).every((row) => row.done)).toBe(
    true,
  );
});
