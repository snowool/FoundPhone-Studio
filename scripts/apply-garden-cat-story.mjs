import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const source = "stories/template/story.json";
const base = JSON.parse(
  execFileSync("git", ["show", `da2b604:${source}`], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  }),
);

base.revision = 42;
const removedHomeApps = new Set(["mail", "clock", "maps", "settings"]);
base.installedApps = base.installedApps.filter((app) =>
  !removedHomeApps.has(typeof app === "string" ? app : app.id),
);
const beforeCakeMessages = [
  ["before-cake-bucky-late", "bucky❤️", "今天会晚点下班，晚饭不用等我你先吃"],
  ["before-cake-steve-no-1", "Steve Rogers", "no no", true],
  ["before-cake-bucky-pie", "bucky❤️", "给你带苹果派"],
  ["before-cake-steve-no-2", "Steve Rogers", "no no", true],
  ["before-cake-bucky-paint", "bucky❤️", "给你买新颜料"],
  ["before-cake-steve-no-3", "Steve Rogers", "no no", true],
  ["before-cake-bucky-kiss", "bucky❤️", "给你亲亲"],
  ["before-cake-steve-ok", "Steve Rogers", "ok", true],
  ["before-cake-steve-wink", "Steve Rogers", "😉", true],
].map(([id, sender, body, outgoing]) => ({
  id,
  title: "bucky❤️",
  sender,
  body,
  kind: "text",
  time: "2026-10-23 18:07",
  ...(outgoing ? { outgoing: true } : {}),
  meta: { pinned: "true" },
}));
const beforeCakeIds = new Set(beforeCakeMessages.map((item) => item.id));
base.content.wechat = base.content.wechat.filter((item) => !beforeCakeIds.has(item.id));
const cakeStartIndex = base.content.wechat.findIndex(
  (item) => item.id === "bucky-cake-steve-start",
);
if (cakeStartIndex < 0) throw new Error("Cheesecake conversation is missing");
base.content.wechat.splice(cakeStartIndex, 0, ...beforeCakeMessages);
const cakeUncut = base.content.wechat.find(
  (item) => item.id === "bucky-cake-bucky-uncut",
);
if (!cakeUncut) throw new Error("Cheesecake reply is missing");
cakeUncut.body = "我没说我切了🙂‍↕️";

const normalizeContactName = (name) =>
  name.toLowerCase().replace(/[^a-z]/g, "");
const contactAvatar = (name) =>
  base.content.wechat.find(
    (item) =>
      item.meta.contact === "true" &&
      normalizeContactName(item.sender) === normalizeContactName(name),
  )?.avatar || "";

