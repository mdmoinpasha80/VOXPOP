import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface Option {
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: Option[];
  createdAt: number;
}

const db: { polls: Poll[] } = {
  polls: [
    {
      id: "demo-poll-1",
      question: "What is your favorite programming language?",
      options: [
        { text: "TypeScript", votes: 12 },
        { text: "Python", votes: 8 },
        { text: "Rust", votes: 5 },
        { text: "Go", votes: 3 },
      ],
      createdAt: Date.now(),
    },
  ],
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints

  // GET /polls - Get all polls
  app.get("/api/polls", (req, res) => {
    res.json(db.polls);
  });

  // POST /polls - Create a poll
  app.post("/api/polls", (req, res) => {
    const { question, options } = req.body;

    if (!question || !Array.isArray(options) || options.length < 2 || options.length > 4) {
      return res.status(400).json({ error: "Invalid poll data. Provide a question and 2-4 options." });
    }

    const newPoll: Poll = {
      id: uuidv4(),
      question,
      options: options.map((opt: string) => ({ text: opt, votes: 0 })),
      createdAt: Date.now(),
    };

    db.polls.unshift(newPoll);
    res.status(201).json(newPoll);
  });

  // POST /polls/:id/vote - Vote on a poll
  app.post("/api/polls/:id/vote", (req, res) => {
    const { id } = req.params;
    const { optionIndex } = req.body;

    const poll = db.polls.find((p) => p.id === id);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    if (typeof optionIndex !== "number" || optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ error: "Invalid option index" });
    }

    poll.options[optionIndex].votes += 1;
    res.json(poll);
  });

  // DELETE /polls/:id - Delete a poll
  app.delete("/api/polls/:id", (req, res) => {
    const { id } = req.params;
    const initialLength = db.polls.length;
    db.polls = db.polls.filter((p) => p.id !== id);

    if (db.polls.length === initialLength) {
      return res.status(404).json({ error: "Poll not found" });
    }

    res.json({ message: "Poll deleted successfully" });
  });

  // GET /polls/:id/results - Get poll results
  app.get("/api/polls/:id/results", (req, res) => {
    const { id } = req.params;
    const poll = db.polls.find((p) => p.id === id);

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    const results = poll.options.map((opt) => ({
      text: opt.text,
      votes: opt.votes,
      percentage: totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0,
    }));

    res.json({
      question: poll.question,
      results,
      totalVotes,
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
