<script lang="ts">
	import { Pager } from '$lib';

	let list = new Array(100).fill('').map((o, i) => ({ id: i + 1, name: (i + 1).toString() }));
	let at_page = 1;
	let hash = '';
</script>

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<Pager chunk={5} bind:page={at_page} bind:focus={hash} id={(item) => item.id} bind:list let:item>
	<div class="item" id={item.id}>{item.name}</div>
</Pager>

<style>
	.item {
		height: 200px;
	}
</style>
