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
  name: 'llama',
  description: 'Interacts with Llama AI.',
  usage: 'llama <prompt>',
  author: 'Developer',
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(senderId, {
        text: 'Usage: llama [your_question]\nExample: llama what is artificial intelligence?'
      }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');
    const apiUrl = `${api.joshWebApi}/api/llama-3-70b?q=${encodeURIComponent(prompt)}`;

    try {
      const response = await axios.get(apiUrl);
      const result = response.data.result;

      if (result) {
        const header = '🤖 𝗟𝗟𝗔𝗠𝗔\n・───────────・\n';
        await sendConcatenatedMessage(senderId, header + result, pageAccessToken);
      } else {
        await sendMessage(senderId, {
          text: 'An error occurred while fetching the response. Please try again later.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while generating the response. Please try again later.'
      }, pageAccessToken);
    }
  }
};
