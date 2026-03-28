import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import {
    ISlashCommand,
    SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';


export class MentionToggleCommand implements ISlashCommand {
    
    private readonly COMMAND_NAME = 'sanketh1711';

    public command = this.COMMAND_NAME;
    public i18nParamsExample = 'on|off';
    public i18nDescription = 'Toggle mention tracking on or off';
    public providesPreview = false;

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence,
    ): Promise<void> {
        const args = context.getArguments();
        const action = args[0];
        const user = context.getSender();
        const room = context.getRoom();

       
        if (!action || (action.toLowerCase() !== 'on' && action.toLowerCase() !== 'off')) {
            throw new Error(`Usage: /${this.COMMAND_NAME} on|off`);
        }

        
        const isTracking = action.toLowerCase() === 'on';

        
        const recordId = `mention_tracking_${user.id}`;
        await persistence.create({
            id: recordId,
            data: {
                userId: user.id,
                username: user.username,
                trackingEnabled: isTracking,
                timestamp: Date.now(),
            },
        });

        // Send feedback message
        const statusText = isTracking ? '✅ ON' : '❌ OFF';
        const message = modify.getCreator()
            .startMessage()
            .setRoom(room)
            .setSender(user)
            .setText(`Mention tracking is now ${statusText}`);

        await modify.getCreator().finish(message);
    }
}