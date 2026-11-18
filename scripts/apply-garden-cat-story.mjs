import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const source = "stories/template/story.json";
const base = JSON.parse(
  execFileSync("git", ["show", `da2b604:${source}`], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  }),
);

base.revision = 34;
const messages = [
  ["garden-bucky-see-venue", "bucky❤️", "那我下班和yelena去看一下场地", { composeTrigger: "true", nextTyping: "辛苦了buck，等你回家🤧" }],
  ["garden-steve-wait", "Steve Rogers", "辛苦了buck，等你回家🤧", {}, true],
  ["garden-bucky-garble", "bucky❤️", "sjcoqhdkcochshcjcjdlsbjd", { composeTrigger: "true", nextTyping: "怎么了" }],
  ["garden-steve-whats-wrong", "Steve Rogers", "怎么了", {}, true],
  ["yelena-alert", "yelena", "cap，出事了", { composeTrigger: "true", nextTyping: "bucky怎么回事，你在他身边吗" }],
  ["yelena-steve-where-bucky", "Steve Rogers", "bucky怎么回事，你在他身边吗", { autoNextTyping: "我马上到", autoDelayMs: "1000" }, true],
  ["yelena-steve-coming", "Steve Rogers", "我马上到", {}, true],
  ["yelena-bucky-cat", "yelena", "bucky变成猫了！！", {}],
  ["yelena-snake-story", "yelena", "我们在花园看到一条黑色的小蛇，bucky想把他弄走，那条蛇突然变成绿光包住了他", { composeTrigger: "true", nextTyping: "？！" }],
  ["yelena-steve-question", "Steve Rogers", "？！", {}, true],
  ["thor-wedding-1", "Thor", "吾友，新婚快乐🥳", {}],
  ["thor-wedding-2", "Thor", "loki和我今天专门前往中庭送上祝福", {}],
  ["thor-wedding-3", "Thor", "我弟弟说他给你送来惊喜礼物😏", {}],
];
const oldIds = new Set(messages.map(([id]) => id));
const gardenMessages = messages.map(([id, sender, body, meta, outgoing]) => ({
  id,
  title: id.startsWith("thor") ? "Thor" : id.startsWith("yelena") ? "yelena" : "bucky❤️",
  sender,
  kind: "text",
  body,
  time: "2026-10-25 09:35",
  hidden: true,
  ...(outgoing ? { outgoing: true } : {}),
  meta: id.startsWith("garden") ? { pinned: "true", ...meta } : meta,
}));
if (!base.content.wechat.some((item) => item.id === "wedding-venue-question")) {
  throw new Error("Wedding venue question is missing");
}
base.content.wechat = base.content.wechat.filter((item) => !oldIds.has(item.id));
const insertionIndex = base.content.wechat.findIndex(
  (item) => item.id === "wedding-venue-question",
);
base.content.wechat.splice(insertionIndex + 1, 0, ...gardenMessages);

