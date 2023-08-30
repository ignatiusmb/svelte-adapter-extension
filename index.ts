import type { Adapter } from '@sveltejs/kit';
import * as fs from 'node:fs';
import { join } from 'node:path';

interface Options {
	/**
	 * CSS selector for the root element
	 * @default 'body > div'
	 */
	root?: string;

	/**
	 * Path to `manifest.json` source file
	 * @default './manifest.json'
	 */
	source?: string;

	/**
	 * Filename for generated single-page app
	 * @default undefined
	 */
	output?: '' | `${string}.html`;
}
export default function ({
	root = 'body > div',
	source = './manifest.json',
	output = '',
}: Options = {}): Adapter {
	const pages = 'build';
	const assets = pages;

	return {
		name: 'svelte-adapter-extension',

		async adapt(builder) {
			builder.rimraf(assets);
			builder.rimraf(pages);

			builder.writeClient(assets);
			builder.writePrerendered(pages);

			const spa = join(pages, output);
			if (output) await builder.generateFallback(spa);

			// externalize inline scripts in HTML files
			walk(pages, (pathname) => {
				if (!pathname.endsWith('.html')) return;

				const html = fs.readFileSync(pathname, 'utf-8');
				const externalized = html.replace(
					/<script>[\n\t\r]*({[\n\t\r]*__sveltekit[^]*})[\n\t\r]*<\/script>/,
					(_, content) => {
						content = content.split(/\r?\n/g).slice(1, -1);
						content = outdent(content.join('\n'));
						content = `window.${content.replace(
							/document\.currentScript\.parentElement/,
							`document.querySelector('${root}')`,
						)}`;
						const file = pathname.slice(pages.length + 1, -5);
						fs.writeFileSync(join(pages, `./${file}.js`), content);
						const src = pathname === spa ? `/${output.slice(0, -5)}` : `./${file}`;
						return `<script src="${src.replace(/\\/g, '/')}.js"></script>`;
					},
				);
				fs.writeFileSync(pathname, externalized);
			});

			const manifest = fs.existsSync(source)
				? JSON.parse(fs.readFileSync(source, 'utf-8'))
				: { manifest_version: 3, name: 'TODO', version: '0.1' };
			fs.writeFileSync(join(assets, source), JSON.stringify(manifest));
		},
	};
}

function outdent(input: string) {
	const lines = input.split(/\r?\n/).filter((l) => l.trim());
	const indent = (/^\s*/.exec(lines[0]) || [''])[0].length;
	return lines.map((l) => l.slice(indent)).join('\n');
}

function walk(entry: string, fn: (pathname: string) => void) {
	for (const name of fs.readdirSync(entry)) {
		const path = join(entry, name);
		if (fs.statSync(path).isDirectory()) {
			walk(path, fn);
		} else {
			fn(path);
		}
	}
}
