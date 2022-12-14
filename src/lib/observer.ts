import { __BROWSER__ } from 'svelte-petit-utils';

export type RANGE = RANGE_STATE | 'focus' | 'horizon' | 'vertical' | 'box';
type RANGE_STATE = 'compress' | 'hidden' | 'peep' | 'show';

export const bit = {
	focus: 0b10000,
	top: 0b01000,
	right: 0b00100,
	bottom: 0b00010,
	left: 0b00001
};

type OperationsElement = HTMLDivElement & { tracker: Operations };

type UseListener = {
	(this: Operations, el: HTMLDivElement): {
		destroy: () => void;
	};
};

interface OperationsOptions {
	change: (ops: Operations) => void;
}

const COMPRESS = 'compress';
const HIDDEN = 'hidden';
const PEEP = 'peep';
const SHOW = 'show';
const FOCUS = 'focus';
const HORIZON = 'horizon';
const VERTICAL = 'vertical';
const BOX = 'box';

const noop = () => {};

class Operations {
	focus: number;
	state?: RANGE_STATE;
	el?: OperationsElement;
	options: OperationsOptions;
	listener: UseListener;

	constructor({ change = noop }: OperationsOptions, listener: UseListener) {
		this.options = { change };
		this.listener = listener;
		this.state = undefined;
		this.focus = 0;
	}

	setOptions({ change = noop }: OperationsOptions) {
		this.options = { change };
		return this;
	}
}

export const observe = observeFactory();

function cbRange(keyOn: RANGE_STATE, keyOff: RANGE_STATE, entries: IntersectionObserverEntry[]) {
	entries.forEach(({ target, isIntersecting }) => {
		const tracker = (target as any).tracker as Operations;
		const { change } = tracker.options;
		tracker.state = isIntersecting ? keyOn : keyOff;
		change(tracker);
	});
}

function cbFocus(entries: IntersectionObserverEntry[]) {
	entries.forEach(({ target, isIntersecting, rootBounds, boundingClientRect }) => {
		if (!rootBounds) return;

		const tracker = (target as any).tracker as Operations;
		const { change } = tracker.options;

		let sides = 0;
		if (isIntersecting) sides |= bit.focus;
		if (rootBounds.top > boundingClientRect.top) sides |= bit.top;
		if (rootBounds.right < boundingClientRect.right) sides |= bit.right;
		if (rootBounds.bottom < boundingClientRect.bottom) sides |= bit.bottom;
		if (rootBounds.left > boundingClientRect.left) sides |= bit.left;
		tracker.focus = sides;
		change(tracker);
	});
}

function observeFactory() {
	if (!__BROWSER__) return observer;
	const deployObserver = new IntersectionObserver(cbRange.bind(null, HIDDEN, COMPRESS), {
		rootMargin: '25%',
		threshold: 0
	});

	const peepObserver = new IntersectionObserver(cbRange.bind(null, PEEP, HIDDEN), {
		rootMargin: '0%',
		threshold: 0
	});

	const showObserver = new IntersectionObserver(cbRange.bind(null, SHOW, PEEP), {
		rootMargin: '0%',
		threshold: 1
	});

	const coreObserver = new IntersectionObserver(cbFocus, {
		rootMargin: '-50%',
		threshold: 0
	});

	const horizonObserver = new IntersectionObserver(cbFocus, {
		rootMargin: '-50% 0%',
		threshold: 0
	});

	const verticalObserver = new IntersectionObserver(cbFocus, {
		rootMargin: '0% -50%',
		threshold: 0
	});

	const boxObserver = new IntersectionObserver(cbFocus, {
		rootMargin: '0%',
		threshold: Array.from({ length: 100 }, (_, k) => k / 100)
	});

	return observer;
	function observer(range: RANGE[], options: OperationsOptions) {
		return new Operations(options, function (this, el) {
			this.el = el as OperationsElement;
			this.el.tracker = this;

			if (range.includes(HIDDEN) && range.includes(COMPRESS)) deployObserver.observe(el);
			if (range.includes(PEEP) && range.includes(HIDDEN)) peepObserver.observe(el);
			if (range.includes(SHOW) && range.includes(PEEP)) showObserver.observe(el);

			if (range.includes(FOCUS)) coreObserver.observe(el);
			if (range.includes(HORIZON)) horizonObserver.observe(el);
			if (range.includes(VERTICAL)) verticalObserver.observe(el);
			if (range.includes(BOX)) boxObserver.observe(el);

			return { destroy };
			function destroy() {
				deployObserver.unobserve(el);
				peepObserver.unobserve(el);
				showObserver.unobserve(el);
				coreObserver.unobserve(el);
				horizonObserver.unobserve(el);
				verticalObserver.unobserve(el);
				boxObserver.unobserve(el);
			}
		});
	}
}
