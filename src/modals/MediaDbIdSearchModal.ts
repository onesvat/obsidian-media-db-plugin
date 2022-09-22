import {ButtonComponent, DropdownComponent, Modal, Notice, Setting, TextComponent} from 'obsidian';
import {MediaTypeModel} from '../models/MediaTypeModel';
import {debugLog} from '../utils/Utils';
import MediaDbPlugin from '../main';

export class MediaDbIdSearchModal extends Modal {
	query: string;
	isBusy: boolean;
	plugin: MediaDbPlugin;
	searchBtn: ButtonComponent;
	selectedApi: string;
	submitCallback?: (res: { query: string, api: string }, err?: Error) => void;
	closeCallback?: (err?: Error) => void;

	constructor(plugin: MediaDbPlugin) {
		super(plugin.app);
		this.plugin = plugin;
		this.selectedApi = plugin.apiManager.apis[0].apiName;
	}

	setSubmitCallback(submitCallback: (res: { query: string, api: string }, err?: Error) => void): void {
		this.submitCallback = submitCallback;
	}

	setCloseCallback(closeCallback: (err?: Error) => void): void {
		this.closeCallback = closeCallback;
	}

	keyPressCallback(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			this.search();
		}
	}

	async search(): Promise<MediaTypeModel> {

		debugLog(this.selectedApi);

		if (!this.query) {
			new Notice('MDB | no Id entered');
			return;
		}

		if (!this.selectedApi) {
			new Notice('MDB | No API selected');
			return;
		}

		if (!this.isBusy) {
			this.isBusy = true;
			this.searchBtn.setDisabled(false);
			this.searchBtn.setButtonText('Searching...');

			this.submitCallback({query: this.query, api: this.selectedApi});
		}
	}

	onOpen() {
		const {contentEl} = this;

		contentEl.createEl('h2', {text: 'Search media db by id'});

		const placeholder = 'Search by id';
		const searchComponent = new TextComponent(contentEl);
		searchComponent.inputEl.style.width = '100%';
		searchComponent.setPlaceholder(placeholder);
		searchComponent.onChange(value => (this.query = value));
		searchComponent.inputEl.addEventListener('keydown', this.keyPressCallback.bind(this));

		contentEl.appendChild(searchComponent.inputEl);
		searchComponent.inputEl.focus();

		contentEl.createDiv({cls: 'media-db-plugin-spacer'});

		const apiSelectorWrapper = contentEl.createEl('div', {cls: 'media-db-plugin-list-wrapper'});
		const apiSelectorTExtWrapper = apiSelectorWrapper.createEl('div', {cls: 'media-db-plugin-list-text-wrapper'});
		apiSelectorTExtWrapper.createEl('span', {text: 'API to search', cls: 'media-db-plugin-list-text'});

		const apiSelectorComponent = new DropdownComponent(apiSelectorWrapper);
		apiSelectorComponent.onChange((value: string) => {
			this.selectedApi = value;
		});
		for (const api of this.plugin.apiManager.apis) {
			apiSelectorComponent.addOption(api.apiName, api.apiName);
		}
		apiSelectorWrapper.appendChild(apiSelectorComponent.selectEl);

		contentEl.createDiv({cls: 'media-db-plugin-spacer'});

		new Setting(contentEl)
			.addButton(btn => btn.setButtonText('Cancel').onClick(() => this.close()))
			.addButton(btn => {
				return (this.searchBtn = btn
					.setButtonText('Ok')
					.setCta()
					.onClick(() => {
						this.search();
					}));
			});
	}

	onClose() {
		this.closeCallback();
		const {contentEl} = this;
		contentEl.empty();
	}

}
