<script lang="ts">
	import { intervalOn } from 'svelte-petit-utils';
	import { observe } from './observer';

	export let onPeep = () => {
		console.warn('not implement onPeep');
	};

	let isPeep = false;
	let bye: () => void | undefined;

	const tracker = observe(['peep', 'hidden'], {
		change(ops) {
			if (ops.state === 'peep') {
				bye = intervalOn(onPeep, 200);
			} else {
				bye && bye();
			}
		}
	});
</script>

<div use:tracker.listener>
	<slot />
</div>
