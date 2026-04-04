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

		this.plugin.settings.workspaces.forEach((workspace, index) => {
			const setting = new Setting(containerEl)
				.addText(text => text
					.setPlaceholder('example.slack.com')
					.setValue(workspace.domain)
					.onChange(async (value) => {
						this.plugin.settings.workspaces[index].domain = value.trim();
						await this.plugin.saveSettings();
					})
				)
				.addText(text => text
					.setPlaceholder('TXXXXXXXXX')
					.setValue(workspace.teamId)
					.onChange(async (value) => {
						this.plugin.settings.workspaces[index].teamId = value.trim();
						await this.plugin.saveSettings();
					})
				)
				.addButton(button => button
					.setButtonText('Remove')
					.setWarning()
					.onClick(async () => {
						this.plugin.settings.workspaces.splice(index, 1);
						await this.plugin.saveSettings();
						this.display();
					})
				);
			setting.settingEl.style.alignItems = 'center';
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

