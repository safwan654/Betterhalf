"use client";

import React, { useState } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { 
  LOVE_TESTS, 
  LoveTest, 
  LoveTestQuestion, 
  calculateTestSimilarity, 
  DiscussionMessage 
} from "@/lib/love-tests";
import { 
  Heart, 
  Flame, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  ChevronRight, 
  Share2, 
  Smile, 
  Award,
  Zap,
  HelpCircle
} from "lucide-react";

export default function ViewOfLoveComponent() {
  const { 
    activeUser, 
    husbandName, 
    wifeName, 
    loveTestsData, 
    submitLoveTestAnswer, 
    addTestDiscussionMessage 
  } = useGlobal();

  const [selectedTestId, setSelectedTestId] = useState<string>("view_of_love");
  const [activeTab, setActiveTab] = useState<"RESULT" | "DISCUSSION">("RESULT");
  const [discussionInput, setDiscussionInput] = useState<string>("");
  const [isSpicyDiscussion, setIsSpicyDiscussion] = useState<boolean>(false);
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);

  const isHusband = activeUser === "HUSBAND";
  const myName = isHusband ? husbandName : wifeName;
  const partnerName = isHusband ? wifeName : husbandName;

  const currentTest = LOVE_TESTS.find(t => t.id === selectedTestId) || LOVE_TESTS[0];
  const testState = loveTestsData[currentTest.id] || { testId: currentTest.id, answers: {}, discussions: [] };
  const answers = testState.answers || {};
  const discussions = testState.discussions || [];

  const similarityScore = calculateTestSimilarity(currentTest, answers);

  const handleSendDiscussion = () => {
    if (!discussionInput.trim()) return;
    addTestDiscussionMessage(currentTest.id, discussionInput.trim(), isSpicyDiscussion || currentTest.category === "SPICY");
    setDiscussionInput("");
  };

  const handleQuickDiscussion = (text: string, spicy: boolean = false) => {
    addTestDiscussionMessage(currentTest.id, text, spicy);
  };

  const quickChips = currentTest.category === "SPICY"
    ? [
        { text: "Wait till tonight... 🔥", spicy: true },
        { text: "You drive me crazy! 💋", spicy: true },
        { text: "Can we try this next reunion? 😈", spicy: true },
        { text: "Massage deal is locked in! 💆‍♀️", spicy: false }
      ]
    : [
        { text: "You know me too well! 🥰", spicy: false },
        { text: "I love your answer so much! 💖", spicy: false },
        { text: "We need to talk about this! 😂", spicy: false },
        { text: "Forever grateful for us ✨", spicy: false }
      ];

  const handleWhatsAppShare = () => {
    const text = `Couple Test: ${currentTest.title}\nOur Similarity: ${similarityScore}%\nSafwan & Shahna Love Chemistry! 💕`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* 1. Category / Test Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {LOVE_TESTS.map((test) => {
          const isSelected = test.id === selectedTestId;
          const isSpicy = test.category === "SPICY";
          return (
            <button
              key={test.id}
              onClick={() => setSelectedTestId(test.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-black whitespace-nowrap transition-all active:scale-95 ${
                isSelected
                  ? isSpicy
                    ? "bg-gradient-to-r from-red-500 to-rose-500 text-white border-red-500 shadow-md scale-105"
                    : "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-500 shadow-md scale-105"
                  : "bg-white/90 text-[#44342B] border-[#FFE2D1] hover:border-rose-300 shadow-2xs"
              }`}
            >
              <span>{test.icon}</span>
              <span>{test.title}</span>
              {isSpicy && <span className="text-[10px] animate-pulse">🔥</span>}
            </button>
          );
        })}
      </div>

      {/* 2. Main Card with Segmented Switch (Matching Image 2) */}
      <div className="rounded-[32px] border-2 border-[#FFE2D1] bg-white/95 p-5 shadow-sm flex flex-col gap-4">
        
        {/* Test Subtitle Header */}
        <div className="flex items-center justify-between border-b border-[#FFE2D1] pb-3">
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-[#44342B] flex items-center gap-1.5">
              <span>{currentTest.icon}</span>
              <span>{currentTest.title}</span>
            </h3>
            <p className="text-[10px] font-semibold text-[#826F66]">{currentTest.subtitle}</p>
          </div>

          <button
            onClick={handleWhatsAppShare}
            className="p-2 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors shadow-2xs"
            title="Share with partner"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Segmented Switch: Result vs Discussion (Matching Image 2) */}
        <div className="flex rounded-2xl bg-[#FFF8F3] p-1 border border-[#FFE2D1]">
          <button
            onClick={() => setActiveTab("RESULT")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "RESULT"
                ? "bg-white text-rose-600 shadow-sm border border-[#FFE2D1]"
                : "text-[#826F66] hover:text-[#44342B]"
            }`}
          >
            <span>📋</span>
            <span>Result</span>
          </button>
          
          <button
            onClick={() => setActiveTab("DISCUSSION")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "DISCUSSION"
                ? "bg-white text-rose-600 shadow-sm border border-[#FFE2D1]"
                : "text-[#826F66] hover:text-[#44342B]"
            }`}
          >
            <span>💬</span>
            <span>Discussion</span>
            {discussions.length > 0 && (
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                {discussions.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: RESULT TAB */}
        {activeTab === "RESULT" ? (
          <div className="flex flex-col gap-4 animate-in fade-in">
            
            {/* Speedometer Similarity Gauge (Matching Image 2) */}
            <div className="relative flex flex-col items-center justify-center pt-2 pb-1">
              <div className="relative w-48 h-28 flex items-end justify-center">
                {/* SVG Semi-Circle Arc */}
                <svg className="w-48 h-28" viewBox="0 0 200 110">
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF8FAB" />
                      <stop offset="50%" stopColor="#FF5C8A" />
                      <stop offset="100%" stopColor="#FFB703" />
                    </linearGradient>
                  </defs>
                  {/* Background Arc */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#FFE2D1"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  {/* Progress Arc */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="16"
                    strokeDasharray="251.2"
                    strokeDashoffset={`${251.2 * (1 - similarityScore / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-rose-50 border border-rose-200 mb-0.5">
                    <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                  </div>
                  <span className="text-2xl font-black text-rose-500 tracking-tight leading-none">
                    {similarityScore}%
                  </span>
                  <span className="text-[10px] font-bold text-[#826F66]">
                    {currentTest.category === "SPICY" ? "Spicy Chemistry" : "Similarity"}
                  </span>
                </div>
              </div>
            </div>

            {/* Questions & Side-by-Side Answers (Matching Image 2) */}
            <div className="flex flex-col gap-3.5">
              {currentTest.questions.map((q, idx) => {
                const qEntry = answers[q.id];
                const wifeAns = qEntry?.wifeAnswer || q.wifeDefaultAnswer;
                const husbandAns = qEntry?.husbandAnswer || q.husbandDefaultAnswer;
                
                const hasMyAnswer = isHusband ? !!qEntry?.husbandAnswer : !!qEntry?.wifeAnswer;
                const isAnswering = answeringQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    className="rounded-[26px] border border-[#FFE2D1] bg-[#FFF9F4] p-4 flex flex-col gap-3 shadow-2xs transition-all hover:border-rose-300"
                  >
                    {/* Question Title Header */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-[#44342B] flex items-center gap-1.5">
                        <span className="text-rose-500">{idx + 1}.</span>
                        <span>{q.question}</span>
                      </h4>

                      <button
                        onClick={() => {
                          setActiveTab("DISCUSSION");
                          handleQuickDiscussion(`Let's discuss Question ${idx + 1}: "${q.question}" 💬`);
                        }}
                        className="text-[10px] font-extrabold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-rose-200 shadow-2xs"
                      >
                        <MessageCircle className="h-3 w-3" />
                        Discuss
                      </button>
                    </div>

                    {/* Side-by-Side Conversation Bubbles (Image 2 style) */}
                    <div className="flex flex-col gap-2.5">
                      
                      {/* Her Answer Bubble (Left) */}
                      <div className="flex items-start gap-2.5">
                        <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-rose-100 border border-rose-200 text-sm shadow-2xs">
                          👧
                        </div>
                        <div className="flex-1 rounded-2xl rounded-tl-sm bg-white p-3 border border-rose-100 shadow-2xs relative">
                          <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider block mb-0.5">
                            {wifeName}
                          </span>
                          <p className="text-xs font-semibold text-[#44342B] leading-relaxed">
                            {wifeAns || "Thinking of her answer... 💭"}
                          </p>
                          <div className="absolute -bottom-1 -right-1">
                            <span className="text-xs">💬</span>
                          </div>
                        </div>
                      </div>

                      {/* His Answer Bubble (Right) */}
                      <div className="flex items-start gap-2.5 flex-row-reverse">
                        <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 border border-amber-200 text-sm shadow-2xs">
                          👦
                        </div>
                        <div className="flex-1 rounded-2xl rounded-tr-sm bg-white p-3 border border-amber-100 shadow-2xs relative text-left">
                          <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider block mb-0.5">
                            {husbandName}
                          </span>
                          <p className="text-xs font-semibold text-[#44342B] leading-relaxed">
                            {husbandAns || "Thinking of his answer... 💭"}
                          </p>
                          <div className="absolute -bottom-1 -left-1">
                            <span className="text-xs">💬</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Option Selector to Change / Submit My Answer */}
                    {!isAnswering ? (
                      <button
                        onClick={() => setAnsweringQuestionId(q.id)}
                        className="self-end text-[10px] font-bold text-[#826F66] hover:text-rose-600 underline transition-colors"
                      >
                        Change my answer ✍️
                      </button>
                    ) : (
                      <div className="flex flex-col gap-1.5 border-t border-[#FFE2D1] pt-2 animate-in fade-in">
                        <span className="text-[10px] font-black text-[#826F66]">Choose your answer:</span>
                        {q.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              submitLoveTestAnswer(currentTest.id, q.id, opt);
                              setAnsweringQuestionId(null);
                            }}
                            className="p-2 rounded-xl text-left text-xs font-bold bg-white hover:bg-rose-50 border border-[#FFE2D1] hover:border-rose-300 text-[#44342B] transition-all shadow-2xs active:scale-98"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          /* Tab 2: DISCUSSION TAB */
          <div className="flex flex-col gap-3 animate-in fade-in">
            
            {/* Quick Reply Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickDiscussion(chip.text, chip.spicy)}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full border whitespace-nowrap transition-all active:scale-95 ${
                    chip.spicy
                      ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                      : "bg-white text-[#826F66] border-[#FFE2D1] hover:border-rose-300"
                  }`}
                >
                  {chip.text}
                </button>
              ))}
            </div>

            {/* Discussion Chat Stream */}
            <div className="min-h-[220px] max-h-[360px] overflow-y-auto no-scrollbar rounded-2xl border border-[#FFE2D1] bg-[#FFFBF8] p-3 flex flex-col gap-2.5">
              {discussions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-[#826F66] gap-2">
                  <span className="text-2xl">💬</span>
                  <p className="text-xs font-bold">No comments yet for this test.</p>
                  <p className="text-[10px]">Send a sweet or spicy thought to start chatting!</p>
                </div>
              ) : (
                discussions.map((msg) => {
                  const isMine = (isHusband && msg.sender === "HUSBAND") || (!isHusband && msg.sender === "WIFE");
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] gap-0.5 ${isMine ? "self-end items-end" : "self-start items-start"}`}
                    >
                      <span className="text-[9px] font-black text-[#826F66]">
                        {msg.senderName}
                      </span>
                      <div className={`p-3 rounded-2xl text-xs font-semibold shadow-2xs ${
                        isMine
                          ? msg.isSpicy
                            ? "bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-tr-xs"
                            : "bg-rose-500 text-white rounded-tr-xs"
                          : msg.isSpicy
                            ? "bg-red-50 text-red-800 border border-red-200 rounded-tl-xs"
                            : "bg-white text-[#44342B] border border-[#FFE2D1] rounded-tl-xs"
                      }`}>
                        {msg.text}
                        {msg.reaction && <span className="ml-1.5">{msg.reaction}</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input Bar */}
            <div className="flex items-center gap-2 border-t border-[#FFE2D1] pt-3">
              <button
                type="button"
                onClick={() => setIsSpicyDiscussion(!isSpicyDiscussion)}
                className={`p-2.5 rounded-2xl border transition-all ${
                  isSpicyDiscussion
                    ? "bg-red-500 text-white border-red-500 shadow-sm animate-pulse"
                    : "bg-white text-[#826F66] border-[#FFE2D1] hover:border-red-300"
                }`}
                title="Toggle Spicy Mood"
              >
                <Flame className="h-4 w-4" />
              </button>

              <input
                type="text"
                value={discussionInput}
                onChange={(e) => setDiscussionInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendDiscussion()}
                placeholder={isSpicyDiscussion ? "Type a spicy comment... 🔥" : "Type a sweet note to discuss... 💬"}
                className="flex-1 rounded-2xl border border-[#FFE2D1] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#44342B] placeholder:text-[#826F66]/60 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 shadow-2xs"
              />

              <button
                type="button"
                onClick={handleSendDiscussion}
                disabled={!discussionInput.trim()}
                className="p-2.5 rounded-2xl bg-rose-500 text-white hover:bg-rose-600 active:scale-95 transition-all shadow-sm disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