const samContact = {
  id: "sam-contact",
  title: "sam",
  sender: "sam",
  body: "",
  kind: "text",
  folder: "",
  time: "",
  avatar: "./story-media/sam-avatar.jpeg",
  meta: { contact: "true" },
};
const buckyMoment = {
  id: "bucky-moment-tell-husband",
  title: "bucky",
  sender: "bucky",
  body: "今天开始要少发朋友圈了，我要留着好多事以后躺在老公怀里一件一件给他讲的",
  kind: "post",
  folder: "朋友圈",
  time: "2026-10-25 11:34",
  avatar: contactAvatar("bucky"),
  meta: {
    momentOnly: "true",
    likes: "steve|wanda|yelena|loki|natasha",
    comments: "natasha：TD|steve：|bucky回复steve：😉|sam：你俩加个好友去私聊行吗|loki：中庭产浪漫好恶心|tony：这集真的太难看了|yelena：巴恩斯议员被夺舍了吗",
  },
};
const thorMoment = {
  id: "thor-moment-loki-praise",
  title: "thor",
  sender: "thor",
  body: "我弟弟真是全世界最善解人意最善良可爱最温柔妥帖的弟弟🥺",
  kind: "post",
  folder: "朋友圈",
  time: "2026-10-25 11:28",
  avatar: contactAvatar("thor"),
  meta: {
    momentOnly: "true",
    likes: "loki|steve",
    comments: "sam：？|natasha：？|tony：？|bucky：原来那只不养了吗|wanda：？|yelena：？",
  },
};
const lokiMoment = {
  id: "loki-moment-fortune",
  title: "loki",
  sender: "loki",
  body: "点赞免费算命",
  kind: "post",
  folder: "朋友圈",
  time: "2026-10-25 11:24",
  avatar: contactAvatar("loki"),
  meta: {
    momentOnly: "true",
    likes: "thor|yelena|tony|wanda|sam|steve",
    comments: "loki：@thor烂命一条|loki：@yelena烂命一条|loki：@tony烂命一条|loki：@wanda烂命一条|loki：@sam烂命一条|loki：@natasha烂命一条|loki：@steve烂命一条|loki：@bucky烂命一条|bucky：我没点赞。|loki回复bucky：无人在意好吧",
  },
};
const samMoment = {
  id: "sam-moment-husband",
  title: "sam",
  sender: "sam",
  body: "一直不理解老公奴这个群体为，难道没了老公就活不下去吗",
  kind: "post",
  folder: "朋友圈",
  time: "2026-10-25 11:20",
  avatar: "./story-media/sam-avatar.jpeg",
  meta: {
    momentOnly: "true",
    likes: "natasha|tony|yelena",
    comments: "natasha：点了|bucky：看完你这句话我在老公怀里哭了好久，他胸好软|sam回复bucky：🤮",
  },
};
const wandaMoment = {
  id: "wanda-moment-outing",
  title: "wanda",
  sender: "wanda",
  body: "就酱粗去玩",
  kind: "post",
  folder: "朋友圈",
  time: "2026-10-25 11:40",
  avatar: contactAvatar("wanda"),
  media: "./story-media/wanda-moment.jpeg",
  meta: {
    momentOnly: "true",
    likes: "natasha|bucky|steve|thor|sam|tony|yelena|loki",
    comments: "natasha：我去，你拿个洋娃娃拍张照就说是自己啊|yelena：ㅎㄹ...真的疯了 完全是 legend 啊ㅋㅋ这种程度真的不是天才吗 ㅅㅂ…做到这种程度的话就完全是神吧ㅠㅠ…以后也请一直幸福地生活下去吧♡ 今天完全展现出可爱的角度呢 是路过的蚂蚁都会惊叹的程度啊…|bucky：好漂亮|wanda回复yelena：好害羞！|wanda回复bucky：你也素…|wanda回复natasha：🫪🫪",
  },
};
base.content.wechat = base.content.wechat.filter(
  (item) => {
    const isPrivateSamOrLoki =
      item.folder !== "朋友圈" &&
      item.meta.contact !== "true" &&
      ["sam", "loki"].includes(normalizeContactName(item.title));
    return (
      ![
      samMoment.id,
      samContact.id,
      "wechat-sam-contact",
      buckyMoment.id,
      thorMoment.id,
      lokiMoment.id,
      wandaMoment.id,
      ].includes(item.id) && !isPrivateSamOrLoki
    );
  },
);
base.content.wechat.push(
  samContact,
  buckyMoment,
  wandaMoment,
  thorMoment,
  lokiMoment,
  samMoment,
);

