// One tooltip per chart. Every mark with data-value shows it on hover and on keyboard focus.
// Labels go in with textContent, never innerHTML.
export function bindTooltips(): void {
	document.querySelectorAll<HTMLElement>('.viz-chart:not([data-tips-bound])').forEach((chart) => {
		chart.dataset.tipsBound = 'true';
		const tip = chart.querySelector<HTMLElement>('.viz-tip');
		if (!tip) return;
		const key = tip.querySelector<HTMLElement>('.viz-tip-key')!;
		const value = tip.querySelector<HTMLElement>('.viz-tip-value')!;
		const label = tip.querySelector<HTMLElement>('.viz-tip-label')!;

		const show = (mark: HTMLElement) => {
			value.textContent = mark.dataset.value ?? '';
			label.textContent = mark.dataset.label ?? '';
			key.style.background = mark.dataset.color ?? 'transparent';
			const box = chart.getBoundingClientRect();
			const rect = mark.getBoundingClientRect();
			tip.style.left = `${rect.left - box.left + rect.width / 2}px`;
			tip.style.top = `${rect.top - box.top}px`;
			tip.hidden = false;
			mark.classList.add('is-active');
		};
		const hide = (mark: HTMLElement) => {
			tip.hidden = true;
			mark.classList.remove('is-active');
		};

		chart.querySelectorAll<HTMLElement>('[data-value]').forEach((mark) => {
			mark.addEventListener('pointerenter', () => show(mark));
			mark.addEventListener('pointerleave', () => hide(mark));
			mark.addEventListener('focus', () => show(mark));
			mark.addEventListener('blur', () => hide(mark));
		});
	});
}
