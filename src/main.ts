import { Plugin, Editor, MarkdownView } from 'obsidian';
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
		document.addEventListener('paste', this.onPaste, true); // captureフェーズ
	}

	async onunload() {
		document.removeEventListener('keydown', this.onKeyDown);
		document.removeEventListener('keyup', this.onKeyUp);
		document.removeEventListener('paste', this.onPaste, true);
	}

	private onKeyDown = (evt: KeyboardEvent) => {
		if (evt.shiftKey) this.isShiftDown = true;
	}

	private onKeyUp = (evt: KeyboardEvent) => {
		if (!evt.shiftKey) this.isShiftDown = false;
	}

	private onPaste = (evt: ClipboardEvent) => {
		const text = evt.clipboardData?.getData('text/plain');
		if (!text) return;

		const trimmed = text.trim();

		// Slackのリンクでなければ何もしない
		if (!trimmed.match(/https:\/\/[^/]+\.slack\.com\/archives\//)) return;

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) return;

		const editor = view.editor;
		const selectedText = editor.getSelection();

		evt.preventDefault();
		evt.stopPropagation(); // Auto Link Titleへの伝播を止める

		if (this.isShiftDown) {
			const linkText = selectedText || 'Slack Link';
			editor.replaceSelection(`[${linkText}](${trimmed})`);
			return;
		}

		const converted = convertSlackUrl(trimmed, this.settings.teamId);
		if (!converted) return;

		const linkText = selectedText || 'Slack App Link';
		editor.replaceSelection(`[${linkText}](${converted})`);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
