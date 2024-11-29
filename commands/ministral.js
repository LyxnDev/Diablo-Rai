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
  name: 'ministral',
  description: 'Generate AI-powered responses using Ministral-3B.',
  usage: 'ministral <your_query>',
  author: 'Jay Mar',
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Usage: ministral [your_query]\nExample: ministral Explain machine learning.'
      }, pageAccessToken);
      return;
    }

    const question = args.join(' ');
    const apiUrl = `${api.kenlie2}/ministral-3b-paid/?question=${encodeURIComponent(question)}`;

    try {
      const response = await axios.get(apiUrl);
      const result = response.data.response;

      if (result) {
        const header = '🤖 𝗠𝗜𝗡𝗜𝗦𝗧𝗥𝗔𝗟 𝟯𝗕\n・──────────────・\n';
        await sendConcatenatedMessage(senderId, header + result, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: '⚠️ Unable to fetch a response. Please try again later.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error with Ministral command:', error.message || error);
      await sendMessage(senderId, {
        text: '⚠️ An error occurred while processing your request. Please try again later.'
      }, pageAccessToken);
    }
  }
};
  
