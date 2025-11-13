# WhatsApp French Tutor Bot

## Overview
This project is a WhatsApp bot that helps users practice French through AI-powered conversation. Built with Node.js, Express, OpenAI GPT-4, and Twilio, it provides real-time French practice with error correction and vocabulary logging.

## Current State
- ✅ Server running on port 5000
- ✅ OpenAI integration configured
- ✅ Twilio webhook endpoints ready
- ✅ Vocabulary logging system implemented
- ⏳ Awaiting Twilio WhatsApp configuration

## Recent Changes (November 13, 2025)
- Created Node.js project with Express server
- Integrated OpenAI GPT-4 for French conversation
- Implemented Twilio webhook for WhatsApp messaging
- Built vocabulary logging system with JSON storage
- Added comprehensive documentation

## Project Architecture

### Core Files
- **server.js**: Main Express server handling WhatsApp webhooks
  - Manages conversation history per user
  - Integrates OpenAI for French responses
  - Processes incoming/outgoing WhatsApp messages
  - Extracts and logs vocabulary from responses

- **vocabularyLogger.js**: Vocabulary management system
  - Stores words and corrections in JSON format
  - Organizes data by phone number
  - Prevents duplicate entries
  - Provides stats and retrieval methods

- **vocabulary.json**: Generated data file
  - Stores all learned vocabulary
  - Tracks corrections
  - Includes timestamps and user data

### Dependencies
- **express**: Web server framework
- **twilio**: WhatsApp messaging integration
- **openai**: AI-powered French conversation

### Configuration
- Port: 5000 (required for Replit webview)
- OpenAI Model: GPT-4
- Environment Variables: OPENAI_API_KEY

## Setup Requirements

### Completed
1. ✅ Node.js environment
2. ✅ OpenAI API key added to secrets
3. ✅ Server configured and running

### User Actions Required
1. Create Twilio account
2. Set up WhatsApp sandbox
3. Configure webhook URL in Twilio
4. Test with WhatsApp messages

## How It Works

1. User sends WhatsApp message to Twilio number
2. Twilio forwards message to `/webhook` endpoint
3. Server retrieves conversation history for user
4. OpenAI generates French response with corrections/vocabulary
5. System extracts and logs new words
6. Response is sent back to user via WhatsApp

## Key Features

### French Conversation
- Natural conversation in French
- Maintains context across messages
- Adapts to user's level
- Encouraging and patient teaching style

### Error Correction
- Identifies grammar and spelling mistakes
- Provides correct versions
- Explains errors clearly
- Logs corrections for review

### Vocabulary Building
- Introduces new words contextually
- Provides brief definitions
- Tracks all new vocabulary
- Prevents duplicate logging

## Vocabulary Logging Format

The bot uses special markers in responses:
- `[VOCAB: word - definition]` for new vocabulary
- `[CORRECTION: wrong -> right - explanation]` for corrections

These markers are stripped from WhatsApp messages but used to populate the vocabulary.json file.

## API Endpoints

- `GET /`: Welcome page with setup instructions
- `POST /webhook`: Twilio webhook for WhatsApp messages
- `GET /health`: Server health check

## User Preferences
- Language: French learning focus
- Platform: WhatsApp
- Storage: JSON file for vocabulary
- AI Provider: OpenAI

## Technical Notes

### Conversation Management
- History stored in Map (in-memory)
- Limited to 20 messages per user to manage tokens
- System prompt defines teaching behavior

### Error Handling
- Graceful OpenAI API error handling
- Fallback French error messages
- Console logging for debugging

### Security
- API keys stored in environment variables
- No sensitive data in code
- Vocabulary file excluded from git