const alpineNewsPost = {
  id: "twitter-alpine-news",
  title: "Steve Rogers&Bucky Barnes关系再上一层楼，秘密喜迎新家庭成员",
  sender: "HeroWatch Daily",
  body: "据知情人士透露Barnes议员与Rogers队长秘密孕育新生命，一只小白猫Alpine，代表二人关系更进一步。",
  kind: "post",
  time: "2026-10-25 12:18",
  media: "./story-media/x-alpine-news.jpeg",
  meta: {
    handle: "hero_watch_47",
    reposts: "83700",
    extraMedia: "./story-media/x-alpine-comic.jpeg",
  },
  likes: 260000,
  comments: [],
};
const rogersFamilyNewsPost = {
  id: "twitter-rogers-family-outing",
  title: "与罗杰斯一家同行？！",
  sender: "HeroWatch Daily",
  body: "史蒂夫·罗杰斯与巴基·巴恩斯订婚后首次公开亮相，巴恩斯先生虽然是回归家庭男人，但状态却像正值壮年，老树发新芽，令不少粉丝大赞：罗杰斯太太如此保持弗爆身形，定是为了靠色相留住老公！",
  kind: "post",
  time: "2026-10-25 12:22",
  media: "./story-media/x-rogers-family-outing.jpeg",
  meta: {
    handle: "hero_watch_47",
    reposts: "96200",
  },
  likes: 318000,
  comments: [],
};
const coneySecretWeddingPost = {
  id: "twitter-coney-secret-wedding",
  title: "秘密婚礼曝光！",
  sender: "babo Sakura",
  body: "跟随知情人士竟意外撞破美国队长与冬日战士私情，待业家庭主父与国会议员婚礼在布鲁克林一教堂秘密举行，真让他赘到了！",
  kind: "post",
  time: "2026-10-25 12:35",
  hidden: true,
  meta: { handle: "babo_sakura", reposts: "24100", views: "38.6万", xTop: "1" },
  likes: 126000,
  comments: [],
};
const coneyRunawayPost = {
  id: "twitter-coney-runaway",
  title: "美国队长临阵逃婚？",
  sender: "babo Sakura",
  body: "记者突袭婚礼之后罗杰斯队长竟临阵脱逃，与新婚妻子手牵手逃离之，疑似有民众在康尼岛摩天轮附近发现二人身影。",
  kind: "post",
  time: "2026-10-25 12:45",
  hidden: true,
  meta: { handle: "babo_sakura", reposts: "31900", views: "45.2万", xTop: "2" },
  likes: 184000,
  comments: [],
};
base.content.twitter = (base.content.twitter || []).filter(
  (item) => ![
    alpineNewsPost.id,
    rogersFamilyNewsPost.id,
    coneySecretWeddingPost.id,
    coneyRunawayPost.id,
  ].includes(item.id),
);
base.content.twitter.push(
  alpineNewsPost,
  rogersFamilyNewsPost,
  coneySecretWeddingPost,
  coneyRunawayPost,
);
const randomLikes = [78600, 142000, 96300, 218000, 67400, 189000, 115000];
const randomReposts = [15200, 38400, 21700, 56200, 11800, 47300, 29600];
base.content.twitter = base.content.twitter.map((item, index) => ({
  ...item,
  sender: "babo Sakura",
  likes: randomLikes[index % randomLikes.length],
  meta: {
    ...item.meta,
    handle: "babo_sakura",
    reposts: String(randomReposts[index % randomReposts.length]),
  },
}));

