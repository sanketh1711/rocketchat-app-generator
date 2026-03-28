"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentionToggleCommand = void 0;
class MentionToggleCommand {
    constructor() {
        this.COMMAND_NAME = 'sanketh1711';
        this.command = this.COMMAND_NAME;
        this.i18nParamsExample = 'on|off';
        this.i18nDescription = 'Toggle mention tracking on or off';
        this.providesPreview = false;
    }
    async executor(context, read, modify, http, persistence) {
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
        const statusText = isTracking ? '✅ ON' : '❌ OFF';
        const message = modify.getCreator()
            .startMessage()
            .setRoom(room)
            .setSender(user)
            .setText(`Mention tracking is now ${statusText}`);
        await modify.getCreator().finish(message);
    }
}
exports.MentionToggleCommand = MentionToggleCommand;
