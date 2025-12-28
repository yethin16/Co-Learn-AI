require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");
const User = require("./models/User");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);

/* ───────── MIDDLEWARE ───────── */

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ───────── ROUTES ───────── */

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/groups", require("./routes/groupRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));


app.get("/", (req, res) => {
  res.send("API running");
});

/* ───────── DATABASE ───────── */

connectDB();

/* ───────── SOCKET.IO SETUP ───────── */

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

/* ───────── SOCKET AUTH ───────── */
/* attaches full user object to socket */

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return next(new Error("User not found"));

    socket.user = user; // ✅ store full user
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

/* ───────── SOCKET EVENTS ───────── */

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.user._id.toString());

  /* JOIN GROUP ROOM */
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(
      `User ${socket.user._id} joined group ${groupId}`
    );
  });

  /* SEND MESSAGE (ROOM ISOLATED) */
  socket.on("sendMessage", async ({ groupId, text }) => {
    if (!text || !groupId) return;

    const message = await Message.create({
      group: groupId,
      sender: socket.user._id,
      text
    });

    const populatedMessage = await message.populate(
      "sender",
      "name"
    );

    /* 🔒 CRITICAL: emit ONLY to this group */
    io.to(groupId).emit("receiveMessage", populatedMessage);
  });

  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.user._id.toString()
    );
  });
});

/* ───────── SERVER START ───────── */

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
