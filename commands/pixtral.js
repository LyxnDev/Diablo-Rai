const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');
const api = require('../handles/api');

module.exports = {
  name: "pixtral",
  description: "Analyze images or answer text-based queries using Pixtral Ai.",
  usage: "pixtral <question> | [Attach or Reply to an image]",
  author: "Jay Mar",

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    const userPrompt = args.join(" ").trim();

    if (!userPrompt && !imageUrl && !getAttachmentUrl(event)) {
      return sendMessage(senderId, {
        text: "Usage: Send 'pixtral <question>' with image or without an image."
      }, pageAccessToken);
    }

    if (!imageUrl) {
      imageUrl = getAttachmentUrl(event) || (await getRepliedImage(event, pageAccessToken));
    }

    try {
      const apiUrl = `${api.kenlie2}/pixtral-paid/`;
      const { data } = await axios.get(apiUrl, {
        params: {
          question: userPrompt || "Answer all question that need to answer?",
          image_url: imageUrl || ""
        }
      });

      if (!data || !data.response) {
        return sendMessage(senderId, {
          text: "⚠️ Unable to process your request. Try again."
        }, pageAccessToken);
      }

      const header = "🌌 𝗣𝗜𝗫𝗧𝗥𝗔𝗟 𝗔𝗜\n・──────────────・\n";
      await sendMessage(senderId, { text: header + data.response }, pageAccessToken);

    } catch (error) {
      console.error("Error in Gemini command:", error.message || error);
      await sendMessage(senderId, {
        text: "⚠️ An error occurred. Please try again later."
      }, pageAccessToken);
    }
  }
};

function getAttachmentUrl(event) {
  const attachment = event.message?.attachments?.[0];
  return attachment?.type === "image" ? attachment.payload.url : null;
}

async function getRepliedImage(event, pageAccessToken) {
  if (event.message?.reply_to?.mid) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/v21.0/${event.message.reply_to.mid}/attachments`, {
        params: { access_token: pageAccessToken }
      });
      const imageData = data?.data?.[0]?.image_data;
      return imageData ? imageData.url : null;
    } catch (error) {
      console.error("Error fetching replied image:", error.message || error);
      return null;
    }
  }
  return null;
  }
          