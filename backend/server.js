// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { readData, writeData } = require("./dataStore");

const app = express();
app.use(cors());
app.use(express.json());

// HTTP server
const server = http.createServer(app);

// Socket.IO setup (allow any origin for dev; tighten in prod)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// In-memory maps for active poll state and participants
const socketToUsername = new Map(); // socketId -> username
const usernameToSocketId = new Map(); // username -> socketId
const participants = new Set(); // usernames currently in chat
const activePolls = new Map(); // pollId -> { timerId, pollObject, closed }

// REST endpoints

// Teacher login stub: returns a teacher username (frontend expects login.data.username)
app.post("/teacher-login", (req, res) => {
  // In dev, we just return a synthetic teacher username; in prod you'd authenticate
  const teacherUsername = `teacher_${Date.now()}`;
  res.json({ success: true, username: teacherUsername });
});

// Get polls for a teacher
app.get("/polls/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const data = await readData();
    const polls = data.polls.filter((p) => p.teacherUsername === username);
    res.json({ success: true, data: polls });
  } catch (err) {
    console.error("GET /polls error", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// (Optional) Get all polls - for debugging
app.get("/polls", async (req, res) => {
  const data = await readData();
  res.json({ success: true, data: data.polls });
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // joinChat: { username }
  socket.on("joinChat", (payload) => {
    const username = payload?.username || `guest_${socket.id.slice(0,6)}`;
    socketToUsername.set(socket.id, username);
    usernameToSocketId.set(username, socket.id);
    participants.add(username);

    // notify everyone of participants update
    io.emit("participantsUpdate", Array.from(participants));

    // optional: welcome
    console.log(`${username} joined chat`);
  });

  // chatMessage: { user, text }
  socket.on("chatMessage", (message) => {
    // message should contain { user, text }
    if (!message || !message.user) return;
    io.emit("chatMessage", message);
  });

  // createPoll (teacher)
  // pollData = { question, options: [{ id?, text, correct }], timer, teacherUsername }
  socket.on("createPoll", async (pollData) => {
    try {
      // Build poll object
      const pollId = uuidv4();
      // Normalize options: ensure id and votes
      const options = (pollData.options || []).map((opt, idx) => ({
        id: opt.id ?? idx + 1,
        text: opt.text ?? "",
        correct: opt.correct ?? null,
        votes: 0,
      }));

      const poll = {
        _id: pollId,
        question: pollData.question,
        options,
        timer: Number(pollData.timer) || 60,
        teacherUsername: pollData.teacherUsername,
        createdAt: new Date().toISOString(),
        closed: false,
      };

      // Save to data.json (append)
      const data = await readData();
      data.polls.push(poll);
      await writeData(data);

      // store active poll state
      activePolls.set(pollId, { poll, timerId: null, closed: false });

      // broadcast pollCreated to clients
      io.emit("pollCreated", poll);

      // Start server-side timer to auto-close poll and emit final pollResults
      const timerSeconds = poll.timer;
      if (timerSeconds > 0) {
        const tId = setTimeout(async () => {
          // mark closed
          const state = activePolls.get(pollId);
          if (!state) return;
          state.closed = true;
          // Load fresh data (in case votes updated)
          const store = await readData();
          // Find poll in stored polls and replace votes from state.poll (we'll aggregate from active votes)
          // Votes are stored in poll.options[].votes inside the file already because we update file on each vote below.
          const stored = store.polls.find((p) => p._id === pollId);
          const finalVotes = stored ? stored.options.map((o) => o.votes) : poll.options.map((o) => o.votes);

          // Build vote map { optionText: votes }
          const voteMap = {};
          (stored ? stored.options : poll.options).forEach((opt) => {
            voteMap[opt.text] = opt.votes || 0;
          });

          // Emit final results
          io.emit("pollResults", voteMap);

          // mark poll closed in persisted file
          if (stored) stored.closed = true;
          await writeData(store);
          activePolls.delete(pollId);
        }, timerSeconds * 1000);
        // save timer id
        activePolls.set(pollId, { poll, timerId: tId, closed: false });
      }
    } catch (err) {
      console.error("createPoll error", err);
    }
  });

  // submitAnswer: { username, option, pollId }
  socket.on("submitAnswer", async (payload) => {
    try {
      const { username, option, pollId } = payload || {};
      if (!username || !option || !pollId) return;

      // Load data, find poll, increment votes
      const data = await readData();
      const poll = data.polls.find((p) => p._id === pollId);
      if (!poll) {
        console.warn("submitAnswer: poll not found", pollId);
        return;
      }
      if (poll.closed) {
        // poll closed, ignore submissions
        return;
      }

      // find option by text
      const opt = poll.options.find((o) => o.text === option);
      if (!opt) {
        console.warn("submitAnswer: option not found for text", option);
        return;
      }
      opt.votes = (opt.votes || 0) + 1;

      // persist
      await writeData(data);

      // Build vote map: { optionText: votes }
      const voteMap = {};
      poll.options.forEach((o) => (voteMap[o.text] = o.votes || 0));

      // Broadcast pollResults to all clients
      io.emit("pollResults", voteMap);
    } catch (err) {
      console.error("submitAnswer error", err);
    }
  });

  // Kick out a username (teacher action). Payload is the username string to kick.
  socket.on("kickOut", (usernameToKick) => {
    try {
      const sid = usernameToSocketId.get(usernameToKick);
      if (sid) {
        // send kickedOut to that socket and disconnect
        io.to(sid).emit("kickedOut");
        io.sockets.sockets.get(sid)?.disconnect(true);
      }
      // remove from participants and maps
      participants.delete(usernameToKick);
      usernameToSocketId.delete(usernameToKick);
      // update participants to everyone
      io.emit("participantsUpdate", Array.from(participants));
    } catch (err) {
      console.error("kickOut error", err);
    }
  });

  // handle disconnect
  socket.on("disconnect", (reason) => {
    const username = socketToUsername.get(socket.id);
    if (username) {
      participants.delete(username);
      usernameToSocketId.delete(username);
      socketToUsername.delete(socket.id);
      io.emit("participantsUpdate", Array.from(participants));
    }
    console.log("Socket disconnected", socket.id, reason);
  });
});


// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
