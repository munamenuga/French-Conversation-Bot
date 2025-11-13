const express = require('express');
const twilio = require('twilio');
const OpenAI = require('openai');
const VocabularyLogger = require('./vocabularyLogger');

const app = express();
const PORT = 5000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const vocabularyLogger = new VocabularyLogger('./vocabulary.json');

let twilioClient = null;
let twilioPhoneNumber = null;

async function getTwilioCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken || !hostname) {
    console.log('⚠️  Twilio connection not available - using basic webhook mode');
    return null;
  }

  try {
    const response = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=twilio',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    );
    
    const data = await response.json();
    const connectionSettings = data.items?.[0];

    if (!connectionSettings || !connectionSettings.settings.account_sid || !connectionSettings.settings.api_key || !connectionSettings.settings.api_key_secret) {
      console.log('⚠️  Twilio not fully configured - using basic webhook mode');
      return null;
    }
    
    return {
      accountSid: connectionSettings.settings.account_sid,
      apiKey: connectionSettings.settings.api_key,
      apiKeySecret: connectionSettings.settings.api_key_secret,
      phoneNumber: connectionSettings.settings.phone_number
    };
  } catch (error) {
    console.error('Error fetching Twilio credentials:', error);
    return null;
  }
}

async function initializeTwilio() {
  const credentials = await getTwilioCredentials();
  if (credentials) {
    twilioClient = twilio(credentials.apiKey, credentials.apiKeySecret, {
      accountSid: credentials.accountSid
    });
    twilioPhoneNumber = credentials.phoneNumber;
    console.log(`✅ Twilio connected with phone number: ${twilioPhoneNumber}`);
  }
}

const conversationHistory = new Map();

const SYSTEM_PROMPT = `Tu es un professeur de français très patient et encourageant. Ton rôle est d'aider les étudiants à pratiquer le français en suivant ces règles:

1. Réponds TOUJOURS en français
2. Corrige les erreurs grammaticales et d'orthographe de manière constructive
3. Introduis naturellement de nouveaux mots de vocabulaire dans la conversation
4. Quand tu corriges une erreur, explique pourquoi c'est incorrect et donne la bonne version
5. Quand tu introduis un nouveau mot, donne une brève définition ou explication
6. Garde un ton amical et encourageant
7. Adapte-toi au niveau de l'étudiant

Lorsque tu introduis un nouveau mot important, formate-le ainsi: [VOCAB: mot - définition courte]
Lorsque tu corriges une erreur, formate-la ainsi: [CORRECTION: incorrect -> correct - explication]`;

async function getFrenchResponse(userMessage, phoneNumber) {
  let history = conversationHistory.get(phoneNumber) || [];
  
  if (history.length === 0) {
    history.push({
      role: 'system',
      content: SYSTEM_PROMPT
    });
  }
  
  history.push({
    role: 'user',
    content: userMessage
  });
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: history,
      temperature: 0.7,
      max_tokens: 500
    });
    
    const assistantMessage = response.choices[0].message.content;
    
    history.push({
      role: 'assistant',
      content: assistantMessage
    });
    
    if (history.length > 20) {
      history = [history[0], ...history.slice(-19)];
    }
    
    conversationHistory.set(phoneNumber, history);
    
    extractAndLogVocabulary(assistantMessage, phoneNumber);
    
    return assistantMessage;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return 'Désolé, j\'ai rencontré un problème technique. Peux-tu réessayer?';
  }
}

function extractAndLogVocabulary(message, phoneNumber) {
  const vocabRegex = /\[VOCAB:\s*([^-]+)\s*-\s*([^\]]+)\]/g;
  const correctionRegex = /\[CORRECTION:\s*([^-]+)\s*->\s*([^-]+)\s*-\s*([^\]]+)\]/g;
  
  let match;
  
  while ((match = vocabRegex.exec(message)) !== null) {
    const word = match[1].trim();
    const definition = match[2].trim();
    vocabularyLogger.logWord(phoneNumber, word, definition, 'vocabulary');
  }
  
  while ((match = correctionRegex.exec(message)) !== null) {
    const incorrect = match[1].trim();
    const correct = match[2].trim();
    const explanation = match[3].trim();
    vocabularyLogger.logWord(phoneNumber, correct, `Correction de "${incorrect}": ${explanation}`, 'correction');
  }
}

function cleanResponseForWhatsApp(message) {
  return message
    .replace(/\[VOCAB:[^\]]+\]/g, '')
    .replace(/\[CORRECTION:[^\]]+\]/g, '')
    .trim();
}

app.post('/webhook', async (req, res) => {
  const incomingMessage = req.body.Body;
  const fromNumber = req.body.From;
  
  console.log(`Message reçu de ${fromNumber}: ${incomingMessage}`);
  
  const frenchResponse = await getFrenchResponse(incomingMessage, fromNumber);
  const cleanResponse = cleanResponseForWhatsApp(frenchResponse);
  
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(cleanResponse);
  
  res.type('text/xml').send(twiml.toString());
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>WhatsApp French Tutor Bot</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
          color: #25D366;
        }
        .status {
          padding: 10px;
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 5px;
          margin: 20px 0;
        }
        .setup-steps {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        code {
          background-color: #f4f4f4;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🇫🇷 WhatsApp French Tutor Bot</h1>
        <div class="status">
          ✅ Server is running on port ${PORT}
        </div>
        
        <h2>Features</h2>
        <ul>
          <li>💬 Practice French conversation in real-time</li>
          <li>✏️ Automatic error correction with explanations</li>
          <li>📚 New vocabulary introduction</li>
          <li>📝 Vocabulary logging to JSON file</li>
        </ul>
        
        <div class="setup-steps">
          <h2>Setup Instructions</h2>
          <ol>
            <li>Create a Twilio account at <a href="https://www.twilio.com" target="_blank">twilio.com</a></li>
            <li>Set up WhatsApp sandbox in Twilio Console</li>
            <li>Configure your webhook URL to: <code>https://your-repl-url/webhook</code></li>
            <li>Make sure you have set <code>OPENAI_API_KEY</code> in your environment</li>
            <li>Send a message to your Twilio WhatsApp number to start practicing!</li>
          </ol>
        </div>
        
        <h2>How to Use</h2>
        <p>Simply send any message in French (or try in English!) to the WhatsApp number. The bot will:</p>
        <ul>
          <li>Respond in French to help you practice</li>
          <li>Correct any errors you make</li>
          <li>Introduce new words naturally</li>
          <li>Keep track of all vocabulary in <code>vocabulary.json</code></li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'WhatsApp French Tutor is running!' });
});

async function startServer() {
  await initializeTwilio();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🇫🇷 WhatsApp French Tutor Bot démarré sur le port ${PORT}`);
    console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
  });
}

startServer();
