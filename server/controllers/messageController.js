const Message = require("../models/Message");
const { extractPdfText } = require("../services/pdfService");
const { summarizeWithAI } = require("../services/aiService");

/* ─────────────────────────────────────────────
   GROUP CHAT + FILE SUMMARY
───────────────────────────────────────────── */
exports.summarizeGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    /* ───── FETCH ALL MESSAGES ───── */
    const messages = await Message.find({ group: groupId })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    if (!messages.length) {
      return res.json({
        chatSummary: "No messages to summarize.",
        fileSummaries: []
      });
    }

    /* ───── CHAT TEXT ONLY ───── */
    const chatMessages = messages.filter(
      (m) => m.type !== "file" && m.text
    );

    // Convert array of messages to readable string
    const chatText = chatMessages
      .map(m => `${m.sender?.name || "Unknown"}: ${m.text}`)
      .join("\n");

    const chatSummary = chatText
      ? await summarizeWithAI(chatText)
      : "No chat messages to summarize.";

    /* ───── FILE SUMMARIES ───── */
    const fileSummaries = messages
      .filter(
        (m) =>
          m.type === "file" &&
          m.file &&
          m.file.summary
      )
      .map((m) => ({
        fileName: m.file.originalName,
        summary: m.file.summary
      }));

    /* ───── RESPONSE ───── */
    res.json({
      chatSummary,
      fileSummaries
    });
  } catch (err) {
    console.error("🔥 AI SUMMARY ERROR:");
    console.error(err.message || err);

    res.status(500).json({
      message: "AI summarization failed"
    });
  }
};

/* ─────────────────────────────────────────────
   FILE MESSAGE HANDLER (PDF)
───────────────────────────────────────────── */
exports.handleFileMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    /* ───── EXTRACT PDF TEXT ───── */
    const extractedText = await extractPdfText(file.buffer);

    /* ───── SUMMARIZE FILE ───── */
    const summary = extractedText
      ? await summarizeWithAI(extractedText)
      : "No readable text found in PDF.";

    /* ───── SAVE MESSAGE ───── */
    const message = await Message.create({
      group: groupId,
      sender: req.user.id,
      type: "file",
      file: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        extractedText,
        summary
      }
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("🔥 FILE SUMMARY ERROR:");
    console.error(err.message || err);

    res.status(500).json({
      message: "File summarization failed"
    });
  }
};