const unlock = (key) => ({ type: "unlock", key, value: true });
const cond = (key) => [{ key: `unlocked:${key}`, op: "eq", value: true }];
const event = (id, label, trigger, key, conditions = [], next = [], delayMs) => ({
  id, label, event: "compose", target: trigger, once: true, conditions,
  actions: Array.isArray(key) ? key : [unlock(key)], ...(next.length ? { next } : {}),
  ...(delayMs ? { type: "delay", delayMs } : {}),
});
const sequence = [
  { id: "garden-choice-bucky-venue", label: "选择花园婚礼后巴基去看场地", event: "venueChoice", target: "wechat:bucky❤️:花园婚礼", once: true, actions: [unlock("garden-bucky-see-venue")] },
  event("garden-steve-wait-reply", "Steve 回复巴基后开始十五秒倒计时", "wechat:bucky❤️", "garden-steve-wait", cond("garden-bucky-see-venue"), ["garden-bucky-garble-delay"]),
  event("garden-bucky-garble-delay", "十五秒后巴基发来乱码", "wechat:bucky❤️", "garden-bucky-garble", cond("garden-steve-wait"), [], 15000),
  event("garden-steve-whats-wrong-reply", "Steve 询问怎么了", "wechat:bucky❤️", "garden-steve-whats-wrong", cond("garden-bucky-garble"), ["yelena-alert-delay"]),
  event("yelena-alert-delay", "五秒后 Yelena 发来紧急消息和弹窗", "wechat:bucky❤️", [unlock("yelena-alert"), { type: "notification", key: "", value: "wechat/yelena:yelena\ncap，出事了" }], cond("garden-steve-whats-wrong"), [], 5000),
  event("yelena-steve-where-reply", "Steve 询问巴基情况", "wechat:yelena", "yelena-steve-where-bucky", cond("yelena-alert")),
  event("yelena-steve-coming-reply", "Steve 两秒后自动发出我马上到", "wechat:yelena", "yelena-steve-coming", cond("yelena-steve-where-bucky"), ["yelena-bucky-cat-delay"]),
  event("yelena-bucky-cat-delay", "两秒后 Yelena 说巴基变成猫", "wechat:yelena", "yelena-bucky-cat", cond("yelena-steve-coming"), ["yelena-snake-story-delay"], 2000),
  event("yelena-snake-story-delay", "两秒后 Yelena 说明小蛇经过", "wechat:yelena", "yelena-snake-story", cond("yelena-bucky-cat"), [], 2000),
  event("yelena-steve-question-reply", "Steve 对蛇的经过表示震惊", "wechat:yelena", "yelena-steve-question", cond("yelena-snake-story"), ["thor-wedding-1-delay"]),
  event("thor-wedding-1-delay", "Thor 一秒后送上祝福并弹窗", "wechat:yelena", [unlock("thor-wedding-1"), { type: "notification", key: "", value: "wechat/Thor:Thor\n吾友，新婚快乐🥳" }], cond("yelena-steve-question"), ["thor-wedding-2-delay"], 1000),
  event("thor-wedding-2-delay", "Thor 一秒后说明来意并弹窗", "wechat:yelena", [unlock("thor-wedding-2"), { type: "notification", key: "", value: "wechat/Thor:Thor\nloki和我今天专门前往中庭送上祝福" }], cond("thor-wedding-1"), ["thor-wedding-3-delay"], 1000),
  event("thor-wedding-3-delay", "Thor 一秒后提起 Loki 的礼物并弹窗", "wechat:yelena", [unlock("thor-wedding-3"), { type: "notification", key: "", value: "wechat/Thor:Thor\n我弟弟说他给你送来惊喜礼物😏" }], cond("thor-wedding-2"), [], 1000),
];
const sequenceIds = new Set(sequence.map((item) => item.id));
base.events = base.events.filter((item) => !sequenceIds.has(item.id));
base.events.push(...sequence);
const cakeHappyEvent = base.events.find(
  (item) => item.id === "bucky-cake-happy-reply",
);
if (!cakeHappyEvent) throw new Error("Cake finale event is missing");
cakeHappyEvent.next = [
  ...new Set([...(cakeHappyEvent.next || []), "wedding-venue-after-photos"]),
];
base.tests = base.tests.filter((item) => item.name !== "花园婚礼后完整触发巴基变猫剧情");
base.tests.push({
  name: "花园婚礼后完整触发巴基变猫剧情",
  steps: [
    { event: "venueChoice", target: "wechat:bucky❤️:花园婚礼" }, { event: "compose", target: "wechat:bucky❤️" }, { advanceMs: 15000 }, { event: "compose", target: "wechat:bucky❤️" }, { advanceMs: 5000 }, { event: "compose", target: "wechat:yelena" }, { advanceMs: 2000 }, { event: "compose", target: "wechat:yelena" }, { advanceMs: 2000 }, { advanceMs: 2000 }, { event: "compose", target: "wechat:yelena" }, { advanceMs: 1000 }, { advanceMs: 1000 }, { advanceMs: 1000 },
  ],
  expectUnlocked: messages.map(([id]) => id),
  expectNotifications: ["wechat/bucky❤️:bucky❤️\n我吃了一块😋", "wechat/yelena:yelena\ncap，出事了", "wechat/Thor:Thor\n吾友，新婚快乐🥳", "wechat/Thor:Thor\nloki和我今天专门前往中庭送上祝福", "wechat/Thor:Thor\n我弟弟说他给你送来惊喜礼物😏"],
});
base.tests = base.tests.filter((item) => item.name !== "蛋糕对话后自动衔接场地图片和新剧情");
base.tests.push({
  name: "蛋糕对话后自动衔接场地图片和新剧情",
  steps: [
    { advanceMs: 700 },
    { event: "compose", target: "wechat:bucky❤️" },
    { advanceMs: 650 },
    { event: "compose", target: "wechat:bucky❤️" },
    { advanceMs: 650 },
    { advanceMs: 3000 },
  ],
  expectUnlocked: [
    "bucky-cake-bucky-happy",
    "wedding-venue-hall",
    "wedding-venue-garden",
    "wedding-venue-question",
  ],
  expectNotifications: [
    "wechat/bucky❤️:bucky❤️\n我吃了一块😋",
    "wechat/bucky❤️:bucky❤️\n你想好场地选哪个了吗",
  ],
});
writeFileSync(source, `${JSON.stringify(base, null, 2)}\n`);