// 场地消息只能在蛋糕互动完成后，打开相册五秒才出现。
const venueAfterPhotos = base.events.find(
  (item) => item.id === "wedding-venue-after-photos",
);
if (!venueAfterPhotos) throw new Error("Wedding venue trigger is missing");
Object.assign(venueAfterPhotos, {
  label: "完成蛋糕聊天后打开相册五秒收到场地消息",
  delayMs: 5000,
  conditions: [{ key: "wedding:cake:done", op: "eq", value: true }],
});
const messages = [
  ["church-bucky-see-venue", "bucky❤️", "那我下班和yelena去看一下场地", { composeTrigger: "true", nextTyping: "辛苦了buck，等你回家🤧" }],
  ["church-steve-wait", "Steve Rogers", "辛苦了buck，等你回家🤧", {}, true],
  ["church-bucky-looks-like-you", "bucky❤️", "这个好像你", {}],
  ["church-bucky-puppy-image", "bucky❤️", "", {}, false, "./story-media/bucky-puppy.jpeg"],
  ["church-bucky-puppy", "bucky❤️", "小狗", { composeTrigger: "true", nextTyping: "他是谁" }],
  ["church-steve-who", "Steve Rogers", "他是谁", { composeTrigger: "true", nextTyping: "不是说好只养我一只狗吗" }, true],
  ["church-steve-only-dog", "Steve Rogers", "不是说好只养我一只狗吗", {}, true],
  ["church-bucky-ellipsis", "bucky❤️", "。。。", {}],
  ["church-bucky-confiscate", "bucky❤️", "我要没收你的情话集了", { composeTrigger: "true", nextTyping: "🥲" }],
  ["church-steve-plead", "Steve Rogers", "🥲", {}, true],
  ["church-bucky-invitation", "bucky❤️", "", { expandMedia: "true", invitationPreview: "true", detailMedia: "./story-media/wedding-invitation-foldout.gif" }, false, "./story-media/wedding-invitation.jpeg"],
  ["church-bucky-invitation-reminder", "bucky❤️", "stevie记得今天要发请柬", { composeTrigger: "true", nextTyping: "🙂‍↕️" }],
  ["church-steve-nod", "Steve Rogers", "🙂‍↕️", { composeTrigger: "true", nextTyping: "所有人？" }, true],
  ["church-steve-everyone", "Steve Rogers", "所有人？", {}, true],
  ["church-bucky-agreement", "bucky❤️", "我们说好的stevie", {}],
  ["garden-bucky-see-venue", "bucky❤️", "那我下班和yelena去看一下场地", { composeTrigger: "true", nextTyping: "辛苦了buck，等你回家🤧" }],
  ["garden-steve-wait", "Steve Rogers", "辛苦了buck，等你回家🤧", {}, true],
  ["garden-bucky-garble", "bucky❤️", "sjcoqhdkcochshcjcjdlsbjd", { composeTrigger: "true", nextTyping: "怎么了" }],
  ["garden-steve-whats-wrong", "Steve Rogers", "怎么了", {}, true],
  ["yelena-alert", "yelena", "cap，出事了", { composeTrigger: "true", nextTyping: "bucky怎么回事，你在他身边吗" }],
  ["yelena-steve-where-bucky", "Steve Rogers", "bucky怎么回事，你在他身边吗", { composeTrigger: "true", nextTyping: "我马上到" }, true],
  ["yelena-steve-coming", "Steve Rogers", "我马上到", {}, true],
  ["yelena-bucky-cat", "yelena", "bucky变成猫了！！", {}],
  ["yelena-bucky-cat-photo", "yelena", "", {}, false, "./story-media/yelena-bucky-cat.jpeg"],
  ["yelena-snake-story", "yelena", "我们在花园看到一条黑色的小蛇，bucky想把他弄走，那条蛇突然变成绿光包住了他", { composeTrigger: "true", nextTyping: "？！" }],
  ["yelena-steve-question", "Steve Rogers", "？！", {}, true],
  ["thor-wedding-1", "Thor", "吾友，新婚快乐🥳", {}],
  ["thor-wedding-2", "Thor", "loki和我今天专门前往中庭送上祝福", {}],
  ["thor-wedding-3", "Thor", "我弟弟说他给你送来惊喜礼物😏", {}],
];
const oldIds = new Set(messages.map(([id]) => id));
const gardenMessages = messages.map(([id, sender, body, meta, outgoing, media]) => ({
  id,
  title: id.startsWith("thor") ? "Thor" : id.startsWith("yelena") ? "yelena" : "bucky❤️",
  sender,
  kind: media ? "image" : "text",
  body,
  ...(media ? { media } : {}),
  time: "2026-10-25 09:35",
  hidden: true,
  ...(outgoing ? { outgoing: true } : {}),
  meta: id.startsWith("garden") || id.startsWith("church") ? { pinned: "true", ...meta } : meta,
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
const wechatNotification = (id) => {
  const item = base.content.wechat.find((candidate) => candidate.id === id);
  if (!item || item.outgoing || item.meta.contact === "true") return null;
  return {
    type: "notification",
    key: "",
    value: `wechat/${item.title}:${item.sender}\n${item.body || "[图片]"}`,
  };
};
const event = (id, label, trigger, key, conditions = [], next = [], delayMs) => {
  const actions = Array.isArray(key) ? [...key] : [unlock(key)];
  for (const action of [...actions]) {
    if (action.type !== "unlock") continue;
    const notification = wechatNotification(action.key);
    if (
      notification &&
      !actions.some(
        (existing) =>
          existing.type === "notification" && existing.value === notification.value,
      )
    )
      actions.push(notification);
  }
  return {
    id, label, event: "compose", target: trigger, once: true, conditions,
    actions, ...(next.length ? { next } : {}),
    ...(delayMs ? { type: "delay", delayMs } : {}),
  };
};
const sequence = [
  {
    id: "church-choice-bucky-venue",
    label: "选择教堂婚礼后巴基去看场地",
    event: "venueChoice",
    target: "wechat:bucky❤️:教堂婚礼",
    once: true,
    actions: [unlock("church-bucky-see-venue"), wechatNotification("church-bucky-see-venue")],
    next: [],
  },
  event("church-steve-wait-reply", "点击输入框后 Steve 回复巴基", "wechat:bucky❤️", "church-steve-wait", cond("church-bucky-see-venue"), ["church-bucky-looks-delay"]),
  event("church-bucky-looks-delay", "十秒后巴基说这个像你", "wechat:bucky❤️", "church-bucky-looks-like-you", cond("church-steve-wait"), ["church-bucky-puppy-image-delay"], 10000),
  event("church-bucky-puppy-image-delay", "两秒后巴基发来小狗照片", "wechat:bucky❤️", "church-bucky-puppy-image", cond("church-bucky-looks-like-you"), ["church-bucky-puppy-delay"], 2000),
  event("church-bucky-puppy-delay", "一秒后巴基说小狗", "wechat:bucky❤️", "church-bucky-puppy", cond("church-bucky-puppy-image"), [], 1000),
  event("church-steve-who-reply", "点击输入框后 Steve 问他是谁", "wechat:bucky❤️", "church-steve-who", cond("church-bucky-puppy")),
  event("church-steve-only-dog-reply", "点击输入框后 Steve 吃醋", "wechat:bucky❤️", "church-steve-only-dog", cond("church-steve-who"), ["church-bucky-ellipsis-delay"]),
  event("church-bucky-ellipsis-delay", "三秒后巴基无语", "wechat:bucky❤️", "church-bucky-ellipsis", cond("church-steve-only-dog"), ["church-bucky-confiscate-delay"], 3000),
  event("church-bucky-confiscate-delay", "两秒后巴基没收情话集", "wechat:bucky❤️", "church-bucky-confiscate", cond("church-bucky-ellipsis"), [], 2000),
  event("church-steve-plead-reply", "点击输入框后 Steve 发出委屈表情", "wechat:bucky❤️", [unlock("church-steve-plead"), { type: "variable", key: "wedding:venue:confirmed", value: true }], cond("church-bucky-confiscate"), ["church-bucky-invitation-delay"]),
  event("church-bucky-invitation-delay", "十秒后巴基发来请柬", "wechat:bucky❤️", "church-bucky-invitation", cond("church-steve-plead"), ["church-bucky-invitation-reminder-delay"], 10000),
  event("church-bucky-invitation-reminder-delay", "两秒后巴基提醒发请柬", "wechat:bucky❤️", "church-bucky-invitation-reminder", cond("church-bucky-invitation"), [], 2000),
  event("church-steve-nod-reply", "点击输入框后 Steve 应下", "wechat:bucky❤️", "church-steve-nod", cond("church-bucky-invitation-reminder")),
  event("church-steve-everyone-reply", "点击输入框后 Steve 询问所有人", "wechat:bucky❤️", "church-steve-everyone", cond("church-steve-nod"), ["church-bucky-agreement-delay"]),
  event("church-bucky-agreement-delay", "两秒后巴基提醒约定", "wechat:bucky❤️", "church-bucky-agreement", cond("church-steve-everyone"), [], 2000),
  {
    id: "wedding-first-dance-music-selected",
    label: "在 Apple Music 选择第一支舞音乐",
    event: "musicSelected",
    target: "music:its-been-a-long-long-time",
    once: true,
    conditions: [],
    actions: [
      { type: "variable", key: "wedding:first-dance:confirmed", value: true },
    ],
    next: [],
  },
  {
    id: "future-ending-delay",
    label: "十项任务复核完成后渐暗进入去未来",
    type: "delay",
    event: "variable",
    target: "",
    once: true,
    delayMs: 1500,
    // Check the complete checklist again at the final moment. This prevents
    // any earlier task update from ever displaying the ending prematurely.
    conditions: [
      { key: "wedding:date:done", op: "eq", value: true },
      { key: "wedding:venue:done", op: "eq", value: true },
      { key: "wedding:ceremony:done", op: "eq", value: true },
      { key: "wedding:officiant:done", op: "eq", value: true },
      { key: "wedding:cake:done", op: "eq", value: true },
      { key: "wedding:outfits:done", op: "eq", value: true },
      { key: "wedding:invitations:done", op: "eq", value: true },
      { key: "wedding:wedding-party:done", op: "eq", value: true },
      { key: "wedding:alpine:done", op: "eq", value: true },
      { key: "wedding:first-dance:done", op: "eq", value: true },
      { key: "coney:tony-invited", op: "neq", value: true },
    ],
    actions: [{ type: "ending", key: "", value: "去未来" }],
    next: [],
  },
  {
    id: "coney-tony-invitation-sent",
    label: "给 Tony 发送请柬后触发康尼岛支线",
    event: "invitationChoice",
    target: "wechat:Tony",
    once: true,
    conditions: [],
    actions: [{ type: "variable", key: "coney:tony-invited", value: true }],
    next: ["coney-secret-wedding-delay"],
  },
  {
    id: "coney-secret-wedding-delay",
    label: "十五秒后黑叉发布秘密婚礼帖子",
    type: "delay",
    event: "invitationChoice",
    target: "wechat:Tony",
    once: true,
    delayMs: 15000,
    conditions: [{ key: "coney:tony-invited", op: "eq", value: true }],
    actions: [
      unlock("twitter-coney-secret-wedding"),
      { type: "notification", key: "", value: "twitter/babo Sakura\n秘密婚礼曝光！" },
    ],
    next: [],
  },
  {
    id: "coney-secret-wedding-read",
    label: "读完秘密婚礼帖子",
    event: "read",
    target: "twitter-coney-secret-wedding",
    once: true,
    conditions: [cond("twitter-coney-secret-wedding")[0]],
    actions: [],
    next: ["coney-runaway-delay"],
  },
  {
    id: "coney-runaway-delay",
    label: "十秒后黑叉发布逃婚帖子",
    type: "delay",
    event: "read",
    target: "twitter-coney-secret-wedding",
    once: true,
    delayMs: 5000,
    conditions: [cond("twitter-coney-secret-wedding")[0]],
    actions: [
      unlock("twitter-coney-runaway"),
      { type: "notification", key: "", value: "twitter/babo Sakura\n美国队长临阵逃婚？" },
    ],
    next: ["coney-island-ending-delay"],
  },
  {
    id: "coney-island-ending-delay",
    label: "逃婚帖子弹窗六秒后触发康尼岛之夜结局",
    type: "delay",
    event: "read",
    target: "twitter-coney-secret-wedding",
    once: true,
    delayMs: 6000,
    conditions: [cond("twitter-coney-runaway")[0]],
    actions: [{ type: "ending", key: "", value: "康尼岛之夜" }],
    next: [],
  },
  {
    id: "wedding-invitation-sent-sam",
    label: "给 Sam 发送请柬",
    event: "invitationChoice",
    target: "wechat:sam",
    once: true,
    conditions: [],
    actions: [{ type: "variable", key: "wedding:invite:sam:sent", value: true }],
    next: [],
  },
  {
    id: "wedding-invitation-sent-natasha",
    label: "给 Natasha 发送请柬",
    event: "invitationChoice",
    target: "wechat:Natasha",
    once: true,
    conditions: [],
    actions: [{ type: "variable", key: "wedding:invite:natasha:sent", value: true }],
    next: [],
  },
  {
    id: "wedding-invitations-complete-after-sam",
    label: "Sam 与 Natasha 都收到请柬",
    event: "variable",
    target: "wedding:invite:sam:sent",
    once: true,
    conditions: [{ key: "wedding:invite:natasha:sent", op: "eq", value: true }],
    actions: [
      { type: "variable", key: "wedding:invitations:confirmed", value: true },
      { type: "variable", key: "wedding:wedding-party:confirmed", value: true },
    ],
    next: [],
  },
  {
    id: "wedding-invitations-complete-after-natasha",
    label: "Natasha 与 Sam 都收到请柬",
    event: "variable",
    target: "wedding:invite:natasha:sent",
    once: true,
    conditions: [{ key: "wedding:invite:sam:sent", op: "eq", value: true }],
    actions: [
      { type: "variable", key: "wedding:invitations:confirmed", value: true },
      { type: "variable", key: "wedding:wedding-party:confirmed", value: true },
    ],
    next: [],
  },
  { id: "garden-choice-bucky-venue", label: "选择花园婚礼后巴基去看场地", event: "venueChoice", target: "wechat:bucky❤️:花园婚礼", once: true, actions: [unlock("garden-bucky-see-venue"), wechatNotification("garden-bucky-see-venue")] },
  event("garden-steve-wait-reply", "Steve 回复巴基后开始十五秒倒计时", "wechat:bucky❤️", "garden-steve-wait", cond("garden-bucky-see-venue"), ["garden-bucky-garble-delay"]),
  event("garden-bucky-garble-delay", "十五秒后巴基发来乱码", "wechat:bucky❤️", [unlock("garden-bucky-garble"), { type: "notification", key: "", value: "wechat/bucky❤️:bucky❤️\nsjcoqhdkcochshcjcjdlsbjd" }], cond("garden-steve-wait"), [], 15000),
  event("garden-steve-whats-wrong-reply", "Steve 询问怎么了", "wechat:bucky❤️", "garden-steve-whats-wrong", cond("garden-bucky-garble"), ["yelena-alert-delay"]),
  event("yelena-alert-delay", "五秒后 Yelena 发来紧急消息和弹窗", "wechat:bucky❤️", [unlock("yelena-alert"), { type: "notification", key: "", value: "wechat/yelena:yelena\ncap，出事了" }], cond("garden-steve-whats-wrong"), [], 5000),
  event("yelena-steve-where-reply", "Steve 询问巴基情况", "wechat:yelena", "yelena-steve-where-bucky", cond("yelena-alert")),
  event("yelena-steve-coming-reply", "点击输入框后 Steve 发出我马上到", "wechat:yelena", "yelena-steve-coming", cond("yelena-steve-where-bucky"), ["yelena-bucky-cat-delay"]),
  event("yelena-bucky-cat-delay", "两秒后 Yelena 说巴基变成猫", "wechat:yelena", [unlock("yelena-bucky-cat"), unlock("yelena-bucky-cat-photo")], cond("yelena-steve-coming"), ["yelena-snake-story-delay"], 2000),
  event("yelena-snake-story-delay", "两秒后 Yelena 说明小蛇经过", "wechat:yelena", "yelena-snake-story", cond("yelena-bucky-cat"), [], 2000),
  event("yelena-steve-question-reply", "Steve 对蛇的经过表示震惊", "wechat:yelena", "yelena-steve-question", cond("yelena-snake-story"), ["thor-wedding-1-delay"]),
  event("thor-wedding-1-delay", "Thor 一秒后送上祝福并弹窗", "wechat:yelena", [unlock("thor-wedding-1"), { type: "notification", key: "", value: "wechat/Thor:Thor\n吾友，新婚快乐🥳" }], cond("yelena-steve-question"), ["thor-wedding-2-delay"], 1000),
  event("thor-wedding-2-delay", "Thor 一秒后说明来意并弹窗", "wechat:yelena", [unlock("thor-wedding-2"), { type: "notification", key: "", value: "wechat/Thor:Thor\nloki和我今天专门前往中庭送上祝福" }], cond("thor-wedding-1"), ["thor-wedding-3-delay"], 1000),
  event("thor-wedding-3-delay", "Thor 一秒后提起 Loki 的礼物并弹窗", "wechat:yelena", [unlock("thor-wedding-3"), { type: "notification", key: "", value: "wechat/Thor:Thor\n我弟弟说他给你送来惊喜礼物😏" }], cond("thor-wedding-2"), ["evil-god-blessing-ending"], 1000),
  event("evil-god-blessing-ending", "Thor 三条祝福显示后触发邪神祝福结局", "wechat:yelena", [{ type: "ending", key: "", value: "邪神的祝福" }], cond("thor-wedding-3"), [], 1500),
];
const sequenceIds = new Set(sequence.map((item) => item.id));
base.events = base.events.filter((item) => !sequenceIds.has(item.id));
base.events.push(...sequence);
// Recheck the ending directly after each checklist item becomes completed.
// This runs after the variable update, so the last required checkmark can trigger it.
for (const completion of base.events.filter((item) => item.id.startsWith("wedding-complete-"))) {
  completion.next = [...new Set([...(completion.next || []), "future-ending-delay"])];
}
base.tests = base.tests.filter((item) => item.name !== "花园婚礼后完整触发巴基变猫剧情");
base.tests = base.tests.filter((item) => item.name !== "教堂婚礼后完成小狗对话并确认场地");
base.tests.push({
  name: "教堂婚礼后完成小狗对话并确认场地",
  steps: [
    { event: "venueChoice", target: "wechat:bucky❤️:教堂婚礼" },
    { event: "compose", target: "wechat:bucky❤️" },
    { advanceMs: 10000 }, { advanceMs: 2000 }, { advanceMs: 1000 },
    { event: "compose", target: "wechat:bucky❤️" },
    { event: "compose", target: "wechat:bucky❤️" }, { advanceMs: 3000 },
    { advanceMs: 2000 }, { event: "compose", target: "wechat:bucky❤️" },
    { advanceMs: 10000 }, { advanceMs: 2000 },
    { event: "compose", target: "wechat:bucky❤️" },
    { event: "compose", target: "wechat:bucky❤️" }, { advanceMs: 2000 },
  ],
  expectUnlocked: [
    "church-bucky-see-venue", "church-steve-wait", "church-bucky-looks-like-you",
    "church-bucky-puppy-image", "church-bucky-puppy", "church-steve-who",
    "church-steve-only-dog", "church-bucky-ellipsis", "church-bucky-confiscate",
    "church-steve-plead", "church-bucky-invitation", "church-bucky-invitation-reminder",
    "church-steve-nod", "church-steve-everyone", "church-bucky-agreement",
  ],
});
base.tests.push({
  name: "花园婚礼后完整触发巴基变猫剧情",
  steps: [
    { event: "venueChoice", target: "wechat:bucky❤️:花园婚礼" },
    { event: "compose", target: "wechat:bucky❤️" }, { advanceMs: 15000 },
    { event: "compose", target: "wechat:bucky❤️" }, { advanceMs: 5000 },
    { event: "compose", target: "wechat:yelena" },
    { event: "compose", target: "wechat:yelena" }, { advanceMs: 2000 },
    { advanceMs: 2000 }, { event: "compose", target: "wechat:yelena" },
    { advanceMs: 1000 }, { advanceMs: 1000 }, { advanceMs: 1000 }, { advanceMs: 1500 },
  ],
  expectUnlocked: messages
    .filter(([id]) => !id.startsWith("church-"))
    .map(([id]) => id),
  ending: "邪神的祝福",
});
base.tests = base.tests.filter((item) =>
  !item.name.includes("场地") && item.name !== "蛋糕结束后打开相册才触发场地剧情",
);
base.tests.push({
  name: "完成蛋糕互动后打开相册五秒触发场地剧情",
  steps: [
    { advanceMs: 700 },
    { event: "compose", target: "wechat:bucky❤️" },
    { advanceMs: 650 },
    { event: "compose", target: "wechat:bucky❤️" },
    { advanceMs: 650 },
    { event: "openApp", target: "photos" },
    { advanceMs: 4999 },
    { advanceMs: 1 },
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
if (skins.includes("optionsOpen && suggestions.length > 0")) {
  skins = skins.replace("optionsOpen && ", "");
}
if (skins.includes("const [optionsOpen, setOptionsOpen] = useState(false);")) {
  skins = skins.replace("  const [optionsOpen, setOptionsOpen] = useState(false);\n", "");
  skins = skins.replace("              setOptionsOpen(true);\n", "");
}
if (skins.includes(`if (label === "花园婚礼") {\n                p.onEvent?.("venueChoice", \`${"${p.appId}"}:bucky❤️:${"${label}"}\`);\n              }`)) {
  skins = skins.replace(
    `if (label === "花园婚礼") {\n                p.onEvent?.("venueChoice", \`${"${p.appId}"}:bucky❤️:${"${label}"}\`);\n              }`,
    `p.onEvent?.("venueChoice", \`${"${p.appId}"}:bucky❤️:${"${label}"}\`);`,
  );
}
if (!skins.includes("const displayedMessages = selectedMessage")) {
  throw new Error("Chat ordering patch could not be applied");
}
if (!skins.includes("const cakePending =")) {
  throw new Error("Cake reply patch could not be applied");
}
if (!skins.includes(`p.onEvent?.("venueChoice", \`${"${p.appId}"}:bucky❤️:${"${label}"}\`);`)) {
  throw new Error("Venue choice event patch could not be applied");
}
writeFileSync(skinsPath, skins);
