import 'dotenv/config';
import { Bot } from "grammy";
import reminder from './reminder';

// Create bot instance
const bot = new Bot(process.env.BOT_AUTH_TOKEN ?? '');

// Use reminder composer
bot.use(reminder);

// Start the bot
bot.start();
