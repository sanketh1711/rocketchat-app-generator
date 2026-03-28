import {
    IAppAccessors,
    IConfigurationExtend,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from '@rocket.chat/apps-engine/definition/metadata';
import { IMessage, IPostMessageSent } from '@rocket.chat/apps-engine/definition/messages';
import { MentionTrackerCommand } from './commands/MentionTrackerCommand';

export class MentionTrackerApp extends App implements IPostMessageSent {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async extendConfiguration(configuration: IConfigurationExtend): Promise<void> {
        await configuration.slashCommands.provideSlashCommand(new MentionTrackerCommand(this));
    }

    public async executePostMessageSent(
        message: IMessage,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
    ): Promise<void> {
        // Ignore messages with no text content
        if (!message.text) {
            return;
        }

        // Look up current tracking state from persistence
        const assoc = new RocketChatAssociationRecord(
            RocketChatAssociationModel.MISC,
            'mention-tracking',
        );
        const data = await read.getPersistenceReader().readByAssociation(assoc);

        if (!data || !data[0]) {
            return;
        }

        const trackingData = data[0] as { enabled: boolean; trackedUser: string };

        if (!trackingData.enabled) {
            return;
        }

        // Escape any regex special characters in the username, then check for mention
        const escapedUsername = trackingData.trackedUser.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const mentionPattern = new RegExp(`@${escapedUsername}(?:\\b|$)`, 'i');
        const isMentioned = mentionPattern.test(message.text);

        if (!isMentioned) {
            return;
        }

        // Send an ephemeral "thank you" message to whoever wrote the mention
        const sender = message.sender;
        const room = message.room;

        const ephemeralMsg = modify
            .getCreator()
            .startMessage()
            .setRoom(room)
            .setText(`Thank you for mentioning me, @${sender.username}!`)
            .getMessage();

        await modify.getNotifier().notifyUser(sender, ephemeralMsg);
    }
}
