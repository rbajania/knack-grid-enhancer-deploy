# Knack Grid Enhancer — locked-down Netlify deploy

Two layers of protection, both included:

1. **Server-side gate** (`netlify/functions/serve-script.js`) — only serves the
   file to requests whose `Origin`/`Referer` matches an allowed domain you set
   in Netlify's dashboard. Everyone else gets a 403 with no code in the body.
2. **Client-side domain lock** (baked into the minified file) — even if the
   file ever leaks, it refuses to run outside the hostnames you list.

## Before you deploy (stay locked)

Leave `ALLOWED_ORIGINS` unset, or don't add it yet. With no allowed origins,
`serve-script.js` returns 403 to every request — including your own — so the
real code is never served, even after the site is live on Netlify. Deploying
the site does NOT make the script public; the function is what gates it.

## To deploy

1. Push this folder to a GitHub repo (or drag-and-drop deploy on Netlify —
   note drag-and-drop skips functions, so a git-connected site is easier for
   this setup).
2. In Netlify: **New site from Git** → pick the repo → deploy. Netlify
   auto-detects `netlify.toml`.
3. Your gated URL becomes: `https://YOUR-SITE.netlify.app/kge.js`.

## When you're ready to go live in Knack

1. **Edit the domain lock** in
   `netlify/functions/assets/knack-grid-enhancer.min.js` — replace
   `"REPLACE-ME.knack.com"` with your actual Knack app domain(s), e.g.:
   ```js
   var ALLOWED_HOSTS=["yourapp.knack.com","yourapp.com"];
   ```
2. **Set the env var** in Netlify: Site settings → Environment variables →
   add `ALLOWED_ORIGINS` = `yourapp.knack.com,yourapp.com` (comma-separated,
   no spaces needed, substring match).
3. Redeploy (env var changes and file edits both require a redeploy to take
   effect on the function).
4. In Knack: **Settings → API & Code → JavaScript**, add:
   ```html
   <script src="https://YOUR-SITE.netlify.app/kge.js"></script>
   ```

## Good to know

- This blocks casual reuse (someone finding the URL, another Knack app
  pointing a `<script>` tag at it, direct downloads via curl/browser). A
  determined person who is already an authorized user of your app could still
  view the script via their browser's dev tools/Network tab while it's
  running — that's true of any client-side JS on the web, nothing server-side
  can fully prevent it once code executes in someone's browser.
- `Referer`/`Origin` headers can be omitted by some privacy tools, which
  would also block *your own* legitimate load. If your Knack app users report
  the enhancer silently not loading, that's the first thing to check.
- Rotate the URL (new site name) if a leaked link ever becomes a problem —
  cheaper than trying to patch around it.
