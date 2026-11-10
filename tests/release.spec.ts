import { test, expect } from "@playwright/test";
test("full test preview retains four dock apps and updated status bar", async ({
  page,
  request,
}) => {
  const work = await (await request.get("/test-work.json")).json();
  expect(work.id).toBe("ui-test-phone-v2");
  expect(
    work.apps.filter((a: { installed: boolean }) => a.installed),
  ).toHaveLength(49);
  expect(work.nodes).toHaveLength(0);
  expect(
    work.apps.filter(
      (a: { installed: boolean; dock: boolean }) => a.installed && a.dock,
    ),
  ).toHaveLength(4);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/?preview=test");
  await page.getByRole("button", { name: "轻触解锁" }).waitFor();
  await page
    .locator(".phone-screen")
    .screenshot({ path: "docs/images/lock.png" });
  await page.getByRole("button", { name: "轻触解锁" }).click();
  await expect(page.locator(".lock-screen")).toHaveCount(0);
  await expect(page.locator(".interactive-home")).toHaveCSS("opacity", "1");
  await expect(page.locator(".dock [data-home-key]")).toHaveCount(4);
  await expect(page.locator(".status-silent")).toBeVisible();
  await expect(page.locator(".status-cellular")).toBeVisible();
  await expect(page.locator(".status-wifi")).toBeVisible();
  await page
    .locator(".phone-screen")
    .screenshot({ path: "docs/images/home.png" });
  await page
    .locator(".status-bar")
    .screenshot({ path: "outputs/release/status-bar.png" });
  await page
    .getByRole("button", { name: "打开App Store", exact: true })
    .click();
  await page.getByPlaceholder("搜索全部App").fill("X");
  const x = page.locator(".runtime-library-row").filter({
    has: page.locator(".library-app-title strong", { hasText: /^X$/ }),
  });
  await expect(x.locator("[data-original-icon=twitter] img")).toHaveAttribute(
    "src",
    /twitter\.svg$/,
  );
  await x.getByRole("button", { name: "打开", exact: true }).click();
  await expect(page.locator(".app-screen:not([inert])")).toHaveCSS(
    "transform",
    "none",
  );
  await page.getByRole("button", { name: "返回桌面", exact: true }).click();
  await page
    .getByRole("button", { name: "打开App Store", exact: true })
    .click();
  await page.getByPlaceholder("搜索全部App").fill("设置");
  await page
    .locator(".runtime-library-row")
    .getByRole("button", { name: "打开", exact: true })
    .click();
  await expect(page.getByRole("switch", { name: "飞行模式" })).toBeVisible();
  await expect(page.locator(".app-screen:not([inert])")).toHaveCSS(
    "transform",
    "none",
  );
  await page
    .locator(".phone-screen")
    .screenshot({ path: "docs/images/settings.png" });
  await page.reload();
  await page.getByRole("button", { name: "轻触解锁" }).click();
  await expect(page.locator(".dock [data-home-key]")).toHaveCount(4);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("custom phone requires 0704 and exposes only its configured apps", async ({
  page,
  request,
}) => {
  const work = await (await request.get("/work.json")).json();
  expect(work.id).toBe("snowool-foundphone");
  expect(work.apps.map((app: { id: string }) => app.id).sort()).toEqual([
    "appstore",
    "calendar",
    "camera",
    "clock",
    "contacts",
    "kakao",
    "mail",
    "maps",
    "messages",
    "netflix",
    "notes",
    "phone",
    "photos",
    "safari",
    "settings",
    "spotify",
    "tiktok",
    "twitter",
    "weather",
    "xianyu",
  ]);
  expect(work.apps.every((app: { installed: boolean }) => app.installed)).toBe(
    true,
  );

  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await page.getByRole("button", { name: "轻触解锁" }).click();
  for (const digit of "0000")
    await page.getByRole("button", { name: "密码键" + digit }).click();
  await expect(page.getByText("密码不正确")).toBeVisible();
  for (const digit of "0704")
    await page.getByRole("button", { name: "密码键" + digit }).click();

  await page
    .getByRole("button", { name: "打开App Store", exact: true })
    .click();
  await expect(page.locator(".runtime-library-row")).toHaveCount(
    work.apps.length,
  );
  await page.getByPlaceholder("搜索全部App").fill("闲鱼");
  await page
    .locator(".runtime-library-row")
    .getByRole("button", { name: "打开", exact: true })
    .click();
  await expect(page.getByPlaceholder("搜索商品或订单")).toBeVisible();
  const banner = page.locator('.device-banner[data-app="xianyu"]');
  await expect(banner).toBeVisible({ timeout: 6500 });
  await expect(banner.getByText("降价提醒", { exact: true })).toBeVisible();
  await expect(
    banner.getByText("你浏览过宝贝“HotToys 美国队长7.0倒模1/1比例”降价了", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    banner.locator('[data-original-icon="xianyu"] img'),
  ).toBeVisible();
});

test("the custom album supports swiping between photos", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await page.getByRole("button", { name: "轻触解锁" }).click();
  for (const digit of "0704")
    await page.getByRole("button", { name: "密码键" + digit }).click();

  await page.getByRole("button", { name: "打开相册" }).click();
  await page.getByRole("button", { name: "查看照片 01" }).click();
  const stage = page.locator(".native-photo-stage");
  await expect
    .poll(async () => (await stage.boundingBox())?.width ?? 0)
    .toBeGreaterThan(300);
  const bounds = await stage.boundingBox();
  if (!bounds) throw new Error("Photo viewer is not visible");

  const swipe = async (from: number, to: number) => {
    const y = bounds.y + bounds.height / 2;
    await page.mouse.move(bounds.x + bounds.width * from, y);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width * to, y, { steps: 5 });
    await page.mouse.up();
  };

  await expect(stage.getByRole("button", { name: "上一张" })).toHaveCount(0);
  await swipe(0.75, 0.25);
  await expect(stage.getByRole("img", { name: "照片 02" })).toBeVisible();
  await swipe(0.25, 0.75);
  await expect(stage.getByRole("img", { name: "照片 01" })).toBeVisible();
});
