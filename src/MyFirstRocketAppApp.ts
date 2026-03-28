import {
    IAppAccessors,
    IConfigurationExtend,
    IConfigurationModify,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { ISetting, SettingType } from '@rocket.chat/apps-engine/definition/settings';

import { MentionToggleCommand } from './commands/MentionToggleCommand';
import { MentionListener } from './listeners/MentionListener';

export class MyFirstRocketAppApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    // Register & slash command to toggle mention tracking
    protected async extendConfiguration(configuration: IConfigurationExtend): Promise<void> {
        
        configuration.slashCommands.provideSlashCommand(new MentionToggleCommand());

        // settings
        await configuration.settings.provideSetting({
            id: 'MENTION_TRACKER_STATE',
            type: SettingType.BOOLEAN,
            packageValue: false,
            required: false,
            public: false,
            i18nLabel: 'Mention Tracker State',
            i18nDescription: 'Internal state for mention tracking',
        } as ISetting);

        await configuration.settings.provideSetting({
            id: 'EXTERNAL_LOGGER_URL',
            type: SettingType.STRING,
            packageValue: '',
            required: false,
            public: true,
            i18nLabel: 'External Logger URL',
            i18nDescription: 'REST API endpoint to receive mention logs (POST)',
        } as ISetting);
    }

   
    public async onEnable(
        environment: IEnvironmentRead,
        configurationModify: IConfigurationModify,
    ): Promise<boolean> {
        this.getLogger().info('Mention Tracker App enabled!');
        return true;
    }

    
    public async onDisable(configurationModify: IConfigurationModify): Promise<void> {
        this.getLogger().info('Mention Tracker App disabled');
    }
}