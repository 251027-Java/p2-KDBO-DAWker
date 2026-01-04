import { Button, Card, Classes, FormGroup, H4, Icon, InputGroup, MenuItem, Overlay2, OverlaysProvider, Popover, Tag, TextArea } from "@blueprintjs/core";
import {Select, ItemRenderer} from "@blueprintjs/select"
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { forumPageDTO, forumPagePostDTO, forumsDTO } from "../dtos/types";
import { forumAPI } from "../utils/forumAPI";
import { userAPI } from "../utils/userAPI";

const Forums = () => {


  // What should forums show.....
  // Recent forums
  // Popular forums

const navigate = useNavigate();
const handleClose = () => setIsOpen(false);

const TAGS = ["convo", "collab", "Help"];

// 1. Initialize state with a clean value, not a function call
const [forums, setForums] = useState<forumsDTO[]>([]);

const [isOpen, setIsOpen] = useState(false);
const [title, setTitle] = useState("");
const [content, setContent] = useState("");
const [tag, setTag] = useState(TAGS[0])
const [formError, setFormError] = useState("")

  const toggleOverlay = () => setIsOpen(!isOpen);

  const handleSubmit = async () => {
    // Logic to send to Spring Boot backend
    const currentUser = userAPI.currentUser;
    
    if (!currentUser || !currentUser.id) {
      setFormError("User not logged in");
      return;
    }

    const forumPost: forumPagePostDTO = {
      createdAt: new Date(),
      postType: tag,
      userId: currentUser.id,
      title,
      description: content,
      comments: null
    };

    forumAPI.saveForumPost(forumPost);

    console.log("Posting:", { title, tag, content });
    setIsOpen(false); // Close after success
  };

const handlePostClick = (id?: number) => {
    // This matches the route: /forum/:postId
    navigate(`/forums/${id}`);
  };

useEffect(() => {
  const loadData = async () => {
    try {
      const data = await forumAPI.getAllForums();
      console.log("Fetched Forums:", data);
      setForums(data);
    } catch (error) {
      console.error("Failed to fetch forums:", error);
    }
  };

  loadData();
  
  // 2. The empty array [] tells React to run this ONLY ONCE on mount
}, []);



return (


<div className="flex flex-col bg-zinc-950 min-h-screen p-8 space-y-8">
  
  {/* SECTION 1: Welcome / Hero (The Logo Area) */}
  <header className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
    <div className="flex items-center gap-6">
      {/* Your Logo placeholder */}
      <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
        <Icon icon="chat" size={30} className="text-zinc-950" />
      </div>
      <div>
        <h1 className="text-3xl font-black text-white">DAWker Community</h1>
        <p className="text-zinc-500">Discuss routing, NAM models, and production tips.</p>
      </div>
    </div>
    
  {/* The Trigger Button */}
      <Button 
        large 
        intent="primary" 
        icon="plus" 
        className="rounded-xl" 
        onClick={toggleOverlay}
      >
        Start Discussion
      </Button>

      {/* The Overlay */}
      <Overlay2 

        className={Classes.OVERLAY_SCROLL_CONTAINER}
        isOpen={isOpen} 
        onClose={handleClose} 
        // Overlay2 handles the Backdrop and Transitions more reliably
        hasBackdrop={true}
        backdropProps={{ className: "!bg-black/60 !backdrop-blur-sm" }} // Optional: blur background
        canOutsideClickClose={true}
      >
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* Your Custom Form Container */}
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200 w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">New Discussion</h2>
              <Button icon="cross" minimal onClick={toggleOverlay} className="text-zinc-500" />
            </div>

            {/* 1. Title Section */}
            <FormGroup 
              label="Discussion Title" 
              labelInfo="(required)" 
              className="text-zinc-400"
            >
              <input
                  id="Title"
                  type="text"
                  placeholder="e.g., How to route sidechain in DAWker"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  /* w-full: Fills the container
                    bg-zinc-800: Matches your theme
                    px-4 py-2: Standard padding for a good feel
                    outline-none focus:ring-1: Clean focus state 
                  */
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-4 py-2 mb-5 placeholder:text-zinc-500 outline-none focus:ring-1 focus:ring-amber-500"
                />
            </FormGroup>

            {/* 2. Tag Section - Separate Group for better spacing */}
            <FormGroup label="Category" className="text-zinc-400">
              <select 
                name="Type" 
                id="type"
                className="bg-zinc-800 border-zinc-700 text-white w-full p-2 rounded-md mb-5 outline-none focus:ring-1 focus:ring-amber-500"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              >
                {TAGS.map((tag: string) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </FormGroup>

            {/* 3. Content Section */}
            <FormGroup label="Description" className="text-zinc-400">
              <TextArea 
                fill 
                placeholder="Describe your issue or tip..." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ minHeight: '150px' }}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-4 py-2 mb-5 placeholder:text-zinc-500 outline-none focus:ring-1 focus:ring-amber-500"
              />
            </FormGroup>

            <div className="flex gap-4 mt-4">
              <Button large fill intent="primary" onClick={handleSubmit}>
                Post Discussion
              </Button>
            </div>
          </div>
        </div>
      </Overlay2>
    </header>

  {/* SECTION 2: Recent Forums (The "Most Recent 3") */}
  <section>
    <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-2">Recent Activity</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1,2,3].map((i) => (
        <Card key={i} interactive elevation={2} className="bg-zinc-900 border-zinc-800 p-6 rounded-2xl hover:border-amber-500/50 transition-all">
          <Tag minimal intent="warning" className="mb-3">New Activity</Tag>
          <H4 className="text-white mb-2">How to optimize WASM latency?</H4>
          <div className="text-zinc-500 text-xs flex justify-between">
            <span>By @SynthUser</span>
            <span>4m ago</span>
          </div>
        </Card>
      ))}
    </div>
  </section>

  {/* SECTION 3: The Main List (Existing Forums) */}
  <section className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
    <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
      <h2 className="text-xl font-bold text-white">All Discussions</h2>
      <div className="flex gap-2">
         <InputGroup placeholder="Search topics..." leftIcon="search" className="bg-zinc-950" />
      </div>
    </div>
    
    <div className="divide-y divide-zinc-800">
      {/* Forum Row Template */}
      {forums.map((forum, i) => (
        <div key={i} 
        onClick={() => handlePostClick(forum.id)}
        className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="flex items-center gap-4">
            <Icon icon="chat" className="text-zinc-600 group-hover:text-amber-500" />
            <div>
              <h3 className="text-zinc-200 font-medium group-hover:text-white">{forum.title}</h3>
              <p className="text-zinc-500 text-sm">Started by @{forum.userId} • 142 replies</p>
            </div>
          </div>
          <Icon icon="chevron-right" className="text-zinc-700" />
        </div>
      ))}
    </div>
  </section>
</div>
);
};

export default Forums;