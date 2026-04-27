# Mobile Testing

How to exercise the demos on a real phone. Pick the option that matches what you need to verify.

## Option 1 — Same-WiFi LAN (quickest, HTTP only)

Bind the Astro dev server to all interfaces and hit your Mac's LAN IP from the phone.

```bash
bun run dev:mobile
```

Astro prints a `Network: http://<mac-ip>:4321/...` line. Open that URL on the phone (same WiFi).

**Works over plain HTTP / LAN IP:**
- File input with `capture="environment"` (camera picker)
- IndexedDB persistence
- `createImageBitmap`, `OffscreenCanvas`, WebP encode

**Does *not* work without HTTPS:**
- Service worker registration (photo-location's offline SW silently won't register)
- Geolocation API (not used by these demos — EXIF + drag-pin instead)

If your phone can't reach the Mac, check **System Settings → Network → Firewall** and allow incoming on the terminal/bun process, or temporarily disable while testing.

## Option 2 — HTTPS tunnel (full fidelity)

A real `https://` URL the phone can hit from anywhere, with secure-context APIs (service worker, geolocation) working.

### Cloudflared (free, no signup)

```bash
brew install cloudflared
bun run dev:mobile &
cloudflared tunnel --url http://localhost:4321
```

Prints `https://<random>.trycloudflare.com`. Open on phone.

### ngrok

```bash
bun run dev:mobile &
ngrok http 4321
```

### Tailscale Funnel

If you already run Tailscale: `tailscale funnel 4321` (after enabling Funnel in the admin console).

Use this option if you want to verify the service worker or any secure-context behavior end-to-end.

## Option 3 — Remote DevTools

Once a page is loaded on mobile, remote inspectors let you watch IndexedDB, memory, URL count, network, console. Invaluable for verifying the Blob/object-URL lifecycle and spotting leaks.

### iOS Safari

1. On iPhone: **Settings → Safari → Advanced → Web Inspector** ON.
2. Plug into Mac, unlock phone, trust the computer.
3. On Mac Safari: **Develop → \<your iPhone\> → \<tab\>**.
4. If the Develop menu is missing: **Safari → Settings → Advanced → "Show Develop menu"**.

### Android Chrome

1. On Android: enable Developer options, turn on **USB debugging**.
2. Plug into the Mac, allow USB debugging prompt.
3. On desktop Chrome: open `chrome://inspect/#devices`, click **inspect** next to the tab.

## Recommended flow

1. `bun run dev:mobile`, phone on same WiFi → smoke-test the core flows.
2. Open the remote inspector → watch IndexedDB records (photo-location) and memory/URL count during add/remove/clear (route-creator).
3. Only switch to Option 2 (cloudflared) if you specifically need the service worker / offline behavior.

## What to verify

### photo-location
- Pick a large device photo — UI stays responsive during `processImage`.
- DevTools → Application → IndexedDB → `photo-location-db` → `entries`: records have `photoThumb` + `photoFull` **Blobs** (not base64 strings).
- Open a popup — thumb renders; close + reopen — no duplicate URLs or visible leak.
- Reload — entries still load, popups still work.

### route-creator
- Add a waypoint with a big photo — no jank; list thumb + route marker + view card all render.
- Switch to **View** mode — card image is the larger `fullUrl` (sharper on retina).
- Remove a waypoint or click **Clear Route** — no broken images on re-add; URL count in DevTools shouldn't grow unbounded across add/remove cycles.
