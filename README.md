# 🇫🇷 WhatsApp French Tutor Bot

A WhatsApp bot powered by OpenAI that helps you practice French through natural conversation, error correction, and vocabulary building.

## Features

- **🗣️ Natural Conversation**: Chat in French with an AI-powered tutor that responds naturally
- **✏️ Error Correction**: Automatic correction of grammar and spelling mistakes with clear explanations
- **📚 Vocabulary Introduction**: Learn new words introduced contextually during conversation
- **📝 Vocabulary Logging**: All new words and corrections are saved to a JSON file for review
- **💬 WhatsApp Integration**: Practice anytime, anywhere through WhatsApp

## How It Works

The bot uses:
- **OpenAI GPT-4** for intelligent French conversation and corrections
- **Twilio** for WhatsApp messaging integration
- **Express.js** for handling webhook requests
- **JSON file storage** for vocabulary tracking

## Setup Instructions

### 1. Prerequisites

- Node.js installed (this project uses Node.js 20+)
- An OpenAI API key
- A Twilio account with WhatsApp enabled

### 2. OpenAI API Key

You've already added your OpenAI API key. It's securely stored as an environment variable.

### 3. Twilio WhatsApp Setup

1. **Create a Twilio Account**
   - Go to [twilio.com](https://www.twilio.com) and sign up
   - Complete the verification process

2. **Set Up WhatsApp Sandbox** (for testing)
   - In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
   - Follow the instructions to join the sandbox by sending a code to the Twilio WhatsApp number
   - Note: This is for testing. For production, you'll need to request WhatsApp Business API access

3. **Configure Webhook**
   - In the WhatsApp Sandbox settings, find the "When a message comes in" field
   - Enter your webhook URL: `https://your-repl-url/webhook`
   - To get your Repl URL, look at the webview window - it will be something like `https://[project-name].[username].repl.co`
   - Set the method to **POST**
   - Save the configuration

### 4. Test Your Bot

1. Send a message to the Twilio WhatsApp number (from the sandbox setup)
2. The bot will respond in French!
3. Try messages like:
   - "Bonjour! Comment ça va?" (Hello! How are you?)
   - "Je veux apprendre le français" (I want to learn French)
   - Or even in English - the bot will respond in French to help you practice

## Features in Detail

### Conversation

The bot acts as a patient French teacher. It will:
- Always respond in French
- Adapt to your level
- Keep conversation history for context
- Encourage you to practice more

### Error Correction

When you make a mistake, the bot will:
- Point out the error
- Show the correct version
- Explain why it was wrong
- Format: `[CORRECTION: incorrect -> correct - explanation]`

### Vocabulary Building

The bot introduces new words naturally and:
- Provides brief definitions
- Uses words in context
- Logs them for later review
- Format: `[VOCAB: word - short definition]`

### Vocabulary Logging

All vocabulary and corrections are saved in `vocabulary.json`:
- Organized by phone number
- Includes timestamps
- Tracks both new words and corrections
- Prevents duplicate vocabulary entries

## File Structure

```
.
├── server.js              # Main Express server with WhatsApp webhook
├── vocabularyLogger.js    # Vocabulary logging system
├── vocabulary.json        # Generated file storing all learned words
├── package.json           # Project dependencies
└── README.md             # This file
```

## API Endpoints

- `GET /` - Information page about the bot
- `POST /webhook` - Twilio webhook for incoming WhatsApp messages
- `GET /health` - Health check endpoint

## Vocabulary JSON Structure

```json
{
  "metadata": {
    "created": "2025-11-13T...",
    "description": "French vocabulary and corrections log"
  },
  "users": {
    "whatsapp:+1234567890": {
      "firstSeen": "2025-11-13T...",
      "vocabulary": [
        {
          "word": "bonjour",
          "definition": "hello/good day",
          "timestamp": "2025-11-13T...",
          "date": "13/11/2025"
        }
      ],
      "corrections": [
        {
          "word": "je suis",
          "definition": "Correction de 'je sui': verb 'être' conjugated...",
          "timestamp": "2025-11-13T...",
          "date": "13/11/2025"
        }
      ]
    }
  }
}
```

## Troubleshooting

### Bot doesn't respond
- Check that the webhook URL is correctly configured in Twilio
- Verify the server is running (check the console output)
- Make sure you've joined the WhatsApp sandbox

### OpenAI errors
- Verify your OpenAI API key is valid and has credits
- Check the console logs for specific error messages

### Webhook not receiving messages
- Ensure your Repl is running and accessible
- Check that the webhook URL uses HTTPS
- Verify the URL in Twilio matches your actual Repl URL

## Conversation Tips

- Start with simple greetings: "Bonjour!", "Salut!"
- Ask questions: "Comment tu t'appelles?", "Qu'est-ce que tu aimes faire?"
- Make intentional mistakes to practice corrections
- Ask for explanations: "Qu'est-ce que ça veut dire?"
- Practice regularly for best results!

## Future Enhancements

Potential features to add:
- Vocabulary review mode
- Spaced repetition system
- Difficulty level adjustment
- Daily vocabulary summaries
- Conversation topic selection
- Voice message support

## License

ISC

---

Happy learning! 🇫🇷 Bonne chance!
