class TelegramService {
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN || ''
        this.baseUrl = `https://api.telegram.org/bot${this.botToken}`
    }

    async sendMessage(chatId, message){
        try {
            await fetch(`${this.baseUrl}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown',
                }),
            })
            return true
        } catch (error) {
            console.error("Erreur lors de l'envoi du message Telegram:", error)
            return false
        }
    }

    async sendNotification(chatId, title, body) {
        const formattedMessage = `
*${title}*
${body}
    `.trim()

        return this.sendMessage(chatId, formattedMessage)
    }
}

module.exports = TelegramService;