const skinsPath = "src/AppSkins.tsx";
let skins = readFileSync(skinsPath, "utf8");
if (!skins.includes("const scrollRef = useRef<HTMLDivElement>(null);")) {
  skins = skins.replace(
    `}) {\n  return (\n    <div className={\`skin-messages \${whatsapp ? "wa-wallpaper" : ""}\`}>`,
    `}) {\n  const scrollRef = useRef<HTMLDivElement>(null);\n  useEffect(() => {\n    const list = scrollRef.current;\n    if (!list) return;\n    list.scrollTop = list.scrollHeight;\n  }, [items]);\n  return (\n    <div\n      ref={scrollRef}\n      className={\`skin-messages \${whatsapp ? "wa-wallpaper" : ""}\`}\n    >`,
  );
}
if (!skins.includes("const selectedMessageIndex = selectedMessage")) {
  skins = skins.replace(
    `            : null;\n          return <>\n          <MessageList\n            ownerAvatar={ownerAvatar}\n            items={selectedMessage ? [...displayThreadItems, selectedMessage] : displayThreadItems}`,
    `            : null;\n          const selectedMessageIndex = selectedMessage\n            ? displayThreadItems.findIndex(\n                (item) => item.id === "wedding-venue-question",\n              ) + 1\n            : -1;\n          const displayedMessages = selectedMessage\n            ? [\n                ...displayThreadItems.slice(0, selectedMessageIndex),\n                selectedMessage,\n                ...displayThreadItems.slice(selectedMessageIndex),\n              ]\n            : displayThreadItems;\n          return <>\n          <MessageList\n            ownerAvatar={ownerAvatar}\n            items={displayedMessages}`,
  );
}
if (!skins.includes("const cakePending =")) {
  skins = skins.replace(
    `          const suggestions = threadItems\n            .flatMap((i) => (i.meta.quickReplies || "").split("|"))\n            .filter(Boolean);\n          const canTriggerCompose = threadItems.some(\n            (i) => i.meta.composeTrigger === "true",\n          );\n          const nextTypingText = threadItems.at(-1)?.meta.nextTyping || "";`,
    `          const cakePending =\n            p.thread === "bucky❤️" &&\n            threadItems.some((item) => item.id === "bucky-cake-bucky-ate") &&\n            !threadItems.some((item) => item.id === "bucky-cake-bucky-happy");\n          const suggestions = cakePending\n            ? []\n            : threadItems\n            .flatMap((i) => (i.meta.quickReplies || "").split("|"))\n            .filter(Boolean);\n          const canTriggerCompose = threadItems.some(\n            (i) => i.meta.composeTrigger === "true",\n          );\n          const nextTypingText = [...threadItems]\n            .reverse()\n            .find((item) => item.meta.nextTyping)?.meta.nextTyping || "";`,
  );
}
if (!skins.includes("const displayedMessages = selectedMessage")) {
  throw new Error("Chat ordering patch could not be applied");
}
if (!skins.includes("const cakePending =")) {
  throw new Error("Cake reply patch could not be applied");
}
writeFileSync(skinsPath, skins);
