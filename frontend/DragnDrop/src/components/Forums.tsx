import { Button, Card, Classes, FormGroup, H4, Icon, InputGroup, MenuItem, Overlay2, OverlaysProvider, Popover, Tag, TextArea } from "@blueprintjs/core";
import {Select, ItemRenderer} from "@blueprintjs/select"
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { forumPageDTO, forumPagePostDTO, forumsDTO } from "../dtos/types";
import { forumAPI } from "../utils/forumAPI";
import { userAPI } from "../utils/userAPI";

const Forums = () => {

const navigate = useNavigate();
const handleClose = () => setIsOpen(false);

const TAGS = ["convo", "collab", "Help"];

const [forums, setForums] = useState<forumsDTO[]>([]);
const [isOpen, setIsOpen] = useState(false);
const [title, setTitle] = useState("");
const [content, setContent] = useState("");
const [tag, setTag] = useState(TAGS[0])
const [formError, setFormError] = useState("")

  const toggleOverlay = () => setIsOpen(!isOpen);

  const handleSubmit = async () => {
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
    setIsOpen(false);
  };

const handlePostClick = (id?: number) => {
    navigate(`/forums/${id}`);
  };

useEffect(() => {
  if(userAPI.currentUser == null){
    navigate("/login")
  }
  const loadData = async () => {
    try {
      const data = await forumAPI.getAllForums();
      setForums(data);
    } catch (error) {
      console.error("Failed to fetch forums:", error);
    }
  };
  loadData();
}, []);



return (
<div className="!flex !flex-col !bg-zinc-950 !min-h-screen !p-8 !space-y-8">
  
  {/* SECTION 1: Welcome / Hero */}
  <header className="!flex !items-center !justify-between !bg-zinc-900 !border !border-zinc-800 !p-8 !rounded-3xl">
    <div className="!flex !items-center !gap-6">
      <div className="!w-16 !h-16 !bg-amber-500 !rounded-2xl !flex !items-center !justify-center !shadow-[0_0_20px_rgba(245,158,11,0.3)]">
        <Icon icon="chat" size={30} className="!text-zinc-950" />
      </div>
      <div>
        <h1 className="!text-3xl !font-black !text-white">DAWker Community</h1>
        <p className="!text-zinc-500">Discuss routing, NAM models, and production tips.</p>
      </div>
    </div>
    
      <Button 
        large 
        intent="primary" 
        icon="plus" 
        className="!rounded-xl !bg-white/5" 
        onClick={toggleOverlay}
      >
        Start Discussion
      </Button>

      <Overlay2 
        className={Classes.OVERLAY_SCROLL_CONTAINER}
        isOpen={isOpen} 
        onClose={handleClose} 
        hasBackdrop={true}
        backdropProps={{ className: "!bg-black/60 !backdrop-blur-sm" }}
        canOutsideClickClose={true}
      >
        <div className="!fixed !inset-0 !flex !items-center !justify-center !p-4">
          <div className="!bg-zinc-900 !border !border-zinc-800 !w-full !max-w-lg !p-8 !rounded-3xl !shadow-2xl !animate-in !fade-in !zoom-in !duration-200">
            <div className="!flex !justify-between !items-center !mb-6">
              <h2 className="!text-2xl !font-bold !text-white">New Discussion</h2>
              <Button icon="cross" minimal onClick={toggleOverlay} className="!text-zinc-500" />
            </div>

            <FormGroup 
              label="Discussion Title" 
              labelInfo="(required)" 
              className="!text-zinc-400"
            >
              <input
                  id="Title"
                  type="text"
                  placeholder="e.g., How to route sidechain in DAWker"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="!w-full !bg-zinc-800 !border !border-zinc-700 !text-white !rounded-md !px-4 !py-2 !mb-5 !placeholder:text-zinc-500 !outline-none focus:ring-1 focus:ring-amber-500"
                />
            </FormGroup>

            <FormGroup label="Category" className="!text-zinc-400">
              <select 
                name="Type" 
                id="type"
                className="!bg-zinc-800 !border-zinc-700 !text-white !w-full !p-2 !rounded-md !mb-5 !outline-none focus:ring-1 focus:ring-amber-500"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              >
                {TAGS.map((tag: string) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </FormGroup>

            <FormGroup label="Description" className="!text-zinc-400 focus:ring-1 focus:ring-amber-500">
              <TextArea 
                fill 
                placeholder="Describe your issue or tip..." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ minHeight: '150px' }}
                className="!w-full !bg-zinc-800 !border !border-zinc-700 !text-white !rounded-md !px-4 !py-2 !mb-5 placeholder:text-zinc-500 !outline-none focus:!ring-1 focus:!ring-amber-500 focus:!border-amber-500"
              />
            </FormGroup>

            <div className="!flex !gap-4 !mt-4">
              <Button 
                  large 
                  fill 
                  onClick={handleSubmit}
                  className="!bg-amber-500 !text-zinc-950 !font-black !uppercase !tracking-[0.2em] !rounded-xl hover:!bg-amber-400 hover:!scale-[1.02] !transition-all !border-none"
                >
                  Post_Discussion
                </Button>
            </div>
          </div>
        </div>
      </Overlay2>
  </header>

  {/* SECTION 2: Recent Activity */}
  <section>
    <h2 className="!text-zinc-500 !text-xs !font-bold !uppercase !tracking-[0.2em] !mb-4 !ml-2">Recent Activity</h2>
    <div className="!grid !grid-cols-1 !md:grid-cols-3 !gap-4">
      {[1,2,3].map((i) => (
        <Card key={i} interactive elevation={2} className="!bg-zinc-900 !border-zinc-800 !p-6 !rounded-2xl hover:border-amber-500/50 !transition-all">
          <Tag minimal intent="warning" className="!mb-3">New Activity</Tag>
          <H4 className="!text-white !mb-2">How to optimize WASM latency?</H4>
          <div className="!text-zinc-500 !text-xs !flex !justify-between">
            <span>By @SynthUser</span>
            <span>4m ago</span>
          </div>
        </Card>
      ))}
    </div>
  </section>

  {/* SECTION 3: All Discussions */}
  <section className="!bg-zinc-900 !border !border-zinc-800 !rounded-3xl !overflow-hidden">
    <div className="!p-6 !border-b !border-zinc-800 !flex !justify-between !items-center">
      <h2 className="!text-xl !font-bold !text-white">All Discussions</h2>
      <div className="!flex !gap-2">
         <InputGroup placeholder="Search topics..." leftIcon="search" className="!bg-zinc-950" />
      </div>
    </div>
    
    <div className="!divide-y !divide-zinc-800">
      {forums.map((forum, i) => (
        <div key={i} 
        onClick={() => handlePostClick(forum.id)}
        className="!p-6 !flex !items-center !justify-between hover:bg-white/5 !transition-colors !cursor-pointer !group">
          <div className="!flex !items-center !gap-4">
            <Icon icon="chat" className="!text-zinc-600 group-hover:text-amber-500" />
            <div>
              <h3 className="!text-zinc-200 !font-medium group-hover:text-white">{forum.title}</h3>
              <p className="!text-zinc-500 !text-sm">Started by @{forum.userId} • 142 replies</p>
            </div>
          </div>
          <Icon icon="chevron-right" className="!text-zinc-700" />
        </div>
      ))}
    </div>
  </section>
</div>
);
};

export default Forums;