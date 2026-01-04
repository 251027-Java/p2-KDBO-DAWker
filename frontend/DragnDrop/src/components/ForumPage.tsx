import { Outlet, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Card } from "@blueprintjs/core"
import { Divider } from "@blueprintjs/core";
import {Button} from "@blueprintjs/core"
import { useEffect, useState } from "react";
import {forumAPI} from "../utils/forumAPI"
import { commentsPostDTO, forumPageDTO } from "../dtos/types";
import { userAPI } from "../utils/userAPI";
const ForumPage = () => {

const { postId } = useParams<{ postId: string }>(); // Remove the '?' if this route requires an ID
const [forumPage, setForumPage] = useState<forumPageDTO | null>(null);
const [isReplying, setIsReplying] = useState(false);
const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchForum = async () => {
      // 1. Convert string to number
      const idAsNumber = Number(postId);

      // 2. Safety check: Don't call API if the ID isn't a valid number
      if (isNaN(idAsNumber)) {
        console.error("Invalid Post ID in URL");
        return;
      }

      try {
        const data: forumPageDTO = await forumAPI.getForumById(idAsNumber);
        console.log("Fetched Forum Detail:", data);
        setForumPage(data);
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    if (postId) {
      fetchForum();
    }
  }, [postId]);

  //----------------Handles--------------

  const handleCommentSubmit = async () => {
    const commentDto: commentsPostDTO = {
      createdAt: new Date(),
      userId: userAPI.currentUser?.id || 0,
      parentPostId: forumPage?.id || 0,
      content: newComment
    };

    try {
      const savedComment = await userAPI.saveComment(commentDto);
      // Refresh your data or locally push to the comment list

      setForumPage(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              comments: [...prev.comments, savedComment] // Appends the new comment to the bottom
            };
          });

      setIsReplying(false);
      setNewComment("");
      alert("Comment added!");
    } catch (error) {
      console.error("Failed to post:", error);
    }
  };
  //-------------------------------------

  return (
  <div className="flex flex-col bg-zinc-950 min-h-screen text-zinc-300 p-8 max-w-5xl mx-auto">
    
    {/* TOP SECTION: Header & Meta */}
    <header className="mb-8">
      <h1 className="text-4xl font-black text-white tracking-tight mb-4">
        {forumPage?.title}
      </h1>
      
      <div className="flex items-center gap-4 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500" /> {/* Mini Avatar */}
          <span className="text-zinc-300 font-medium">@{forumPage?.userId}</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-zinc-700" />
        <span>Posted  {" "}
          {forumPage?.createdAt ? new Date(forumPage.createdAt).toLocaleDateString() : "Loading..."}
        </span>
        <div className="w-1 h-1 rounded-full bg-zinc-700" />
        <span className="bg-zinc-800 px-2 py-1 rounded text-[10px] uppercase tracking-widest text-emerald-400">{forumPage?.postType}</span>
      </div>
    </header>

    <div className="h-[1px] w-full bg-white/40 border-b border-white/5 mt-6" />

    {/* ORIGINAL POST: Description */}
    <section className="mt-8 bg-zinc-900/50 rounded-3xl p-8 border border-zinc-800/50">
      <p className="text-lg leading-relaxed text-zinc-300">
        {forumPage?.description}
      </p>
    </section>

{/* COMMENTS SECTION */}
<div className="mt-12 space-y-6">
  <div className="flex justify-between items-center ml-2">
    <h3 className="text-zinc-500 uppercase text-xs font-bold tracking-widest">Responses</h3>
    
    {/* Add Comment Trigger */}
    {!isReplying && (
      <Button 
        minimal 
        icon="plus" 
        text="Add Comment" 
        onClick={() => setIsReplying(true)}
        className="text-emerald-400 hover:bg-emerald-400/10"
      />
    )}
  </div>

  {/* QUICK COMMENT BOX */}
  {isReplying && (
    <div className="bg-zinc-900 border border-emerald-500/30 rounded-3xl p-6 animate-in slide-in-from-top-2 duration-200">
      <textarea
        autoFocus
        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 transition-colors min-h-[100px]"
        placeholder="Write a quick response..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      />
      <div className="flex justify-end gap-3 mt-4">
        <Button 
          minimal 
          text="Cancel" 
          onClick={() => { setIsReplying(false); setNewComment(""); }} 
          className="text-zinc-500" 
        />
        <Button 
          intent="success" 
          text="Post Comment" 
          onClick={handleCommentSubmit} // You'll define this next
          disabled={!newComment.trim()}
          className="rounded-xl px-6"
        />
      </div>
    </div>
  )}
      {/* A Single Comment */}
      {forumPage?.comments.map((comment, i) => (
      <div className="group flex flex-col w-full bg-zinc-900 rounded-3xl p-6 border border-zinc-800 transition-all hover:border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-emerald-400 font-bold text-sm">@{comment.userId}</span>
          <span className="text-zinc-600 text-xs">
            {comment?.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "Loading..."}
          </span>
        </div>
        
        <Card interactive={false} className="bg-zinc-950/50 border-zinc-800 p-6 text-zinc-400 leading-relaxed italic">
          "{comment.content}"
        </Card>
        
        <div className="mt-4 flex gap-4">
          <Button minimal icon="thumbs-up" className="text-zinc-500 hover:text-emerald-400" />
          <Button minimal icon="chat" className="text-zinc-500" />
        </div>
      </div>
    ))}
    </div>
  </div>
  );
};

export default ForumPage;