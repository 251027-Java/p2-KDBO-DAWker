import { 
  Button, H1, H4, Icon, Card, Tag, Divider, ProgressBar, H2, 
  Dialog, Classes, TextArea, InputGroup, FormGroup 
} from "@blueprintjs/core";
import { forumsDTO, recievedSessionNoteDTO, userDTO } from "../dtos/types";
import { useEffect, useState } from "react";
import { userAPI } from "../utils/userAPI";
import { useNavigate } from "react-router-dom";
import { notesApi } from "../utils/notesApi";
import { forumAPI } from "../utils/forumAPI";

function UserPage() {

  const navigate = useNavigate();
  const [userObject, setUserObject] = useState<userDTO | null>(null);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<recievedSessionNoteDTO>({ userId: userAPI.currentUser?.id,title: "", content: "" });
  const [isNewNote, setIsNewNote] = useState(false);
  const [listOfNotes, setListOfNotes] = useState<recievedSessionNoteDTO[] | null>(null)
  const [listOfForums, setListOfForums] = useState<forumsDTO[] | null>([]);
  
  const DAW_COLORS = [
    "from-emerald-900/40",
    "from-blue-900/40",
    "from-purple-900/40",
    "from-amber-900/40",
    "from-rose-900/40",
    "from-cyan-900/40",
  ];


  const handleOpenNote = async (noteId: number | null = null, userId: number | null = null, title = "", content = "", isNew = false) => {
      
    
    let note: recievedSessionNoteDTO = { id: noteId || undefined, userId: userId || undefined, title, content };
    
    if(noteId != null){
      note = await notesApi.getNoteById(noteId)
    }
    
      setCurrentNote(note);
      setIsNewNote(isNew);
      setIsNoteOpen(true);
  };

  const handleUpdateNoteButton = async () => {

    if(userAPI.currentUser != null){
      currentNote.userId = userAPI.currentUser.id;
    }

    console.log("Got the current note")
    console.log(currentNote)

    if(currentNote != null){
      let note: recievedSessionNoteDTO = await notesApi.saveNote(currentNote);
      console.log("note save: ");
      console.log(note);
      setListOfNotes(prevNotes => [...(prevNotes || []), note]);

      setIsNoteOpen(false);
    }
  }

  const handlePostClick = (id?: number) => {
    navigate(`/forums/${id}`);
  };

  const handleInitalizeDaw = (id?: string) => {

    navigate(`/native-amp/${id}`);
  }

  useEffect(() => {
    if(userAPI.currentUser == null){
      navigate("/login")
    }
    const fetchUser = async () => {
      if(userAPI.currentUser?.id != null){
        const userDTO: userDTO = await userAPI.getUserById(userAPI.currentUser?.id);
        userAPI.currentUser = userDTO;
        setUserObject(userDTO);
      }
    };

    const fetchNotes = async () => {
      
      let userId = userAPI.currentUser?.id
      
      if(userAPI.currentUser?.id != null){
        const notes: recievedSessionNoteDTO[] = await notesApi.getNotesByUserId(userAPI.currentUser.id);
        setListOfNotes(notes);
        console.log(notes);
      }
    };

    const fetchForums = async () => {
      
      let userId = userAPI.currentUser?.id
      
      if(userAPI.currentUser?.id != null){
        const forums: forumsDTO[] = await forumAPI.getAllForumsByUserId(userAPI.currentUser.id);
        setListOfForums(forums);
        console.log(forums);
      }
    };

    fetchUser();
    fetchNotes();
    fetchForums();
  }, [])

  return (
    <div className="!min-h-screen !bg-[#09090b] !text-zinc-400 !p-4 !lg:p-10 !font-sans !tracking-tight">
      
      {/* 1. TOP UTILITY RAIL */}
      <div className="!flex !items-center !justify-between !mb-12 !border-b !border-white/5 !pb-6">
        <div className="!flex !items-center !gap-4 !group !cursor-crosshair">
          <div className="!h-3 !w-3 !rounded-full !bg-emerald-500 !animate-pulse group-hover:!shadow-[0_0_12px_#10b981]" />
          <span className="!text-xs !font-mono !tracking-[0.3em] !text-zinc-500 !uppercase group-hover:!text-emerald-400 !transition-colors">
            System_Active // Session_01
          </span>
        </div>

        <div className="!flex !gap-8 !items-center">
          {/* Swapped Total_Renders for User_Identity */}
          <div className="!text-right !transition-opacity hover:!opacity-70 !cursor-default">
            <p className="!text-[10px] !uppercase !tracking-widest !text-zinc-600">User_Identity</p>
            <p className="!text-xl !font-mono !text-white !uppercase">
              {userObject?.username || "GUEST_USER"}
            </p>
          </div>
          
          <Button 
            icon="user" 
            minimal 
            large 
            className="!bg-white/5 !rounded-full hover:!bg-white/10 hover:!scale-110 !transition-all" 
          />
        </div>
      </div>

      {/* 2. THE HERO RACK */}
      <section className="!mb-10 !space-y-4">
        <div className="!flex !items-center !justify-between !px-2">
          <h3 className="!text-[10px] !font-black !text-zinc-600 !uppercase !tracking-[0.4em]">Active_Project_Rack</h3>
          <div className="!flex !gap-2">
            <div className="!h-1 !w-8 !bg-amber-500 !rounded-full !animate-pulse" />
            <div className="!h-1 !w-2 !bg-zinc-800 !rounded-full" />
            <div className="!h-1 !w-2 !bg-zinc-800 !rounded-full" />
          </div>
        </div>

        <div className="!flex !flex-row !gap-6 !overflow-x-auto !pb-6 !snap-x !snap-mandatory !scrollbar-hide">
          {userObject?.daws && userObject.daws.length > 0 ? (
            userObject.daws.map((daw, i) => {
              const colorClass = DAW_COLORS[i % DAW_COLORS.length];

              return (
                <div
                  key={i}
                  className={`!snap-center !shrink-0 !w-[85%] !md:w-[600px] !relative !overflow-hidden !bg-zinc-900 !bg-gradient-to-br !border !border-white/10 !rounded-2xl !p-8 !group !transition-all hover:!border-amber-500/40 hover:!shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:!translate-y-1 !cursor-pointer`}
                >
                  {/* ... Your existing DAW Card Content ... */}
                  <div className={`!absolute !inset-0 !bg-gradient-to-r ${colorClass} !to-transparent !opacity-30 group-hover:!opacity-50 !transition-opacity !pointer-events-none`} />
                  <div className="!relative !z-10 !flex !flex-col !h-full !justify-between">
                    <div>
                      <div className="!flex !justify-between !items-start !mb-4">
                        <Tag minimal intent="warning" className="!text-[9px] !uppercase !font-bold !tracking-tighter group-hover:!invert !transition-all">PROJECT_00{i + 1}</Tag>
                        <span className="!text-[10px] !font-mono !text-zinc-500">REV_0.4.2</span>
                      </div>
                      <H2 className="!text-4xl !font-black !text-white !italic !tracking-tighter !mb-2 group-hover:!text-amber-400 !transition-colors">
                        {daw.name}
                      </H2>
                      <div className="!flex !items-center !gap-3 !text-[10px] !font-mono !text-zinc-500">
                        <span>EST. 2025</span>
                        <div className="!w-1 !h-1 !rounded-full !bg-zinc-700" />
                        <span className="group-hover:!text-zinc-300">AUTO_SAVE_ENABLED</span>
                      </div>
                    </div>
                    <div className="!mt-12 !flex !items-center !justify-between">
                      <div className="!flex !gap-1 !h-6 !items-end">
                        {[20, 50, 80, 40, 90, 30].map((h, j) => (
                          <div key={j} className="!w-1 !bg-white/20 !rounded-full !transition-all group-hover:!bg-amber-400 group-hover:!animate-bounce" style={{ height: `${h}%`, animationDelay: `${j * 0.1}s` }} />
                        ))}
                      </div>
                      <Button rightIcon="arrow-right" intent="primary" minimal 
                      className="!font-bold !uppercase !tracking-widest !text-[10px] group-hover:!translate-x-2 !transition-transform !bg-white/5 hover:!bg-amber-500 hover:!text-black"
                      onClick={() => handleInitalizeDaw(daw.dawId)}>
                        Launch_Session
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* --- EMPTY STATE PLACEHOLDER --- */
            <div className="!w-full !min-h-[280px] !flex !flex-col !items-center !justify-center !border-2 !border-dashed !border-zinc-800 !rounded-2xl !bg-zinc-900/20 !group hover:!border-zinc-600 !transition-colors">
              {/* <div className="!mb-4 !p-4 !rounded-full !bg-zinc-900 !border !border-zinc-800 !relative">
                <div className="!h-12 !w-12 !border-2 !border-zinc-700 !rounded-full !border-t-amber-500 !animate-spin" />
                <span className="!absolute !inset-0 !flex !items-center !justify-center !text-zinc-500 !text-[8px] !font-mono">NULL</span>
              </div> */}
              
              <div className="!text-center">
                <h3 className="!text-zinc-400 !font-black !text-xs !uppercase !tracking-[0.5em] !mb-2">
                  No_Active_Signals_Detected
                </h3>
                <p className="!text-[10px] !font-mono !text-zinc-600 !uppercase !mb-6">
                  System registry is currently empty. Initialize a new node to begin.
                </p>
                
                <Button 
                  icon="plus" 
                  intent="warning" 
                  outlined
                  className="!font-mono !text-[10px] !tracking-widest !px-8 hover:!bg-amber-500/10"
                  onClick={() => handleInitalizeDaw()}
                >
                  INITIALIZE_NEW_PROJECT
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. THE SPLIT CONSOLE */}
      <div className="!grid !grid-cols-1 !lg:grid-cols-12 !gap-10">
        
        <div className="!lg:col-span-8 !space-y-10">
          <div>
            <h3 className="!text-[10px] !font-black !text-zinc-600 !uppercase !tracking-[0.4em] !mb-6">Archive_Entries</h3>
            {listOfNotes && listOfNotes.length > 0 && (
              <button 
                onClick={() => handleOpenNote(undefined, userObject?.id, "", "", true)}
                className="!flex !items-center !gap-2 !px-3 !py-1.5 !bg-amber-600/10 hover:!bg-amber-600 !text-amber-500 hover:!text-black !border !border-amber-600/30 !rounded !font-mono !text-[10px] !font-bold !tracking-widest !transition-all !cursor-pointer !group !mb-3"
              >
                <Icon icon="plus" size={10} className="group-hover:!rotate-90 !transition-transform" />
                NEW_ENTRY
              </button>
            )}
            <div className="!space-y-2">
              {listOfNotes && listOfNotes.length > 0 ? (
                listOfNotes.map((note, index) => (
                  <div 
                    key={note.id || index} 
                    className="!flex !items-center !justify-between !p-4 !bg-zinc-900/30 hover:!bg-zinc-800/80 !border !border-white/5 hover:!border-white/20 !rounded-lg !transition-all !cursor-pointer !group"
                    // Pass the note data to the handler!
                    onClick={() => handleOpenNote(note.id, note.userId, note.title, note.content, false)}
                  >
                    <div className="!flex !items-center !gap-6">
                      <span className="!font-mono !text-zinc-700 !text-xs group-hover:!text-amber-500">
                        {String(index + 1).padStart(3, '0')}
                      </span>
                      <span className="!text-white !font-medium group-hover:!translate-x-1 !transition-transform !uppercase">
                        {note.title || "UNTITLED_LOG"}
                      </span>
                    </div>
                    
                    <div className="!flex !gap-12 !text-[10px] !font-mono !text-zinc-500 items-center">
                      {/* You can add more metadata to your DTO later, like timestamps */}
                      <span className="!hidden !md:block group-hover:!text-zinc-300 uppercase">
                        Payload_Size: {note.content?.length || 0}b
                      </span>
                      <Icon icon="chevron-right" className="group-hover:!translate-x-1 !transition-transform" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="!group !p-12 !border !border-dashed !border-white/10 !rounded-xl !bg-zinc-900/10 !flex !flex-col !items-center !justify-center !gap-4 !transition-all hover:!border-amber-500/30">
                  <div className="!text-zinc-600 !font-mono !text-[10px] !uppercase !tracking-[0.3em]">
                    No_Archive_Entries_Detected
                  </div>
                  
                  <button 
                    onClick={() => handleOpenNote(undefined, userObject?.id, "", "", true)}
                    className="!flex !items-center !gap-2 !px-4 !py-2 !bg-amber-600/10 hover:!bg-amber-600 !text-amber-500 hover:!text-black !border !border-amber-600/30 !rounded !font-mono !text-[10px] !font-bold !tracking-widest !transition-all !cursor-pointer"
                  >
                    <Icon icon="plus" size={12} />
                    INITIALIZE_NEW_SEQUENCE
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="!flex !items-center !justify-between !mb-6">
              <h3 className="!text-[10px] !font-black !text-zinc-600 !uppercase !tracking-[0.4em]">
                Community_Node
              </h3>
              {/* Optional: Add a 'View All' or 'New Post' button here later */}
            </div>

            <div className="!grid !grid-cols-1 !md:grid-cols-2 !gap-4 !mb-5 ">
              {listOfForums && listOfForums.length > 0 ? (
                listOfForums.map((post) => (
                <div 
                  key={post.id} 
                  className="!bg-zinc-900/50 !border !border-zinc-800 !p-5 !rounded-lg hover:!border-amber-500/30 !transition-all !group !cursor-pointer !relative !overflow-hidden"
                  onClick={() => handlePostClick(post.id)}
                >
                  {/* Subtle Post Type Tag */}
                  <div className="!absolute !top-0 !right-0 !px-2 !py-1 !bg-zinc-800 !text-[8px] !font-mono !text-zinc-500 !uppercase !tracking-widest !z-10">
                    {post.postType || "GENERAL"}
                  </div>

                  <h4 className="!text-zinc-200 !text-lg !font-semibold group-hover:!text-amber-500 !transition-colors !mb-1 !mt-0">
                    {post.title}
                  </h4>
                  
                  <div className="!flex !flex-col !gap-1 !mb-4">
                    <p className="!text-[10px] !font-mono !text-zinc-500 !m-0">
                      ORIGIN: <span className="!text-zinc-300">@{post.username || "ANONYMOUS"}</span>
                    </p>
                    <p className="!text-[9px] !font-mono !text-zinc-600 !uppercase !m-0">
                      TIMESTAMP: {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Button 
                    text="OPEN_DISCUSSION" 
                    className="!bg-white/5 group-hover:!bg-amber-600 group-hover:!text-black !transition-all !font-mono !text-[9px] !w-full !justify-between !text-white" 
                    rightIcon="arrow-right" 
                  />
                </div>
                ))
              ) : (
                /* Fallback if no posts are found */
                <div className="!col-span-full !p-10 !border !border-dashed !border-zinc-800 !rounded-lg !text-center">
                  <span className="!text-zinc-600 !font-mono !text-[10px] !uppercase !tracking-widest">
                    No_Active_Signals_In_Node
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        title={isNewNote ? "GENERATE_NEW_ENTRY" : `EDIT_ENTRY // ${currentNote.title}`}
        isOpen={isNoteOpen}
        onClose={() => setIsNoteOpen(false)}
        // Add this line to force the dark theme on the popup
        portalClassName="bp5-dark" 
        className="!bg-[#18181b] !text-zinc-300 !border !border-white/10 !rounded-xl !p-0"
        canOutsideClickClose
      >
        <div className={`${Classes.DIALOG_BODY} !p-6 !space-y-4 !m-0`}>
          <FormGroup 
            label={<span className="!text-zinc-500 !font-mono !text-[10px] !uppercase !tracking-widest">Entry_Title</span>}
          >
            <InputGroup 
              // Using 'minimal' helps prevent the white background
              className="!bg-black/40 !text-white" 
              asyncControl={true}
              placeholder="e.g. SESSION_LOG_#45X" 
              value={currentNote.title}
              onChange={(e) => setCurrentNote({...currentNote, title: e.target.value})}
            />
          </FormGroup>
          
          <FormGroup 
            label={<span className="!text-zinc-500 !font-mono !text-[10px] !uppercase !tracking-widest">Note_Payload</span>}
          >
            <TextArea
              fill
              className="!bg-black/40 !text-zinc-200 !font-mono !min-h-[200px] !border-zinc-800 focus:!border-amber-500/50"
              placeholder="Awaiting input..."
              value={currentNote.content}
              onChange={(e) => setCurrentNote({...currentNote, content: e.target.value})}
            />
          </FormGroup>
        </div>

        <div className={`${Classes.DIALOG_FOOTER} !bg-black/40 !p-4 !flex !justify-end !gap-3 !m-0 !border-t !border-white/5`}>
          <Button 
            minimal 
            onClick={() => setIsNoteOpen(false)} 
            text="ABORT" 
            className="!text-zinc-500 hover:!text-white !font-mono !text-[10px]" 
          />
          <Button 
            // Remove 'intent="primary"' to stop it from being blue
            // Use your own Tailwind classes for the "Commit" button
            onClick={() => handleUpdateNoteButton()}
            className="!bg-amber-600 hover:!bg-amber-500 !text-black !font-bold !tracking-widest !text-[10px] !px-6 !rounded-md"
          >
            {isNewNote ? "COMMIT_ENTRY" : "UPDATE_ARCHIVE"}
          </Button>
        </div>
      </Dialog>
    </div>
    
  );
}

export default UserPage;