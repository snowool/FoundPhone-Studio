import { useEffect, useRef, useState } from "react";
import type { Item, UiValue } from "./schema";
import "./scripted-messages.css";

// Animate newly revealed messages only; opening saved history never replays it.
export function useScriptedMessages(items: Item[], thread: string, ui?: Record<string, UiValue>, onUi?: (key: string, value: UiValue) => void) {
  const initialIds = () => items.filter(i => i.meta.scriptedPlayback !== "true" || ui?.["scripted-sent-" + i.id] === true).map(i => i.id);
  const latest = useRef(items);
  latest.current = items;
  const [frame, setFrame] = useState({ thread, ids: initialIds(), text: "", active: "" });
  const progress = useRef({ id: "", step: 0 });
  if (frame.thread !== thread) {
    progress.current = { id: "", step: 0 };
    setFrame({ thread, ids: initialIds(), text: "", active: "" });
  }
  useEffect(() => {
    for (const item of items) {
      if (item.meta.scriptedPlayback === "true" && frame.ids.includes(item.id) && !ui?.["scripted-sent-" + item.id]) onUi?.("scripted-sent-" + item.id, true);
    }
  }, [frame.ids, items, ui, onUi]);
  useEffect(() => {
    if (!thread) return;
    const timer = window.setInterval(() => {
      setFrame(current => {
        if (document.hidden) return current;
        const next = latest.current.find(i => i.title === thread && i.meta.contact !== "true" && !current.ids.includes(i.id));
        if (!next) return current;
        if (!next.outgoing || next.media || !next.body) {
          return { ...current, ids: [...current.ids, next.id] };
        }
        if (progress.current.id !== next.id) progress.current = { id: next.id, step: 0 };
        progress.current.step++;
        const letters = Array.from(next.body);
        const steps = Math.min(22, Math.max(10, letters.length + 3));
        if (progress.current.step >= steps) {
          return { ...current, ids: [...current.ids, next.id], text: "", active: "" };
        }
        const count = Math.min(letters.length, Math.floor(progress.current.step / (steps - 2) * letters.length));
        return { ...current, active: next.id, text: letters.slice(0, count).join("") };
      });
    }, 80);
    return () => window.clearInterval(timer);
  }, [thread]);
  return {
    messages: items.filter(i => i.title === thread && i.meta.contact !== "true" && frame.ids.includes(i.id)),
    typing: frame.active ? { text: frame.text } : null,
  };
}

export function ScriptedKeyboard({ text }: { text: string }) {
  const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
  return <div className="scripted-keyboard" aria-label="巴基正在自动打字" role="status">
    {rows.map((row, n) => <div className="scripted-key-row" key={row}>
      {n === 2 && <span className="wide-key">⇧</span>}
      {Array.from(row).map((letter, index) => <span key={letter} className={text && (text.length % row.length === index) ? "key-lit" : ""}>{letter}</span>)}
      {n === 2 && <span className="wide-key">⌫</span>}
    </div>)}
    <div className="scripted-key-row"><span className="wide-key">123</span><span>🌐</span><span className="space-key">空格</span><span className="wide-key">发送</span></div>
  </div>;
}
