const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

async function sendConcatenatedMessage(senderId, text, pageAccessToken) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await sendMessage(senderId, { text: message }, pageAccessToken);
    }
  } else {
    await sendMessage(senderId, { text }, pageAccessToken);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

module.exports = {
  name: 'aidetector',
  description: 'Analyzes text using the AI Detector API.',
  usage: 'aidetector <query>',
  author: 'Developer',
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Usage: aidetector [your_query]\nExample: aidetector Is this AI-generated content?'
      }, pageAccessToken);
      return;
    }

    const query = args.join(' ');
    const apiUrl = `${api.kaizen}/api/aidetector?q=${encodeURIComponent(query)}`;

    try {
      const response = await axios.get(apiUrl);
      const apiData = response.data.response.data;

      if (apiData) {
        const msgText = `
𝗥𝗲𝘀𝘂𝗹𝘁: ${apiData.feedback}
𝗛𝘂𝗺𝗮𝗻 𝗣𝗲𝗿𝗰𝗲𝗻𝘁𝗮𝗴𝗲: ${apiData.isHuman}%
𝗔𝗜 𝗣𝗲𝗿𝗰𝗲𝗻𝘁𝗮𝗴𝗲: ${apiData.fakePercentage}%
𝗧𝗲𝘅𝘁 𝗪𝗼𝗿𝗱𝘀: ${apiData.textWords}
𝗔𝗜 𝗪𝗼𝗿𝗱𝘀: ${apiData.aiWords}
        `;
        const header = `🤖 𝗔𝗜 𝗗𝗘𝗧𝗘𝗖𝗧𝗢𝗥\n・───────────・\n`;
        const fullMessage = `${header}${msgText}`;
        await sendConcatenatedMessage(senderId, fullMessage, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: 'The AI Detector API did not return a valid response. Please try again.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error fetching data from AI Detector API:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while processing your request. Please try again later.'
      }, pageAccessToken);
    }
  }
};
    
