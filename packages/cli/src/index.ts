import { Command } from 'commander';

type TelegramResponse = {
  ok: boolean;
  result?: {
    message_id?: number;
  };
  description?: string;
};

const program = new Command();

program
  .name('sendkit')
  .description('Sendkit tutorial CLI')
  .command('telegram')
  .description('Send a Telegram Message')
  .argument('<chatId>', 'Telegram chat Id')
  .argument('<message>', 'Message text to send')
  .action(async (chatId: string, message: string) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      console.error('Missing TELEGRAM_BOT_TOKEN env variable');
      process.exit(1);
    }

    if (!chatId) {
      console.error('Missing Telegram chat id');
      process.exit(1);
    }

    if (!message) {
      console.error('Missing Telegram text message');
      process.exit(1);
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const data = (await response.json()) as TelegramResponse;

    if (!response.ok || !data.ok) {
      const detail = data.description ?? response.statusText;
      console.error(`Telegram API request failed: ${detail}`);
      process.exit(1);
    }

    const messageId = data.result?.message_id;

    console.log(`Sent Telegram message to chat id ${chatId}`);

    if (messageId !== undefined) {
      console.log(`Telegram message Id: ${messageId}`);
      
    }
    
  });

program.parseAsync(process.argv);

