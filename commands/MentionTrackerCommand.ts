import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from '@rocket.chat/apps-engine/definition/metadata';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { MentionTrackerApp } from '../MentionTrackerApp';

export class MentionTrackerCommand implements ISlashCommand {
    public command = 'sanketh1711';
    public i18nParamsExample = 'on | off';
    public i18nDescription = 'Toggle mention tracking on or off';
    public providesPreview = false;

    constructor(private readonly app: MentionTrackerApp) {}

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence,
    ): Promise<void> {
        const [subcommand] = context.getArguments();
        const sender = context.getSender();
        const room = context.getRoom();

        if (!subcommand || (subcommand !== 'on' && subcommand !== 'off')) {
            await this.notifyUser(modify, room, sender, 'Usage: `/sanketh1711 on` or `/sanketh1711 off`');
            return;
        }

        const assoc = new RocketChatAssociationRecord(
            RocketChatAssociationModel.MISC,
            'mention-tracking',
        );

        if (subcommand === 'on') {
            await persistence.updateByAssociation(
                assoc,
                { enabled: true, trackedUser: sender.username },
                true,
            );
            await this.notifyUser(
                modify,
                room,
                sender,
                `Mention tracking is now **ON** for @${sender.username}. You will receive a thank-you message whenever someone mentions you.`,
            );
        } else {
            await persistence.updateByAssociation(
                assoc,
                { enabled: false, trackedUser: sender.username },
                true,
            );
            await this.notifyUser(
                modify,
                room,
                sender,
                `Mention tracking is now **OFF** for @${sender.username}.`,
            );
        }
    }

    private async notifyUser(
        modify: IModify,
        room: IRoom,
        user: IUser,
        text: string,
    ): Promise<void> {
        const msg = modify
            .getCreator()
            .startMessage()
            .setRoom(room)
            .setText(text)
            .getMessage();
        await modify.getNotifier().notifyUser(user, msg);
    }
}
