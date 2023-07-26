# svelte-adapter-extension

Adapter for SvelteKit apps to build browser extensions.

## Usage & Building

### Installing

Install with `pnpm`:

```bash
pnpm add -D svelte-adapter-extension
```

### Configuration

Add the adapter to your `svelte.config.js` and set the `appDir` to something else:

```js
import adapter from 'svelte-adapter-extension';

export default {
  kit: {
    adapter: adapter({
      root: 'body > div',
    }),

    // leading underscores are reserved for use by the system
    appDir: 'ext',
  },
};
```

The root option defaults to `body > div`, but you can configure it to any selector you want, make sure to also update your `app.html`:

```diff
...

<body>
-  <div style="display: contents">%sveltekit.body%</div>
+  <div id="master" style="display: contents">%sveltekit.body%</div>
</body>
```

Configure your app to prerender every pages by adding the following to your root `+layout` page options:

```ts
export const prerender = true;
```

### Manifest

Prepare your `manifest.json`, you can copy the defaults below:

```json
{
	"manifest_version": 3,
	"name": "TODO",
	"version": "0.1",
	"icons": {
		"16": "icons/16.png",
		"48": "icons/48.png",
		"128": "icons/128.png"
	},
	"action": {
		"default_title": "SvelteKit Extension",
		"default_popup": "index.html"
	}
}
```

### Development

After enabling "Developer mode" on your browser of choice and pointing the "Load unpacked" directory into the `build` folder, you will only need to reload the extension when [these component changes](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#reload). You can also add the following script to make developing easier:

```diff
  ...
  "scripts": {
+    "watch": "vite build --watch",	
	...

  }
  ...
```

### TypeScript

For TypeScript goodness, make sure to install chrome's typings:

```bash
pnpm add -D @types/chrome
```
