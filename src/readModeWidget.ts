import TaskProgressBarPlugin from "./taskProgressBarIndex";
import { MarkdownPostProcessorContext } from "obsidian";

interface GroupElement {
	parentElement: HTMLElement;
	childrenElement: HTMLElement[];
}

function groupElementsByParent(childrenElements: HTMLElement[]) {
	const parentMap = new Map();

	childrenElements.forEach((child: HTMLElement) => {
		const parent = child.parentElement;

		if (parent) {
			if (parentMap.has(parent)) {
				parentMap.get(parent).push(child);
			} else {
				parentMap.set(parent, [child]);
			}
		}
	});

	const result: GroupElement[] = [];
	parentMap.forEach((children, parent) => {
		result.push({parentElement: parent, childrenElement: children});
	});

	return result;
}

export function updateProgressBarInElement({plugin, element, ctx}: {
	plugin: TaskProgressBarPlugin, element: HTMLElement, ctx: MarkdownPostProcessorContext
}) {
	if (!element.find('ul.contains-task-list')) return;

	const elements = element.findAll('.task-list-item');
	const groupedElements = groupElementsByParent(elements);
	for (let group of groupedElements) {
		if (group.parentElement.parentElement && group.parentElement?.parentElement.hasClass('task-list-item')) {

			const progressBar = new ProgressBar(plugin, group).onload();

			const previousSibling = group.parentElement.previousElementSibling;
			if (previousSibling && previousSibling.tagName === 'P') {
				previousSibling.appendChild(progressBar);
			} else {
				group.parentElement.parentElement.insertBefore(progressBar, group.parentElement);
			}
		}
	}
}


class ProgressBar {
	progressBarEl: HTMLSpanElement;
	progressBackGroundEl: HTMLDivElement;
	progressEl: HTMLDivElement;
	numberEl: HTMLDivElement;

	plugin: TaskProgressBarPlugin;

	completed: number;
	total: number;

	group: GroupElement;

	constructor(plugin: TaskProgressBarPlugin, group: GroupElement) {
		this.plugin = plugin;

		this.group = group;
		this.updateCompletedAndTotal();

		for (let el of this.group.childrenElement) {
			el.on('click', 'input', () => {
				setTimeout(() => {
					this.updateCompletedAndTotal();
					this.changePercentage();
					this.changeNumber();
				}, 200);
			});
		}
	}

	updateCompletedAndTotal() {
		const checked = this.group.childrenElement.filter((el) => el.hasClass('is-checked')).length;
		const total = this.group.childrenElement.length;

		this.numberEl?.detach();

		console.log(checked, total);

		this.completed = checked;
		this.total = total;
	}

	changePercentage() {
		const percentage = Math.round(this.completed / this.total * 10000) / 100;
		this.progressEl.style.width = percentage + '%';
		switch (true) {
			case percentage >= 0 && percentage < 25:
				this.progressEl.className = 'progress-bar-inline progress-bar-inline-0';
				break;
			case percentage >= 25 && percentage < 50:
				this.progressEl.className = 'progress-bar-inline progress-bar-inline-1';
				break;
			case percentage >= 50 && percentage < 75:
				this.progressEl.className = 'progress-bar-inline progress-bar-inline-2';
				break;
			case percentage >= 75 && percentage < 100:
				this.progressEl.className = 'progress-bar-inline progress-bar-inline-3';
				break;
			case percentage >= 100:
				this.progressEl.className = 'progress-bar-inline progress-bar-inline-4';
				break;
		}
	}

	changeNumber() {
		if (this.plugin?.settings.addNumberToProgressBar) {
			const text = this.plugin?.settings.showPercentage ? `${Math.round(this.completed / this.total * 10000) / 100}%` : `[${this.completed}/${this.total}]`;

			this.numberEl = this.progressBarEl.createEl('div', {
				cls: 'progress-status',
				text: text
			});
		}
		this.numberEl.innerText = `[${this.completed}/${this.total}]`;
	}

	onload() {
		this.progressBarEl = createSpan(this.plugin?.settings.addNumberToProgressBar ? 'cm-task-progress-bar with-number' : 'cm-task-progress-bar');
		this.progressBackGroundEl = this.progressBarEl.createEl('div', {cls: 'progress-bar-inline-background'});
		this.progressEl = this.progressBackGroundEl.createEl('div');

		if (this.plugin?.settings.addNumberToProgressBar && this.total) {

			const text = this.plugin?.settings.showPercentage ? `${Math.round(this.completed / this.total * 10000) / 100}%` : `[${this.completed}/${this.total}]`;

			this.numberEl = this.progressBarEl.createEl('div', {
				cls: 'progress-status',
				text: text
			});

		}

		this.changePercentage();

		return this.progressBarEl;
	}
}
