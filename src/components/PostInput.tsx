import React, { useState } from 'react';
import { User } from '../types';
import { toast } from 'sonner';

interface PostInputProps {
  currentUser: User | null;
  onPostSubmit: (content: string) => void;
}

export default function PostInput({ currentUser, onPostSubmit }: PostInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    onPostSubmit(content);
    setContent('');
    toast.success('Insight shared with the community');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#121212] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center font-bold text-slate-950 uppercase">
          {currentUser?.username?.slice(0, 2) || 'TR'}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your market analysis..."
          className="flex-1 bg-[#1e2026] text-white text-sm border border-slate-800 rounded-xl p-3 h-20 outline-none focus:border-[#f0b90b] resize-none transition-all"
        />
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-slate-900">
        <span className="text-xs text-slate-500 font-mono">Posting as {currentUser?.username || 'Guest'}</span>
        <button
          type="submit"
          disabled={!content.trim()}
          className="bg-[#f0b90b] hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
        >
          Post Insight
        </button>
      </div>
    </form>
  );
}
