import { defineMiddleware } from "astro:middleware";
import { isPrivatePath } from "./config/privacy.mjs";

export const onRequest = defineMiddleware((context, next) => {
  // This also runs during static prerendering, before private page content or
  // metadata is rendered. Local development keeps the author's full pages.
  if (import.meta.env.PROD && isPrivatePath(context.url.pathname)) {
    return context.rewrite("/private/");
  }

  return next();
});
