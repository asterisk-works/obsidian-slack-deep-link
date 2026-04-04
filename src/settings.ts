import { App, PluginSettingTab, Setting } from 'obsidian';
import SlackDeepLinkPlugin from './main';

export interface SlackDeepLinkSettings {
	teamId: string;
}

export const DEFAULT_SETTINGS: SlackDeepLinkSettings = {
	teamId: 'YOUR_TEAM_ID'
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

		new Setting(containerEl)
			.setName('Team ID')
			.setDesc('Slack のチーム ID')
			.addText(text => text
				.setPlaceholder('TXXXXXXXXX')
				.setValue(this.plugin.settings.teamId)
				.onChange(async (value) => {
					this.plugin.settings.teamId = value.trim();
					await this.plugin.saveSettings();
				})
			);
	}
}

