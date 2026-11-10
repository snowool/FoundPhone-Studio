import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { Phone } from "../Phone";
import { validateWork, type Work } from "../schema";
import "../styles.css";
import "./player.css";
function StoryPlayer() {
  const [work, setWork] = useState<Work | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    const params = new URLSearchParams(location.search);
    const file =
      params.get("preview") === "test"
        ? "./test-work.json"
        : params.get("template") === "blank"
          ? "./blank-work.json"
          : "./work.json";
    const options = { signal: abort.signal };
    // A distinct URL bypasses Workbox's precache when this tab is controlled.
    const freshFile = navigator.serviceWorker?.controller
      ? file + "?latest=1"
      : file;
    fetch(freshFile, { ...options, cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw Error("无法获取最新作品");
        return response.json();
      })
      .catch((error) => {
        if (abort.signal.aborted || freshFile === file) throw error;
        return fetch(file, options).then((response) => {
          if (!response.ok)
            throw Error("缺少作品文件，请运行 npm run story:build");
          return response.json();
        });
      })
      .then((x) => {
        const w = validateWork(x);
        document.title =
          w.title === "捡手机" ? "捡手机" : w.title + " · 捡手机";
        setWork(w);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(String(e));
      });
    return () => abort.abort();
  }, []);
  return (
    <main className="story-runtime">
      {work ? (
        <Phone work={work} />
      ) : (
        <p role="status">{error || "正在打开手机…"}</p>
      )}
    </main>
  );
}
registerSW({ immediate: true });
createRoot(document.getElementById("root")!).render(<StoryPlayer />);
