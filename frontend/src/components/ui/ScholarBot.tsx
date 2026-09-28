"use client";

import { useState } from "react";
import { MessageSquare, X, Bot } from "lucide-react";
import { usePathname } from "next/navigation";

export function ScholarBot() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Don't show on login/register pages
  if (pathname === "/login" || pathname === "/register" || pathname === "/admin/login" || pathname === "/officer/login") {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center space-x-2 bg-navy hover:bg-navy-light text-white px-5 py-3 rounded-full shadow-lg transition-transform hover:scale-105 border-2 border-gold ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
        style={{ transitionDuration: '300ms' }}
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-gold" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-navy animate-pulse"></span>
        </div>
        <span className="font-semibold text-sm">Ask AI Scholar Bot</span>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 transform ${
          isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95 pointer-events-none"
        }`}
        style={{ height: "500px", maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="bg-navy p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center relative">
              <Bot className="w-5 h-5 text-gold" />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-navy"></span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AI Scholar Bot</h3>
              <p className="text-xs text-slate-300">Online &bull; Powered by NIRIKSHAK</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-300 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 rounded-full bg-teal-primary/10 flex flex-shrink-0 items-center justify-center">
              <Bot className="w-4 h-4 text-teal-primary" />
            </div>
            <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] text-sm text-navy">
              Hello! I'm the NIRIKSHAK AI Assistant. How can I help you today? You can ask me about schemes, eligibility, or how to apply!
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            <button className="text-xs bg-white border border-teal-primary text-teal-primary px-3 py-1.5 rounded-full hover:bg-teal-50 transition-colors">
              Am I eligible for PMS-ST?
            </button>
            <button className="text-xs bg-white border border-teal-primary text-teal-primary px-3 py-1.5 rounded-full hover:bg-teal-50 transition-colors">
              Track my application
            </button>
            <button className="text-xs bg-white border border-teal-primary text-teal-primary px-3 py-1.5 rounded-full hover:bg-teal-50 transition-colors">
              What documents do I need?
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Type your question here..."
              className="w-full bg-slate-100 text-sm text-navy rounded-full pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-teal-primary/50 transition-all"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-teal-primary text-white rounded-full flex items-center justify-center hover:bg-teal-dark transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <div className="text-center mt-2">
             <span className="text-[10px] text-slate-400">AI can make mistakes. Please verify important info.</span>
          </div>
        </div>
      </div>
    </>
  );
}
