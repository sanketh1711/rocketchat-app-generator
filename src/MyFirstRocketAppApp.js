"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyFirstRocketAppApp = void 0;
const App_1 = require("@rocket.chat/apps-engine/definition/App");
const settings_1 = require("@rocket.chat/apps-engine/definition/settings");
const MentionToggleCommand_1 = require("./commands/MentionToggleCommand");
class MyFirstRocketAppApp extends App_1.App {
    constructor(info, logger, accessors) {
        super(info, logger, accessors);
    }
    async extendConfiguration(configuration) {
        configuration.slashCommands.provideSlashCommand(new MentionToggleCommand_1.MentionToggleCommand());
        await configuration.settings.provideSetting({
            id: 'MENTION_TRACKER_STATE',
            type: settings_1.SettingType.BOOLEAN,
            packageValue: false,
            required: false,
            public: false,
            i18nLabel: 'Mention Tracker State',
            i18nDescription: 'Internal state for mention tracking',
        });
        await configuration.settings.provideSetting({
            id: 'EXTERNAL_LOGGER_URL',
            type: settings_1.SettingType.STRING,
            packageValue: '',
            required: false,
            public: true,
            i18nLabel: 'External Logger URL',
            i18nDescription: 'REST API endpoint to receive mention logs (POST)',
        });
    }
    async onEnable(environment, configurationModify) {
        this.getLogger().info('Mention Tracker App enabled!');
        return true;
    }
    async onDisable(configurationModify) {
        this.getLogger().info('Mention Tracker App disabled');
    }
}
exports.MyFirstRocketAppApp = MyFirstRocketAppApp;
