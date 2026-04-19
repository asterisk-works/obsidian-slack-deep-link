import { Plugin, Editor, MarkdownView, Notice } from 'obsidian';
import { SlackDeepLinkSettings, DEFAULT_SETTINGS, SlackDeepLinkSettingTab, WorkspaceMapping } from './settings';

function convertSlackUrl(url: string, workspaces: WorkspaceMapping[]): string | null {
	const match = url.match(
		/https:\/\/([^/]+\.slack\.com)\/archives\/([A-Z0-9]+)\/p([0-9]{10})([0-9]{6})(?:\?.*thread_ts=([0-9.]+))?/
	);

	if (!match) return null;

	const domain = match[1];
	const channelId = match[2];
	const tsInt = match[3];
	const tsDec = match[4];
	const threadTs = match[5];

	const workspace = workspaces.find(w => w.domain === domain);
	if (!workspace) return null;

	const message = `${tsInt}.${tsDec}`;
	let deepLink = `slack://channel?team=${workspace.teamId}&id=${channelId}&message=${message}`;

	if (threadTs) {
		deepLink += `&thread_ts=${threadTs}`;
	}

	return deepLink;
}

export default class SlackDeepLinkPlugin extends Plugin {
	settings: SlackDeepLinkSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SlackDeepLinkSettingTab(this.app, this));

		document.addEventListener('paste', this.onPaste, true);

		this.addCommand({
			id: 'slack-shift-paste',
			name: 'Paste Slack link as plain URL (Shift paste)',
			editorCallback: async (editor: Editor) => {
				const text = await navigator.clipboard.readText();
				if (!text) return;

				const trimmed = text.trim();
				if (!trimmed.match(/https:\/\/[^/]+\.slack\.com\/archives\//)) {
					editor.replaceSelection(trimmed);
					return;
				}

				const selectedText = editor.getSelection();
				const linkText = selectedText || 'slack';
				editor.replaceSelection(`[${linkText}](${trimmed})`);
			},
			hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'v' }],
		});
	}

	async onunload() {
		document.removeEventListener('paste', this.onPaste, true);
	}

	private onPaste = (evt: ClipboardEvent) => {
		const text = evt.clipboardData?.getData('text/plain');
		if (!text) return;

		const trimmed = text.trim();

		if (!trimmed.match(/https:\/\/[^/]+\.slack\.com\/archives\//)) return;

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) return;

		const editor = view.editor;
		const selectedText = editor.getSelection();

		evt.preventDefault();
		evt.stopPropagation();

		const converted = convertSlackUrl(trimmed, this.settings.workspaces);
		if (!converted) {
			// マッピングが見つからない場合は通知を表示しそのままURLを貼り付け
			const notice = new Notice('', 5000);
			notice.messageEl.createEl('span', { text: 'SlackDeepLink: No workspace mapping found. ' });
			notice.messageEl.createEl('a', {
				text: 'Open Settings',
				href: '#',
			}).addEventListener('click', () => {
				(this.app as any).setting.open();
				(this.app as any).setting.openTabById('slack-deep-link');
				notice.hide();
			});
			editor.replaceSelection(trimmed);
			return;
		}

		const linkText = selectedText || 'slack app';
		editor.replaceSelection(`[${linkText}](${converted})`);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

