"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentionListener = void 0;
class MentionListener {
    constructor() {
        this.TARGET_USERNAME = 'sanketh1711';
    }
    async executePostMessageSent(message, read, http, persistence, modify) {
        await this.processMention(message, read, modify, http, persistence);
    }
    async processMention(message, read, modify, http, persistence) {
        try {
            if (!message.sender) {
                return;
            }
            const messageText = message.text || '';
            const sender = message.sender;
            const room = message.room;
            const mentionPattern = new RegExp(`@${this.TARGET_USERNAME}`, 'i');
            if (!mentionPattern.test(messageText)) {
                return;
            }
            const isTrackingEnabled = true;
            if (!isTrackingEnabled) {
                return;
            }
            const settings = read.getEnvironmentReader().getSettings();
            let externalLoggerUrl = '';
            try {
                externalLoggerUrl = await settings.getValueById('EXTERNAL_LOGGER_URL');
            }
            catch (e) {
                externalLoggerUrl = '';
            }
            if (externalLoggerUrl && externalLoggerUrl.trim().length > 0) {
                await this.handleExternalLogging(sender, messageText, http, externalLoggerUrl, modify, room, persistence);
            }
            else {
                await this.handleLocalLogging(sender, modify, room);
            }
        }
        catch (error) {
            console.error('Error in mention handler:', error);
        }
    }
    async handleLocalLogging(sender, modify, room) {
        try {
            const messageBuilder = modify
                .getCreator()
                .startMessage()
                .setRoom(room)
                .setText(`Thank you for mentioning me, @${sender.username}`);
            await modify.getCreator().finish(messageBuilder);
        }
        catch (error) {
            console.error('Error sending local logging message:', error);
        }
    }
    async handleExternalLogging(sender, messageText, http, externalLoggerUrl, modify, room, persistence) {
        try {
            const payload = {
                userid: sender.id,
                message: messageText,
            };
            let response;
            try {
                response = await http.post(externalLoggerUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: JSON.stringify(payload),
                });
            }
            catch (httpError) {
                console.error('HTTP request failed:', httpError);
                await this.handleLocalLogging(sender, modify, room);
                return;
            }
            if (!response || !response.statusCode || response.statusCode >= 400) {
                console.error(`External logger returned error: ${response === null || response === void 0 ? void 0 : response.statusCode}`);
                await this.handleLocalLogging(sender, modify, room);
                return;
            }
            let responseData;
            if (!response.content) {
                console.error('Response content is empty');
                await this.handleLocalLogging(sender, modify, room);
                return;
            }
            try {
                responseData = JSON.parse(response.content);
            }
            catch (parseError) {
                console.error('Invalid JSON response:', parseError);
                await this.handleLocalLogging(sender, modify, room);
                return;
            }
            if (!responseData.result) {
                console.error('Missing "result" field in response');
                await this.handleLocalLogging(sender, modify, room);
                return;
            }
            const finalMessage = `${responseData.result} [${responseData.id || 'N/A'}]`;
            const messageBuilder = modify
                .getCreator()
                .startMessage()
                .setRoom(room)
                .setText(finalMessage);
            await modify.getCreator().finish(messageBuilder);
            try {
                const mentionRecordId = `mention_${Date.now()}_${sender.id}`;
                await persistence.create({
                    id: mentionRecordId,
                    data: {
                        userId: sender.id,
                        username: sender.username,
                        message: messageText,
                        timestamp: Date.now(),
                        externalLogged: true,
                    },
                });
            }
            catch (persistError) {
                console.error('Error saving mention record:', persistError);
            }
        }
        catch (error) {
            console.error('Error in external logging:', error);
            await this.handleLocalLogging(sender, modify, room);
        }
    }
}
exports.MentionListener = MentionListener;
