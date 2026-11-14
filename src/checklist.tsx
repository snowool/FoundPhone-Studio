import type { Item, Runtime } from "./schema";
export function checklistRows(item: Item, variables: Runtime["variables"] = {}) {
  const ids = (item.meta.taskIds || "").split(",");
  return item.body.split("\n").filter(Boolean).map((label, index) => ({
    label,
    id: ids[index] || String(index),
    done: variables[`${item.meta.taskPrefix || item.id}:${ids[index] || index}:done`] === true,
  }));
}
export function Checklist({ item, variables = {}, compact = false }: {
  item: Item; variables?: Runtime["variables"]; compact?: boolean;
}) {
  const rows = checklistRows(item, variables);
  return <div className={compact ? "wedding-checklist compact" : "wedding-checklist"}>
    {!compact && <small className="checklist-progress">{rows.filter((row) => row.done).length} / {rows.length} 已完成</small>}
    {(compact ? rows.slice(0, 3) : rows).map((row) =>
      <div key={row.id} className={"checklist-row" + (row.done ? " completed" : "")}>
        <span role="checkbox" aria-checked={row.done} aria-readonly="true" aria-label={row.label} className="checklist-square" title="完成对应筹备操作后自动标记">{row.done ? "✓" : ""}</span>
        <span>{row.label}</span>
      </div>,
    )}
  </div>;
}
