const Message = require("../models/Message");
const AISummary = require("../models/AISummary");
const { summarizeWithAI } = require("../services/aiService");

exports.summarizeGroup = async(req,res)=>{
  const { groupId } = req.params;
  const userId = req.user._id;

  const messages = await Message.find({ group: groupId })
    .sort({ createdAt: 1 })
    .limit(50);

  if(!messages.length){
    return res.json({ summary: "No messages to summarize." });
  }

  const text = messages.map(m=>m.text || "[File]").join("\n");

  const summary = await summarize(text);

  const saved = await AISummary.create({
    group: groupId,
    user: userId,
    summary,
    messageIds: messages.map(m=>m._id)
  });

  res.json(saved);
};
