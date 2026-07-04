import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		// SvelteKit config (including the adapter) lives here instead of a
		// separate svelte.config.js — supported directly by sveltekit() since
		// @sveltejs/kit 2.62.0, and there's nothing here that needs its own file.
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			adapter: adapter()
		})
	],
	test: {
		include: ['src/**/*.test.ts']
	}
});
