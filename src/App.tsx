/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, Trash2, BarChart3, List, CheckCircle2, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

export default function App() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [votedPolls, setVotedPolls] = useState<string[]>([]);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);

  // Create Poll State
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);

  useEffect(() => {
    fetchPolls();
    const storedVotes = localStorage.getItem("votedPolls");
    if (storedVotes) {
      setVotedPolls(JSON.parse(storedVotes));
    }
  }, []);

  const fetchPolls = async () => {
    try {
      const res = await fetch("/api/polls");
      const data = await res.json();
      setPolls(data);
      if (data.length > 0 && !selectedPollId) {
        setSelectedPollId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch polls", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredOptions = newOptions.filter((opt) => opt.trim() !== "");
    if (filteredOptions.length < 2) return;

    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQuestion, options: filteredOptions }),
      });
      if (res.ok) {
        const newPoll = await res.json();
        setPolls([newPoll, ...polls]);
        setSelectedPollId(newPoll.id);
        setIsCreating(false);
        setNewQuestion("");
        setNewOptions(["", ""]);
      }
    } catch (err) {
      console.error("Error creating poll", err);
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (votedPolls.includes(pollId)) return;

    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIndex }),
      });
      if (res.ok) {
        const updatedPoll = await res.json();
        setPolls(polls.map((p) => (p.id === pollId ? updatedPoll : p)));
        const newVoted = [...votedPolls, pollId];
        setVotedPolls(newVoted);
        localStorage.setItem("votedPolls", JSON.stringify(newVoted));
      }
    } catch (err) {
      console.error("Error voting", err);
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    try {
      const res = await fetch(`/api/polls/${pollId}`, { method: "DELETE" });
      if (res.ok) {
        const updatedPolls = polls.filter((p) => p.id !== pollId);
        setPolls(updatedPolls);
        if (selectedPollId === pollId) {
          setSelectedPollId(updatedPolls.length > 0 ? updatedPolls[0].id : null);
        }
      }
    } catch (err) {
      console.error("Error deleting poll", err);
    }
  };

  const selectedPoll = polls.find(p => p.id === selectedPollId);

  return (
    <div className="min-h-screen bg-indigo-50 text-slate-800 font-sans flex flex-col selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-200">
            V
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
            VOX<span className="text-indigo-600">POP</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center transition-all active:scale-95 shadow-md shadow-indigo-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Poll
          </button>
          <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-white overflow-hidden flex items-center justify-center">
            <span className="text-orange-600 font-bold text-xs uppercase">ME</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <List size={14} />
              Active Polls
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="p-4 text-center text-slate-400 text-xs">Loading...</div>
              ) : polls.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs italic">No polls found</div>
              ) : (
                polls.map(poll => (
                  <div
                    key={poll.id}
                    onClick={() => setSelectedPollId(poll.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedPollId === poll.id
                        ? "bg-indigo-50 border-indigo-200"
                        : "bg-white border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <p className={`font-bold text-sm mb-1 line-clamp-2 ${
                      selectedPollId === poll.id ? "text-slate-900" : "text-slate-700"
                    }`}>
                      {poll.question}
                    </p>
                    <p className={`text-xs font-semibold ${
                      selectedPollId === poll.id ? "text-indigo-500" : "text-slate-400"
                    }`}>
                      {poll.options.reduce((s, o) => s + o.votes, 0).toLocaleString()} votes • Active
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Main Section */}
        <section className="flex-1 p-10 bg-slate-50 overflow-y-auto flex flex-col">
          {isCreating ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-10 max-w-2xl mx-auto w-full"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 uppercase">New Poll</h2>
                <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCreatePoll} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Question</label>
                  <input
                    type="text"
                    required
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Options</label>
                  {newOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const u = [...newOptions];
                          u[i] = e.target.value;
                          setNewOptions(u);
                        }}
                        className="flex-1 px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                      />
                      {newOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setNewOptions(newOptions.filter((_, idx) => idx !== i))}
                          className="p-3 text-slate-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  {newOptions.length < 4 && (
                    <button
                      type="button"
                      onClick={() => setNewOptions([...newOptions, ""])}
                      className="text-indigo-600 font-bold text-sm flex items-center gap-1"
                    >
                      <Plus size={16} /> Add Option
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all uppercase tracking-widest"
                >
                  Publish Poll
                </button>
              </form>
            </motion.div>
          ) : selectedPoll ? (
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-10 min-h-full flex flex-col max-w-4xl mx-auto w-full">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center space-x-2 mb-2 text-indigo-600">
                    <span className="text-xs font-bold uppercase tracking-widest">Active Poll</span>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2 tracking-tight">
                    {selectedPoll.question}
                  </h1>
                  <p className="text-slate-500 text-sm">
                    Created <span className="font-semibold text-slate-700"> {new Date(selectedPoll.createdAt).toLocaleDateString()}</span> • Trending Now
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePoll(selectedPoll.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={24} />
                </button>
              </div>

              <div className="flex-1 space-y-6">
                {selectedPoll.options.map((option, idx) => {
                  const totalVotes = selectedPoll.options.reduce((s, o) => s + o.votes, 0);
                  const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                  const hasVoted = votedPolls.includes(selectedPoll.id);
                  const isWinner = option.votes === Math.max(...selectedPoll.options.map(o => o.votes)) && totalVotes > 0;

                  return (
                    <div key={idx} className="relative">
                      {hasVoted ? (
                        <div className="relative">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-800 flex items-center gap-2">
                              {option.text}
                              {isWinner && <CheckCircle2 size={16} className="text-green-500" />}
                            </span>
                            <span className="font-black text-indigo-600 text-xl">{percentage.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-10 rounded-full overflow-hidden relative">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              className={`h-full rounded-full flex items-center px-4 transition-all ${
                                isWinner ? "bg-indigo-600" : "bg-slate-400"
                              }`}
                            >
                              {percentage > 10 && (
                                <span className="text-white font-bold text-[10px] uppercase whitespace-nowrap">
                                  {option.votes.toLocaleString()} Votes
                                </span>
                              )}
                            </motion.div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleVote(selectedPoll.id, idx)}
                          className="w-full group text-left px-6 py-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-between"
                        >
                          <span className="font-bold text-slate-700 group-hover:text-indigo-700">{option.text}</span>
                          <ChevronRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase">
                    Total: {selectedPoll.options.reduce((s, o) => s + o.votes, 0).toLocaleString()} Votes
                  </span>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Live Updates Enabled</span>
                </div>
                {votedPolls.includes(selectedPoll.id) && (
                  <span className="text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={14} /> Thank you for voting!
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-400 space-y-4">
              <BarChart3 size={64} className="opacity-20" />
              <p className="font-bold uppercase tracking-widest text-sm">Select a poll to view results</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
