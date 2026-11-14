import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { WeChatSkin, type SkinProps } from "./AppSkins";
import { makeItem } from "./schema";

it("pins empty contacts with their avatar without adding unread messages or bubbles", () => {
  const avatar = "data:image/jpeg;base64,/9j/2Q==";
  const contact = makeItem({ id: "bucky-contact", title: "bucky❤️", sender: "bucky❤️", body: "CONTACT_ONLY", avatar, meta: { contact: "true", pinned: "true" } });
  const props: SkinProps = {
    name: "WeChat", creator: false, thread: "", items: [
      makeItem({ id: "other", title: "Other", body: "Hello" }), contact,
    ],
    onRead() {}, onItem() {}, onAdd() {}, onBack() {}, onThread() {},
  };
  const html = renderToStaticMarkup(createElement(WeChatSkin, props));
  expect(html.indexOf("bucky❤️")).toBeLessThan(html.indexOf("Other"));
  expect(html).toContain('data-pinned="true"');
  expect(html).toContain(avatar);
  expect(html).not.toContain("CONTACT_ONLY");
  const thread = renderToStaticMarkup(createElement(WeChatSkin, { ...props, thread: "bucky❤️" }));
  expect(thread).not.toContain("CONTACT_ONLY");
  expect(thread).not.toContain('class="skin-bubble');
});
