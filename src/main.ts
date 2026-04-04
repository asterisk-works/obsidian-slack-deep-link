import { Plugin, Editor } from 'obsidian';
import { SlackDeepLinkSettings, DEFAULT_SETTINGS, SlackDeepLinkSettingTab } from './settings';

function convertSlackUrl(url: string, teamId: string): string | null {
	const match = url.match(
		/https:\/\/[^/]+\.slack\.com\/archives\/([A-Z0-9]+)\/p([0-9]{10})([0-9]{6})(?:\?.*thread_ts=([0-9.]+))?/
	);

	if (!match) return null;

	const channelId = match[1];
	const tsInt = match[2];
	const tsDec = match[3];
	const threadTs = match[4];

	const message = `${tsInt}.${tsDec}`;
	let deepLink = `slack://channel?team=${teamId}&id=${channelId}&message=${message}`;

	if (threadTs) {
		deepLink += `&thread_ts=${threadTs}`;
	}

	return deepLink;
}

export default class SlackDeepLinkPlugin extends Plugin {
	settings: SlackDeepLinkSettings;
	private isShiftDown = false;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SlackDeepLinkSettingTab(this.app, this));

		document.addEventListener('keydown', this.onKeyDown);
		document.addEventListener('keyup', this.onKeyUp);

		this.registerEvent(
			this.app.workspace.on('editor-paste', (evt: ClipboardEvent, editor: Editor) => {
				if (this.isShiftDown) return;

				const text = evt.clipboardData?.getData('text/plain');
				if (!text) return;

				const converted = convertSlackUrl(text.trim(), this.settings.teamId);
				if (!converted) return;

				evt.preventDefault();
				editor.replaceSelection(`[Slack App Link](${converted})`);
			})
		);
	}

	async onunload() {
		document.removeEventListener('keydown', this.onKeyDown);
		document.removeEventListener('keyup', this.onKeyUp);
	}

	private onKeyDown = (evt: KeyboardEvent) => {
		if (evt.shiftKey) this.isShiftDown = true;
	}

	private onKeyUp = (evt: KeyboardEvent) => {
		if (!evt.shiftKey) this.isShiftDown = false;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
