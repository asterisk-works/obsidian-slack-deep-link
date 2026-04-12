import { App, PluginSettingTab, Setting } from 'obsidian';
import SlackDeepLinkPlugin from './main';

export interface WorkspaceMapping {
	domain: string;
	teamId: string;
}

export interface SlackDeepLinkSettings {
	workspaces: WorkspaceMapping[];
}

export const DEFAULT_SETTINGS: SlackDeepLinkSettings = {
	workspaces: []
};

export class SlackDeepLinkSettingTab extends PluginSettingTab {
	plugin: SlackDeepLinkPlugin;

	constructor(app: App, plugin: SlackDeepLinkPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h3', { text: 'Workspaces' });

		const table = containerEl.createDiv({ cls: 'slack-deep-link-table' });

		const header = table.createDiv({ cls: 'slack-deep-link-row' });
		header.createDiv({ cls: 'slack-deep-link-header', text: 'Domain' });
		header.createDiv({ cls: 'slack-deep-link-header', text: 'Team ID' });
		header.createDiv({ cls: 'slack-deep-link-header' });

		this.plugin.settings.workspaces.forEach((workspace, index) => {
			const row = table.createDiv({ cls: 'slack-deep-link-row' });

			const domainInput = row.createEl('input', { type: 'text' });
			domainInput.placeholder = 'example.slack.com';
			domainInput.value = workspace.domain;
			domainInput.addEventListener('change', async () => {
				const ws = this.plugin.settings.workspaces[index];
				if (ws) ws.domain = domainInput.value.trim();
				await this.plugin.saveSettings();
			});

			const teamIdInput = row.createEl('input', { type: 'text' });
			teamIdInput.placeholder = 'TXXXXXXXXX';
			teamIdInput.value = workspace.teamId;
			teamIdInput.addEventListener('change', async () => {
				const ws = this.plugin.settings.workspaces[index];
				if (ws) ws.teamId = teamIdInput.value.trim();
				await this.plugin.saveSettings();
			});

			const removeButton = row.createEl('button', { text: 'Remove', cls: 'mod-warning' });
			removeButton.addEventListener('click', async () => {
				this.plugin.settings.workspaces.splice(index, 1);
				await this.plugin.saveSettings();
				this.display();
			});
		});

		new Setting(containerEl)
			.addButton(button => button
				.setButtonText('Add Workspace')
				.setCta()
				.onClick(async () => {
					this.plugin.settings.workspaces.push({ domain: '', teamId: '' });
					await this.plugin.saveSettings();
					this.display();
				})
			);
	}
}

