const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api'); 

async function sendConcatenatedMessage(chilli, text, kalamansi) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);

    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 1000));  
      await sendMessage(chilli, { text: message }, kalamansi);
    }
  } else {
    await sendMessage(chilli, { text }, kalamansi);
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
  name: 'ai2',
  description: 'Ai2 Educational Command.',
  usage: 'ai2 <query>',
  author: 'Developer',
  async execute(kupal, args, pageAccessToken) {
    if (args.length === 0) {
      await sendMessage(kupal, {
        text: 'Usage: ai2 [your_question]\nExample: ai2 what is love'
      }, pageAccessToken);
      return;
    }

    const query = args.join(' ');
    const apiUrl = `${api.joshWebApi}/api/mixtral-8b?q=${encodeURIComponent(query)}`;

    try {
      const response = await axios.get(apiUrl);
      const result = response.data.result;

      if (result) {
        await sendConcatenatedMessage(kupal, result, pageAccessToken);
      } else {
        await sendMessage(kupal, {
          text: 'An error occurred while fetching the response. Please try again later.'
        }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      await sendMessage(kupal, {
        text: 'An error occurred while generating the response. Please try again later.'
      }, pageAccessToken);
    }
  }
};
