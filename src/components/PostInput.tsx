import React from 'react';
import { Send } from 'lucide-react';

interface PostInputProps {
  content: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function PostInput({ content, onChange, onSubmit }: PostInputProps) {
  return (
    <div className="bg-[#0b101f] border border-slate-800 p-4 rounded-2xl mb-6">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Share your market analysis..."
        className="w-full bg-[#0d1222] border border-slate-800 text-white p-3 rounded-lg text-xs outline-none focus:border-red-500 mb-2"
        rows={3}
      />
      <button
        onClick={onSubmit}
        className="flex items-center space-x-2 bg-red-500 hover:bg-red-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
      >
        <Send className="w-4 h-4" />
        <span>Post Analysis</span>
      </button>
    </div>
  );
}
