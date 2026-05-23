import { Plugin, Editor, MarkdownView, Notice } from 'obsidian';
import { SlackDeepLinkSettings, DEFAULT_SETTINGS, SlackDeepLinkSettingTab, WorkspaceMapping } from './settings';
import { isInsideMarkdownLinkUrl } from './utils/editor-context';
import { parseMarkdownLink } from './utils/link-parser';

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
			name: 'Paste Slack link as plain URL (shift paste)',
			editorCallback: async (editor: Editor) => {
				const text = await navigator.clipboard.readText();
				if (!text) return;

				const trimmed = text.trim();
				if (!trimmed.match(/https:\/\/[^/]+\.slack\.com\/archives\//)) {
					editor.replaceSelection(trimmed);
					return;
				}

				const cursor = editor.getCursor('from');
				const beforeCursor = editor.getLine(cursor.line).substring(0, cursor.ch);
				if (isInsideMarkdownLinkUrl(beforeCursor)) {
					editor.replaceSelection(trimmed);
					return;
				}

				const selectedText = editor.getSelection();
				const linkText = selectedText || 'slack';
				editor.replaceSelection(`[${linkText}](${trimmed})`);
			},
		});
	}

	onunload() {
		document.removeEventListener('paste', this.onPaste, true);
	}

	private onPaste = (evt: ClipboardEvent) => {
		const text = evt.clipboardData?.getData('text/plain');
		if (!text) return;

		const trimmed = text.trim();
		const mdLink = parseMarkdownLink(trimmed);
		const urlToProcess = mdLink ? mdLink.url : trimmed;

		if (!urlToProcess.match(/https:\/\/[^/]+\.slack\.com\/archives\//)) return;

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) return;

		const editor = view.editor;
		const selectedText = editor.getSelection();

		evt.preventDefault();
		evt.stopPropagation();

		const cursor = editor.getCursor('from');
		const beforeCursor = editor.getLine(cursor.line).substring(0, cursor.ch);
		const inLinkUrl = isInsideMarkdownLinkUrl(beforeCursor);

		const converted = convertSlackUrl(urlToProcess, this.settings.workspaces);
		if (!converted) {
			// マッピングが見つからない場合は通知を表示しそのままURLを貼り付け
			const notice = new Notice('', 5000);
			notice.messageEl.createEl('span', { text: 'No workspace mapping found. ' });
			notice.messageEl.createEl('a', {
				text: 'Open settings',
				href: '#',
			}).addEventListener('click', () => {
				const appWithSetting = this.app as unknown as { setting: { open: () => void; openTabById: (id: string) => void } };
				appWithSetting.setting.open();
				appWithSetting.setting.openTabById('slack-deep-link');
				notice.hide();
			});
			editor.replaceSelection(inLinkUrl && mdLink ? mdLink.url : trimmed);
			return;
		}

		if (inLinkUrl) {
			editor.replaceSelection(converted);
		} else if (mdLink) {
			const linkText = selectedText || mdLink.linkText;
			editor.replaceSelection(`${mdLink.prefix}[${linkText}](${converted})`);
		} else {
			const linkText = selectedText || 'slack app';
			editor.replaceSelection(`[${linkText}](${converted})`);
		}
	}

	async loadSettings() {
		const data = await this.loadData() as Partial<SlackDeepLinkSettings>;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

