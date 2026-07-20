import React from 'react';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { Post } from '../types';

interface PostFeedProps {
  posts: Post[];
  onLike: (postId: string, currentLikes: number) => void;
}

export default function PostFeed({ posts, onLike }: PostFeedProps) {
  return (
    <div className="space-y-4">
      {posts.map(post => (
        <div key={post.id} className="bg-[#0b101f] border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs">
              {post.authorName[0]}
            </div>
            <div>
              <p className="text-white text-xs font-bold">{post.authorName}</p>
              <p className="text-slate-500 text-[10px]">@{post.authorUsername}</p>
            </div>
          </div>
          <p className="text-slate-300 text-xs mb-3">{post.content}</p>
          <div className="flex items-center space-x-4">
            <button onClick={() => onLike(post.id, post.likes)} className="flex items-center space-x-1 text-slate-500 text-[10px] hover:text-red-500">
              <ThumbsUp className="w-3 h-3" />
              <span>{post.likes}</span>
            </button>
            <button className="flex items-center space-x-1 text-slate-500 text-[10px]">
              <MessageSquare className="w-3 h-3" />
              <span>Comment</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
