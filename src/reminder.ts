import { type Context, Composer, session, InlineKeyboard } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";

// Mock database
interface Reminder {
  userId: number;
  messageText: string;
}

const reminders: Reminder[] = [];

type ReminderContext = Context & ConversationFlavor;
type ReminderConversation = Conversation<ReminderContext>;

const reminderComposer = new Composer();

// Debugging without a CRON
reminderComposer.command('sendAllReminders', async (ctx) => {
  for (const reminder of reminders) {
    const { userId, messageText } = reminder;
    ctx.api.sendMessage(userId, `Reminder:\n\n${messageText}`);
  }
});

// Create a new reminder
async function reminderConversation(conversation: ReminderConversation, ctx: ReminderConversation) {
  const { from, message } = ctx;

  const inlineKeyboard = new InlineKeyboard()
    .text('1 minute', 'remind-me');

  await ctx.reply('When would you like to be reminded?', {
    reply_markup: inlineKeyboard,
  });

  const response = await conversation.waitForCallbackQuery(['remind-me'], {
    otherwise: async (ctx) => {
      await ctx.reply('Sorry, I did not understand. Please try again.', {
        reply_markup: inlineKeyboard,
      })
    }
  });

  if (response.match === 'remind-me') {
    await ctx.reply('I will remind you in 1 minute.');
 
    reminders.push({
      userId: from.id,
      messageText: message?.text,
    });
  }
}

reminderComposer.use(session({
  initial() {
    return {};
  }
}));
reminderComposer.use(conversations());
reminderComposer.use(createConversation(reminderConversation));

// Receive a message to start conversation
reminderComposer.on('message', async (ctx) => {
  await ctx.conversation.enter('reminderConversation');
});

export default reminderComposer;
