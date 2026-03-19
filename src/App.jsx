import { useState, useRef, useEffect } from "react";
import { supabase } from './supabase.js'
// ── THEME ─────────────────────────────────────────────────────────────────────
const T = {
  primary:"#065f46", primaryMid:"#047857", primaryLight:"#059669",
  primaryGlow:"#05966933", accentLight:"#d1fae5", accentBorder:"#6ee7b7",
  bg:"#f0faf5", surface:"#ffffff", border:"#d1e7dd", borderLight:"#e8f5ee",
  textDark:"#0d2b1e", textMid:"#2d6a4f", textMute:"#6b9e85", textFaint:"#a8c9b8",
};

// ── DATA ──────────────────────────────────────────────────────────────────────
const SCHOOL_DEFAULT = { name:"Dez Junior School", logo:null, color:"#065f46" };
const ADMIN_USER  = { id:"admin", name:"Mrs. Harriet Nannyondo", role:"Head Administrator", avatar:"HN", isAdmin:true };
const STAFF_USERS = [
  { id:"s1", name:"Paul Ssempijja",        role:"Math Teacher",        avatar:"PS", isAdmin:false },
  { id:"s2", name:"Petrah Nabukeera",      role:"Science Head",        avatar:"PN", isAdmin:false },
  { id:"s3", name:"Michael Mukasa",        role:"PE & Sports",         avatar:"MM", isAdmin:false },
  { id:"s4", name:"Praise Byuma",          role:"Librarian",           avatar:"PB", isAdmin:false },
  { id:"s5", name:"Kityamuweesi Byuma",    role:"Guidance Counselor",  avatar:"KT", isAdmin:false },
  { id:"s6", name:"Harriet Nannyondo Jr.", role:"Director of Studies", avatar:"HJ", isAdmin:false },
  { id:"s7", name:"Ssempijja Paul Mukasa", role:"School Coordinator",  avatar:"SM", isAdmin:false },
];
const ALL_USERS = [ADMIN_USER, ...STAFF_USERS];

const CATS = [
  { key:"suggestion",   label:"Suggestion",   emoji:"💡", bg:"#fefce8", color:"#854d0e", border:"#fde68a" },
  { key:"announcement", label:"Announcement", emoji:"📢", bg:"#eff6ff", color:"#1e40af", border:"#bfdbfe" },
  { key:"question",     label:"Question",     emoji:"❓", bg:"#f0fdf4", color:"#166534", border:"#bbf7d0" },
];
const PMAP = {
  normal:  { icon:"📌", bg:"#f0faf5", color:"#065f46", border:"#d1e7dd", label:"Normal"   },
  urgent:  { icon:"🔴", bg:"#fff1f0", color:"#b91c1c", border:"#fecaca", label:"Urgent"   },
  info:    { icon:"💬", bg:"#eff6ff", color:"#1e40af", border:"#bfdbfe", label:"Info"     },
  reminder:{ icon:"⏰", bg:"#fffbeb", color:"#92400e", border:"#fde68a", label:"Reminder" },
};
const CYCLE_TYPES = [
  { key:"daily",    label:"Daily Window",  icon:"🕐", desc:"Set open & close times each day" },
  { key:"weekday",  label:"Specific Days", icon:"📅", desc:"Open all day on chosen days"      },
  { key:"fullweek", label:"Full Week",     icon:"🗓️", desc:"Open all week, Mon – Sun"         },
  { key:"custom",   label:"Custom Range",  icon:"📆", desc:"Pick exact start & end dates"     },
];
const DAYS       = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const SHORT_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const INIT_POSTS = [
  { id:"p1", authorId:"s2", category:"suggestion",   title:"Outdoor Science Lab Sessions",              content:"I'd love to propose running one science period per week outdoors — the school garden could serve as a living lab. Research shows students retain 40% more when learning in natural environments.", timestamp:new Date(Date.now()-1000*60*60*5),  adminReply:{ content:"Petrah, this is a wonderful idea! Let's schedule a meeting with the grounds committee next week.", timestamp:new Date(Date.now()-1000*60*60*2) } },
  { id:"p2", authorId:"s4", category:"question",     title:"Library Quiet Hours During Exams",           content:"Should we formally extend library quiet hours during the upcoming exam season? I've had several students request this.", timestamp:new Date(Date.now()-1000*60*60*26), adminReply:null },
  { id:"p3", authorId:"s1", category:"announcement", title:"Inter-School Math Olympiad — Team Selected", content:"Delighted to share that our school has selected 4 students for the Regional Math Olympiad on 28th March.", timestamp:new Date(Date.now()-1000*60*60*50), adminReply:{ content:"Fantastic news, Paul! Please send the students' names to the office.", timestamp:new Date(Date.now()-1000*60*60*44) } },
];
const INIT_ANNOUNCEMENTS = [
  { id:"an1", priority:"urgent",   title:"End of Term Exams — Schedule Change", body:"End of term exams moved forward by one week. New dates: 24th–28th March 2025. All teachers must submit papers to the DOS office by Friday 21st.", postedAt:"Today, 8:14 AM", pinned:true,  views:7 },
  { id:"an2", priority:"reminder", title:"Staff Meeting — Friday 3:00 PM",      body:"Mandatory staff meeting this Friday at 3:00 PM in the main hall. Attendance is compulsory. Come prepared with class progress reports.", postedAt:"Yesterday",      pinned:true,  views:5 },
  { id:"an3", priority:"info",     title:"New Library Books Available",          body:"The school has received a fresh batch of reference books for Sciences and Mathematics. Staff are encouraged to visit the library.", postedAt:"18 Mar 2025",    pinned:false, views:4 },
];
const INIT_NOTIFS = [
  { id:"n1", type:"reply",        read:false, time:"Today, 10:05 AM",    title:"Mrs. Nannyondo replied to your post",    body:"\"Fantastic news, Paul! Please send the students' names to the office.\"" },
  { id:"n2", type:"announcement", read:false, time:"Today, 8:14 AM",     title:"New announcement: Exam Schedule Change", body:"An urgent announcement about the end of term exams has been posted." },
  { id:"n3", type:"cycle_open",   read:true,  time:"1 Mar 2025, 7:00 AM",title:"March 2025 cycle is now open",           body:"The bulletin cycle has started. You can now post your suggestions, announcements and questions." },
];
const INIT_CYCLE = { id:"c3", title:"March 2025", type:"daily", openTime:"07:00", closeTime:"16:00", posts:4, replied:2, staff:7, status:"open", createdAt:"1 Mar 2025" };
const INIT_PAST_CYCLES = [
  { id:"c1", title:"February 2025", type:"fullweek", period:"1 Feb – 28 Feb 2025", posts:6, replied:6, staff:7, participation:86 },
  { id:"c2", title:"January 2025",  type:"daily",    period:"2 Jan – 31 Jan 2025", posts:4, replied:4, staff:7, participation:57 },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function timeAgo(d) {
  const s = Math.floor((Date.now()-d)/1000);
  if(s<60) return "just now"; if(s<3600) return `${Math.floor(s/60)}m ago`;
  if(s<86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`;
}
function getCat(k) { return CATS.find(c=>c.key===k)||CATS[0]; }

// ── SHARED UI ─────────────────────────────────────────────────────────────────
function Logo({size=36}) {
  return <div style={{width:size,height:size,borderRadius:size*0.28,background:`linear-gradient(135deg,${T.primaryLight},${T.primary})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 2px 12px ${T.primaryGlow}`,flexShrink:0}}>
    <svg width={size*0.52} height={size*0.52} viewBox="0 0 52 52" fill="none"><path d="M10 42 L44 8 L38 30 L24 32 Z" fill="white" opacity="0.95"/><path d="M44 8 L38 30 L32 20 Z" fill="white" opacity="0.4"/><path d="M24 32 L10 42 L18 36 Z" fill="white" opacity="0.5"/><circle cx="44" cy="8" r="2.5" fill="white" opacity="0.9"/></svg>
  </div>;
}
function SchoolMark({school,size=36}) {
  return <div style={{width:size,height:size,borderRadius:size*0.28,flexShrink:0,background:school?.logo?`url(${school.logo}) center/cover`:`linear-gradient(135deg,${T.primaryLight},${T.primary})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.45,boxShadow:`0 2px 12px ${T.primaryGlow}`}}>{!school?.logo&&"🏫"}</div>;
}
function Av({user,size=36}) {
  return <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,background:user?.isAdmin?`linear-gradient(135deg,${T.primaryLight},${T.primary})`:`linear-gradient(135deg,${T.primaryMid},${T.primary})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.32,fontWeight:700,color:"#fff",fontFamily:"'Lora',serif",boxShadow:user?.isAdmin?`0 0 0 2px ${T.primaryGlow}`:"none"}}>{user?.avatar||"?"}</div>;
}
function CatBadge({catKey}) {
  const c=getCat(catKey);
  return <span style={{background:c.bg,color:c.color,border:`1px solid ${c.border}`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",gap:4}}>{c.emoji} {c.label}</span>;
}
function PriBadge({pKey}) {
  const p=PMAP[pKey]||PMAP.normal;
  return <span style={{background:p.bg,color:p.color,border:`1px solid ${p.border}`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4}}>{p.icon} {p.label}</span>;
}

// ── AUDIO RECORDER ────────────────────────────────────────────────────────────
function AudioRecorder({ onSend, onCancel }) {
  const [mode,       setMode]       = useState("idle"); // idle | recording | preview
  const [seconds,    setSeconds]    = useState(0);
  const [audioURL,   setAudioURL]   = useState(null);
  const [holdActive, setHoldActive] = useState(false);
  const mediaRef  = useRef(null);
  const chunksRef = useRef([]);
  const timerRef  = useRef(null);
  const holdRef   = useRef(null);

  useEffect(() => {
    return () => { clearInterval(timerRef.current); clearTimeout(holdRef.current); };
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(blob));
        setMode("preview");
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setMode("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch(e) {
      alert("Microphone access denied. Please allow microphone access to record audio.");
    }
  }

  function stopRecording() {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
      clearInterval(timerRef.current);
    }
  }

  // Hold-to-record handlers
  function onHoldStart(e) {
    e.preventDefault();
    setHoldActive(true);
    holdRef.current = setTimeout(() => startRecording(), 200);
  }
  function onHoldEnd(e) {
    e.preventDefault();
    setHoldActive(false);
    clearTimeout(holdRef.current);
    if (mode === "recording") stopRecording();
  }

  function fmt(s) { return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}` }

  function handleSend() {
    if (audioURL) { onSend(audioURL); setAudioURL(null); setMode("idle"); setSeconds(0); }
  }
  function handleDiscard() { setAudioURL(null); setMode("idle"); setSeconds(0); }

  return (
    <div style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:14, padding:"14px 16px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <span style={{ fontSize:12, fontWeight:700, color:T.textMid }}>🎙️ Audio Message</span>
        <button onClick={onCancel} style={{ fontSize:11, color:T.textFaint, background:"none", border:"none", cursor:"pointer" }}>✕ Cancel</button>
      </div>

      {mode === "idle" && (
        <div style={{ display:"flex", gap:10 }}>
          {/* Tap to record */}
          <button onClick={mode==="idle"?startRecording:undefined} style={{ flex:1, padding:"12px 8px", borderRadius:12, border:`1.5px solid ${T.border}`, background:T.surface, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <span style={{ fontSize:22 }}>🎙️</span>
            <span style={{ fontSize:11, fontWeight:700, color:T.textMid }}>Tap to Record</span>
          </button>
          {/* Hold to record */}
          <button
            onMouseDown={onHoldStart} onMouseUp={onHoldEnd} onMouseLeave={onHoldEnd}
            onTouchStart={onHoldStart} onTouchEnd={onHoldEnd}
            style={{ flex:1, padding:"12px 8px", borderRadius:12, border:`1.5px solid ${T.border}`, background:holdActive?T.accentLight:T.surface, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, transition:"all 0.15s" }}>
            <span style={{ fontSize:22 }}>👇</span>
            <span style={{ fontSize:11, fontWeight:700, color:T.textMid }}>Hold to Record</span>
          </button>
        </div>
      )}

      {mode === "recording" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:"#e85d3a", animation:"pulse 1s infinite" }}/>
            <span style={{ fontSize:14, fontWeight:700, color:"#e85d3a" }}>Recording… {fmt(seconds)}</span>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={stopRecording} style={{ padding:"10px 20px", background:`linear-gradient(135deg,${T.primaryLight},${T.primary})`, color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer" }}>⏹ Stop</button>
            <button onClick={()=>{ clearInterval(timerRef.current); if(mediaRef.current) mediaRef.current.stop(); setMode("idle"); setSeconds(0); }} style={{ padding:"10px 16px", background:"#fff1f0", color:"#e85d3a", border:"1px solid #fecaca", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer" }}>✕ Cancel</button>
          </div>
          {/* Visual waveform hint */}
          <div style={{ display:"flex", gap:3, alignItems:"center", height:24 }}>
            {Array.from({length:16}).map((_,i)=><div key={i} style={{ width:3, borderRadius:4, background:T.primaryLight, opacity:0.6, height:`${8+Math.sin(i*0.8+seconds)*8}px`, transition:"height 0.3s" }}/>)}
          </div>
        </div>
      )}

      {mode === "preview" && audioURL && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:"10px 14px" }}>
            <p style={{ fontSize:11, fontWeight:700, color:T.textFaint, margin:"0 0 8px", textTransform:"uppercase", letterSpacing:"0.07em" }}>Preview · {fmt(seconds)}</p>
            <audio controls src={audioURL} style={{ width:"100%", height:36 }}/>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={handleSend} style={{ flex:2, padding:"11px", background:`linear-gradient(135deg,${T.primaryLight},${T.primary})`, color:"#fff", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:"pointer" }}>🎙️ Send Audio →</button>
            <button onClick={handleDiscard} style={{ flex:1, padding:"11px", background:"#fff1f0", color:"#e85d3a", border:"1px solid #fecaca", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer" }}>🗑 Discard</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AUDIO PLAYER ──────────────────────────────────────────────────────────────
function AudioMsg({ url }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, background:`linear-gradient(135deg,${T.accentLight},#ecfdf5)`, border:`1px solid ${T.accentBorder}`, borderRadius:12, padding:"10px 14px" }}>
      <span style={{ fontSize:20 }}>🎙️</span>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:11, fontWeight:700, color:T.textMid, margin:"0 0 5px" }}>Audio Message</p>
        <audio controls src={url} style={{ width:"100%", height:32 }}/>
      </div>
    </div>
  );
}

function Toast({msg}) {
  return msg?<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:T.textDark,color:"#fff",borderRadius:12,padding:"10px 20px",fontSize:13,fontWeight:600,boxShadow:"0 8px 32px rgba(0,0,0,0.2)",zIndex:9999,whiteSpace:"nowrap",animation:"slideIn 0.3s ease"}}>{msg}</div>:null;
}
function BackBtn({onBack,label="← Back"}) {
  return <button onClick={onBack} style={{fontSize:13,fontWeight:700,color:T.primaryMid,background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:10,padding:"8px 14px",cursor:"pointer",fontFamily:"'Lora',serif",marginBottom:16,display:"inline-flex",alignItems:"center",gap:4}}>{label}</button>;
}
function SectionHeader({title,sub}) {
  return <div style={{marginBottom:16}}><h2 style={{fontSize:18,fontWeight:700,color:T.textDark,margin:0,fontFamily:"'Lora',serif"}}>{title}</h2>{sub&&<p style={{fontSize:13,color:T.textMute,marginTop:3}}>{sub}</p>}</div>;
}

// ── SPLASH ────────────────────────────────────────────────────────────────────
function Splash({onDone}) {
  const [step,setStep]=useState(0);
  useEffect(()=>{ setTimeout(()=>setStep(1),300); setTimeout(()=>setStep(2),800); setTimeout(()=>setStep(3),1300); },[]);
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,#064e3b 0%,#065f46 40%,#047857 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"60px 32px 48px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",width:320,height:320,borderRadius:"50%",background:"#fff",opacity:0.12,top:-100,right:-80,animation:"pulse 6s ease-in-out infinite"}}/>
      <div style={{position:"absolute",width:180,height:180,borderRadius:"50%",background:"#fff",opacity:0.07,bottom:80,left:-50,animation:"pulse 6s 2s ease-in-out infinite"}}/>
      <div/>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:28,zIndex:2}}>
        <div style={{width:110,height:110,borderRadius:32,background:"rgba(255,255,255,0.15)",backdropFilter:"blur(12px)",border:"1.5px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 40px rgba(0,0,0,0.2)",animation:"scaleIn 0.6s cubic-bezier(0.34,1.56,0.64,1)"}}>
          <svg width="54" height="54" viewBox="0 0 52 52" fill="none"><path d="M10 42 L44 8 L38 30 L24 32 Z" fill="white" opacity="0.95"/><path d="M44 8 L38 30 L32 20 Z" fill="white" opacity="0.4"/><path d="M24 32 L10 42 L18 36 Z" fill="white" opacity="0.5"/><circle cx="44" cy="8" r="2.5" fill="white" opacity="0.9"/></svg>
        </div>
        <div style={{textAlign:"center",animation:"floatUp 0.5s ease"}}>
          <h1 style={{fontSize:36,fontWeight:700,color:"#fff",margin:0}}>BulletinBoard</h1>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginTop:6,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:600}}>For Schools & Institutions</p>
        </div>
        {step>=2&&<p style={{fontSize:17,color:"rgba(255,255,255,0.88)",lineHeight:1.65,fontStyle:"italic",textAlign:"center",maxWidth:280,animation:"floatUp 0.5s ease"}}>"One voice from every staff member.<br/>One response from leadership."</p>}
        {step>=2&&<div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",animation:"floatUp 0.5s ease"}}>
          {["💡 Suggestions","📢 Announcements","❓ Questions"].map(l=><span key={l} style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.9)",background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:20,padding:"5px 13px"}}>{l}</span>)}
        </div>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14,width:"100%",maxWidth:360,zIndex:2}}>
        {step>=3&&<>
          <button onClick={onDone} style={{padding:"16px 24px",background:"#fff",color:"#065f46",border:"none",borderRadius:16,fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 6px 24px rgba(0,0,0,0.18)",animation:"floatUp 0.5s ease"}}>Get Started →</button>
          <div style={{padding:"12px 16px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:14,animation:"floatUp 0.5s ease"}}>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.75)",textAlign:"center",lineHeight:1.6,margin:0}}>📲 <strong>Install:</strong> tap Share → <span style={{color:"#fff"}}>"Add to Home Screen"</span></p>
          </div>
          <p style={{fontSize:11,color:"rgba(255,255,255,0.4)",textAlign:"center"}}>By continuing you agree to our Terms & Privacy Policy</p>
        </>}
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({onLogin}) {
  const [phone,setPhone]=useState(""); const [country,setCountry]=useState({code:"+256",flag:"🇺🇬"});
  const [ddOpen,setDdOpen]=useState(false); const [focused,setFocused]=useState(false);
  const [checking,setChecking]=useState(false); const [notFound,setNotFound]=useState(false);
  const COUNTRIES=[{code:"+256",flag:"🇺🇬",name:"Uganda"},{code:"+233",flag:"🇬🇭",name:"Ghana"},{code:"+254",flag:"🇰🇪",name:"Kenya"},{code:"+255",flag:"🇹🇿",name:"Tanzania"},{code:"+44",flag:"🇬🇧",name:"UK"},{code:"+1",flag:"🇺🇸",name:"USA"}];
  const valid = phone.replace(/\s/g,"").length>=7;
  async function submit() {
    setChecking(true); setNotFound(false); await new Promise(r=>setTimeout(r,1400)); setChecking(false);
    if(phone.replace(/\s/g,"")==="0000") { setNotFound(true); return; }
    onLogin(STAFF_USERS[0]);
  }
  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column"}}>
      <div style={{background:`linear-gradient(135deg,${T.primaryLight},${T.primary})`,padding:"44px 24px 56px",display:"flex",flexDirection:"column",alignItems:"center",gap:16,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",width:220,height:220,borderRadius:"50%",background:"rgba(255,255,255,0.06)",top:-70,right:-60}}/>
        <div style={{width:80,height:80,borderRadius:22,background:"rgba(255,255,255,0.2)",border:"2.5px solid rgba(255,255,255,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,zIndex:1}}>🏫</div>
        <div style={{textAlign:"center",zIndex:1}}>
          <h1 style={{fontSize:22,fontWeight:700,color:"#fff",margin:0}}>Dez Junior School</h1>
          <p style={{fontSize:14,color:"rgba(255,255,255,0.75)",margin:"5px 0 0"}}>Staff Bulletin Board</p>
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"0 20px 40px",marginTop:-24}}>
        <div style={{background:T.surface,borderRadius:24,padding:"28px 24px",border:`1px solid ${T.border}`,boxShadow:"0 4px 32px #06403812",width:"100%",maxWidth:420}}>
          {checking?(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 0",gap:14}}>
              <div style={{width:48,height:48,borderRadius:"50%",border:`3px solid ${T.primaryLight}`,borderTopColor:"transparent",animation:"spin 0.8s linear infinite"}}/>
              <p style={{fontSize:14,fontWeight:600,color:T.textMid}}>Checking your number…</p>
            </div>
          ):notFound?(
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:48,marginBottom:12}}>🔍</div>
              <h3 style={{fontSize:18,fontWeight:700,color:T.textDark,marginBottom:8}}>Number not recognised</h3>
              <p style={{fontSize:13,color:T.textMute,lineHeight:1.7,marginBottom:14}}>This number isn't registered on this board.</p>
              <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:"14px",marginBottom:18,textAlign:"left"}}>
                <p style={{fontSize:13,fontWeight:700,color:"#92400e",marginBottom:6}}>📋 What to do:</p>
                <p style={{fontSize:13,color:"#78350f",lineHeight:1.7,margin:0}}>Ask your administrator for an <strong>invite link</strong> to register and access the board.</p>
              </div>
              <button onClick={()=>{setNotFound(false);setPhone("");}} style={{width:"100%",padding:"13px",background:`linear-gradient(135deg,${T.primaryLight},${T.primary})`,color:"#fff",border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>← Try Again</button>
            </div>
          ):(
            <>
              <h3 style={{fontSize:18,fontWeight:700,color:T.textDark,margin:"0 0 6px"}}>Enter your number</h3>
              <p style={{fontSize:13,color:T.textMute,marginBottom:22,lineHeight:1.65}}>Enter your registered WhatsApp number to sign in.</p>
              <label style={{fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:"0.07em",display:"block",marginBottom:8}}>WhatsApp Number</label>
              <div style={{display:"flex",gap:8,marginBottom:20}}>
                <div style={{position:"relative",flexShrink:0}}>
                  <button onClick={()=>setDdOpen(o=>!o)} style={{height:"100%",padding:"13px 12px",background:ddOpen?T.bg:"#f9fffe",border:`1.5px solid ${ddOpen?T.primaryLight:T.border}`,borderRadius:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6,outline:"none"}}>
                    <span>{country.flag}</span><span style={{fontWeight:600,fontSize:14}}>{country.code}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a8c9b8" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  {ddOpen&&<div style={{position:"absolute",top:"calc(100% + 6px)",left:0,width:200,background:"#fff",border:`1px solid ${T.border}`,borderRadius:14,boxShadow:"0 8px 32px #06403818",zIndex:50,maxHeight:200,overflowY:"auto"}}>
                    {COUNTRIES.map(c=><button key={c.code} onClick={()=>{setCountry(c);setDdOpen(false);}} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:country.code===c.code?T.bg:"transparent",border:"none",cursor:"pointer"}}>
                      <span style={{fontSize:16}}>{c.flag}</span><span style={{fontSize:13,color:T.textDark,fontWeight:600}}>{c.name}</span><span style={{fontSize:12,color:T.textFaint,marginLeft:"auto"}}>{c.code}</span>
                    </button>)}
                  </div>}
                </div>
                <input type="tel" placeholder="7X XXX XXXX" value={phone} onChange={e=>setPhone(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} onKeyDown={e=>e.key==="Enter"&&valid&&submit()} style={{flex:1,borderRadius:12,padding:"13px 16px",fontSize:15,color:T.textDark,background:"#f9fffe",boxSizing:"border-box",outline:"none",border:focused?`1.5px solid ${T.primaryLight}`:`1.5px solid ${T.border}`,boxShadow:focused?`0 0 0 3px ${T.primaryGlow}`:"none",transition:"all 0.2s"}}/>
              </div>
              <button onClick={submit} disabled={!valid} style={{width:"100%",padding:"15px",background:valid?`linear-gradient(135deg,${T.primaryLight},${T.primary})`:T.bg,color:valid?"#fff":T.textFaint,border:"none",borderRadius:14,fontSize:15,fontWeight:700,cursor:valid?"pointer":"not-allowed",boxShadow:valid?`0 4px 20px ${T.primaryGlow}`:"none",transition:"all 0.2s",marginBottom:14}}>Sign In →</button>
              <p style={{fontSize:12,color:T.textFaint,textAlign:"center",lineHeight:1.6}}>💡 Demo: any number → Paul's account · type <strong style={{color:T.primaryLight}}>0000</strong> for not found</p>
            </>
          )}
        </div>
        <button onClick={()=>onLogin(ADMIN_USER)} style={{marginTop:14,fontSize:13,color:T.primaryLight,background:"none",border:"none",cursor:"pointer",fontWeight:600,textDecoration:"underline"}}>Sign in as Administrator →</button>
      </div>
    </div>
  );
}

// ── SCHOOL SETUP ──────────────────────────────────────────────────────────────
function SchoolSetup({school,onSave,onBack}) {
  const PRESET_COLORS=[{name:"Emerald",primary:"#065f46",light:"#059669",bg:"#f0faf5",border:"#d1e7dd"},{name:"Royal Blue",primary:"#1e3a8a",light:"#2563eb",bg:"#eff6ff",border:"#bfdbfe"},{name:"Burgundy",primary:"#7f1d1d",light:"#b91c1c",bg:"#fff1f2",border:"#fecdd3"},{name:"Violet",primary:"#4c1d95",light:"#7c3aed",bg:"#f5f3ff",border:"#ddd6fe"},{name:"Amber",primary:"#78350f",light:"#d97706",bg:"#fffbeb",border:"#fde68a"},{name:"Teal",primary:"#134e4a",light:"#0d9488",bg:"#f0fdfa",border:"#99f6e4"}];
  const [name,setName]=useState(school.name); const [selColor,setSelColor]=useState(PRESET_COLORS[0]); const [saving,setSaving]=useState(false); const [done,setDone]=useState(false);
  async function save() { setSaving(true); await new Promise(r=>setTimeout(r,800)); setSaving(false); setDone(true); setTimeout(()=>onSave({...school,name}),1200); }
  if(done) return <div style={{textAlign:"center",padding:"48px 20px"}}><div style={{fontSize:48,marginBottom:12}}>✅</div><h3 style={{fontSize:18,fontWeight:700,color:T.textDark,marginBottom:6}}>School updated!</h3><p style={{fontSize:13,color:T.textMute}}>Taking you back…</p></div>;
  return (
    <div>
      <BackBtn onBack={onBack}/>
      <SectionHeader title="School Settings" sub="Update your school's name, logo and theme colour"/>
      {/* Live preview */}
      <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${selColor.light},${selColor.primary})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🏫</div>
        <div><p style={{fontSize:15,fontWeight:700,color:selColor.primary,margin:0}}>{name||"Your School Name"}</p><p style={{fontSize:11,color:selColor.light,margin:"2px 0 0"}}>Staff Bulletin Board</p></div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div><label style={{fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:"0.07em",display:"block",marginBottom:7}}>School Name</label>
          <input type="text" value={name} onChange={e=>setName(e.target.value)} style={{width:"100%",borderRadius:12,padding:"12px 14px",fontSize:14,color:T.textDark,background:"#f9fffe",border:`1.5px solid ${T.border}`,outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div><label style={{fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:"0.07em",display:"block",marginBottom:10}}>Colour Theme</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {PRESET_COLORS.map(c=><button key={c.name} onClick={()=>setSelColor(c)} style={{padding:"10px 6px",borderRadius:12,cursor:"pointer",background:c.bg,border:selColor.name===c.name?`2px solid ${c.light}`:`2px solid transparent`,display:"flex",flexDirection:"column",alignItems:"center",gap:6,boxShadow:selColor.name===c.name?`0 0 0 3px ${c.light}33`:"none"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:`linear-gradient(135deg,${c.light},${c.primary})`}}/>
              <span style={{fontSize:10,fontWeight:700,color:c.primary}}>{c.name}</span>
              {selColor.name===c.name&&<span style={{fontSize:10,color:c.light}}>✓</span>}
            </button>)}
          </div>
        </div>
        <button onClick={save} disabled={!name.trim()||saving} style={{padding:"14px",background:name.trim()?`linear-gradient(135deg,${T.primaryLight},${T.primary})`:T.bg,color:name.trim()?"#fff":T.textFaint,border:"none",borderRadius:14,fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:name.trim()?`0 4px 20px ${T.primaryGlow}`:"none"}}>
          {saving?"Saving…":"Save Changes →"}
        </button>
      </div>
    </div>
  );
}

// ── READ RECEIPTS ─────────────────────────────────────────────────────────────
function ReadReceipts({posts,announcements,onBack}) {
  const [detail,setDetail]=useState(null);
  const READ_DATA = [
    { id:"i1", type:"reply",        title:"Re: Outdoor Science Lab Sessions",           sentAt:"Today, 10:05 AM", reads:[{staffId:"s1",time:"10:07 AM"},{staffId:"s2",time:"10:06 AM"},{staffId:"s4",time:"10:22 AM"},{staffId:"s7",time:"11:01 AM"}] },
    { id:"i2", type:"announcement", title:"End of Term Exams — Schedule Change",        sentAt:"Today, 8:14 AM",  reads:[{staffId:"s1",time:"8:16 AM"},{staffId:"s2",time:"8:20 AM"},{staffId:"s3",time:"9:05 AM"},{staffId:"s4",time:"8:45 AM"},{staffId:"s6",time:"8:30 AM"},{staffId:"s7",time:"8:18 AM"}] },
    { id:"i3", type:"reply",        title:"Re: Library Quiet Hours During Exams",       sentAt:"Yesterday, 3:15 PM", reads:[{staffId:"s4",time:"3:17 PM"},{staffId:"s1",time:"4:02 PM"}] },
    { id:"i4", type:"announcement", title:"Staff Meeting — Friday 3:00 PM",             sentAt:"Yesterday, 2:30 PM", reads:STAFF_USERS.map((s,i)=>({staffId:s.id,time:`2:${35+i*5} PM`})) },
  ];
  const total = STAFF_USERS.length;
  return (
    <div>
      <BackBtn onBack={onBack}/>
      <SectionHeader title="Read Receipts" sub="See who has read your replies and announcements"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        {[{label:"Messages Sent",val:READ_DATA.length,color:T.primary},{label:"Avg. Read Rate",val:`${Math.round(READ_DATA.reduce((a,i)=>a+(i.reads.length/total),0)/READ_DATA.length*100)}%`,color:T.primaryLight},{label:"Fully Read",val:READ_DATA.filter(i=>i.reads.length===total).length,color:"#16a34a"},{label:"Partial",val:READ_DATA.filter(i=>i.reads.length>0&&i.reads.length<total).length,color:"#e85d3a"}].map(s=>(
          <div key={s.label} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 12px",textAlign:"center"}}>
            <p style={{fontSize:22,fontWeight:700,color:s.color,margin:0}}>{s.val}</p>
            <p style={{fontSize:11,color:T.textMute,margin:"4px 0 0",fontWeight:600,lineHeight:1.3}}>{s.label}</p>
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {READ_DATA.map(item=>{
          const pct=Math.round((item.reads.length/total)*100);
          const unread=STAFF_USERS.filter(s=>!item.reads.find(r=>r.staffId===s.id));
          return (
            <div key={item.id} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:"16px 18px",boxShadow:"0 2px 8px #06403806"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:10}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{background:item.type==="reply"?"#f0fdf4":"#fefce8",color:item.type==="reply"?"#166534":"#854d0e",border:`1px solid ${item.type==="reply"?"#bbf7d0":"#fde68a"}`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>{item.type==="reply"?"✉️ Reply":"📢 Announcement"}</span>
                    <span style={{fontSize:11,color:T.textFaint}}>{item.sentAt}</span>
                  </div>
                  <p style={{fontSize:14,fontWeight:700,color:T.textDark,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</p>
                </div>
                <button onClick={()=>setDetail(item)} style={{background:T.accentLight,color:T.primary,border:`1px solid ${T.accentBorder}`,borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>Details</button>
              </div>
              <div style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:12,color:T.textMid,fontWeight:600}}>Read by {item.reads.length} of {total}</span>
                  <span style={{fontSize:12,fontWeight:700,color:pct===100?"#16a34a":pct>=50?T.primaryLight:"#e85d3a"}}>{pct}%</span>
                </div>
                <div style={{background:T.bg,borderRadius:20,height:7,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:"100%",borderRadius:20,background:pct===100?"#22c55e":`linear-gradient(90deg,${T.primaryLight},${T.primary})`,transition:"width 0.5s"}}/>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                {item.reads.slice(0,4).map((r,i)=>{
                  const m=STAFF_USERS.find(s=>s.id===r.staffId);
                  return m?<div key={r.staffId} style={{marginLeft:i>0?-6:0,zIndex:10-i}}><Av user={m} size={24}/></div>:null;
                })}
                {item.reads.length>4&&<span style={{fontSize:11,color:T.primaryLight,fontWeight:700,marginLeft:2}}>+{item.reads.length-4}</span>}
                <span style={{fontSize:11,color:T.textFaint,margin:"0 4px"}}>·</span>
                {unread.length>0?<span style={{fontSize:11,color:"#94a3b8",fontStyle:"italic"}}>{unread.length} haven't read</span>:<span style={{fontSize:12,color:"#16a34a",fontWeight:700}}>✓ All read</span>}
              </div>
            </div>
          );
        })}
      </div>

      {detail&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}} onClick={()=>setDetail(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"24px 20px 40px",width:"100%",maxWidth:600,boxShadow:"0 -8px 40px rgba(0,0,0,0.15)",animation:"slideUp 0.3s ease",maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{width:36,height:4,borderRadius:4,background:T.border,margin:"0 auto 18px"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{fontSize:16,fontWeight:700,color:T.textDark,margin:0}}>{detail.title}</h3>
              <button onClick={()=>setDetail(null)} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer",color:T.textMute}}>Close</button>
            </div>
            <p style={{fontSize:11,fontWeight:700,color:T.textFaint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>✅ Read ({detail.reads.length})</p>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              {detail.reads.map(r=>{const m=STAFF_USERS.find(s=>s.id===r.staffId);return m?<div key={r.staffId} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12}}><Av user={m} size={32}/><div style={{flex:1}}><p style={{fontSize:13,fontWeight:600,color:T.textDark,margin:0}}>{m.name}</p><p style={{fontSize:11,color:T.textMute,margin:"1px 0 0"}}>{m.role}</p></div><span style={{fontSize:11,color:"#16a34a",fontWeight:700}}>✓ {r.time}</span></div>:null;})}
            </div>
            {(()=>{const unread=STAFF_USERS.filter(s=>!detail.reads.find(r=>r.staffId===s.id));return unread.length>0?(<><p style={{fontSize:11,fontWeight:700,color:T.textFaint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>⏳ Not Read ({unread.length})</p><div style={{display:"flex",flexDirection:"column",gap:8}}>{unread.map(s=><div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:12}}><Av user={{...s,isAdmin:false}} size={32}/><div style={{flex:1}}><p style={{fontSize:13,fontWeight:600,color:T.textDark,margin:0}}>{s.name}</p><p style={{fontSize:11,color:T.textMute,margin:"1px 0 0"}}>{s.role}</p></div><span style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>Not read</span></div>)}</div></>):(<div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:"14px",textAlign:"center"}}><p style={{fontSize:14,fontWeight:700,color:"#16a34a",margin:0}}>✅ All staff have read this</p></div>);})()}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ADMIN POST FORM ───────────────────────────────────────────────────────────
function AdminPostForm({ posts, setPosts, addNotif }) {
  const [open,     setOpen]     = useState(false);
  const [title,    setTitle]    = useState("");
  const [content,  setContent]  = useState("");
  const [category, setCategory] = useState("announcement");
  const [mode,     setMode]     = useState("text"); // "text" | "audio"
  const [audioURL, setAudioURL] = useState(null);
  const [posting,  setPosting]  = useState(false);

async function submit() {
    if(mode==="text"&&(!title.trim()||!content.trim())) return;
    if(mode==="audio"&&(!title.trim()||!audioURL)) return;
    setPosting(true);
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        author_id: "admin",
        author_name: "Mrs. Harriet Nannyondo",
        author_role: "Head Administrator",
        author_avatar: "HN",
        is_admin: true,
        category,
        title,
        content: mode==="audio" ? "🎙️ Audio message" : content,
        audio_url: mode==="audio" ? audioURL : null,
      }])
      .select()
      .single();
    if(error) { console.error(error); setPosting(false); return; }
    const p = {
      id: data.id, authorId: data.author_id, category: data.category,
      title: data.title, content: data.content,
      audioURL: data.audio_url, timestamp: new Date(data.created_at),
      adminReply: null, isAdminPost: true,
    };
    setPosts(prev=>[p,...prev]);
    addNotif({type:"new_post",title:`Mrs. Nannyondo posted: "${title}"`,body:mode==="audio"?"The administrator sent an audio message.":content.slice(0,80)});
    setOpen(false); setTitle(""); setContent(""); setCategory("announcement"); setMode("text"); setAudioURL(null); setPosting(false);
  }

  if(!open) return (
    <button onClick={()=>setOpen(true)} style={{width:"100%",padding:"12px 16px",background:`linear-gradient(135deg,${T.primaryLight},${T.primary})`,color:"#fff",border:"none",borderRadius:14,fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 4px 16px ${T.primaryGlow}`}}>
      <span style={{fontSize:18}}>✏️</span> Post a Message to Staff
    </button>
  );

  return (
    <div style={{background:T.surface,border:`1.5px solid ${T.primaryLight}`,borderRadius:18,overflow:"hidden",boxShadow:`0 4px 20px ${T.primaryGlow}`}}>
      <div style={{padding:"14px 18px 10px",borderBottom:`1px solid ${T.borderLight}`,background:"linear-gradient(135deg,#f0fdf7,#fff)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Av user={ADMIN_USER} size={34}/>
          <div><p style={{fontSize:13,fontWeight:700,color:T.textDark,margin:0}}>Mrs. Harriet Nannyondo</p><p style={{fontSize:11,color:T.textMute,margin:0}}>Posting as Administrator</p></div>
        </div>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:18}}>✕</button>
      </div>
      <div style={{padding:"14px 18px 18px",display:"flex",flexDirection:"column",gap:12}}>
        {/* Category */}
        <div style={{display:"flex",gap:6}}>
          {CATS.map(c=><button key={c.key} onClick={()=>setCategory(c.key)} style={{flex:1,padding:"7px 4px",borderRadius:10,cursor:"pointer",fontSize:11,fontWeight:600,background:category===c.key?c.bg:T.bg,border:category===c.key?`1.5px solid ${c.border}`:`1.5px solid ${T.border}`,color:category===c.key?c.color:T.textFaint}}>{c.emoji} {c.label}</button>)}
        </div>
        {/* Title */}
        <input type="text" placeholder="Title of your post…" value={title} onChange={e=>setTitle(e.target.value)} style={{borderRadius:10,padding:"11px 14px",fontSize:14,color:T.textDark,background:"#f9fffe",border:`1.5px solid ${T.border}`,outline:"none"}}/>
        {/* Message mode toggle */}
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setMode("text")} style={{flex:1,padding:"8px",borderRadius:10,cursor:"pointer",fontSize:12,fontWeight:700,background:mode==="text"?T.accentLight:T.bg,border:mode==="text"?`1.5px solid ${T.accentBorder}`:`1.5px solid ${T.border}`,color:mode==="text"?T.primary:T.textFaint}}>✍️ Text</button>
          <button onClick={()=>setMode("audio")} style={{flex:1,padding:"8px",borderRadius:10,cursor:"pointer",fontSize:12,fontWeight:700,background:mode==="audio"?"#fdf4ff":T.bg,border:mode==="audio"?"1.5px solid #e9d5ff":`1.5px solid ${T.border}`,color:mode==="audio"?"#7e22ce":T.textFaint}}>🎙️ Audio</button>
        </div>
        {/* Content */}
        {mode==="text"
          ? <textarea placeholder="Write your message to all staff…" value={content} onChange={e=>setContent(e.target.value)} style={{borderRadius:10,padding:"11px 14px",fontSize:14,color:T.textDark,background:"#f9fffe",border:`1.5px solid ${T.border}`,outline:"none",minHeight:90,resize:"vertical"}}/>
          : audioURL
            ? <div>
                <AudioMsg url={audioURL}/>
                <button onClick={()=>setAudioURL(null)} style={{marginTop:8,fontSize:12,color:"#e85d3a",background:"#fff1f0",border:"1px solid #fecaca",borderRadius:8,padding:"5px 12px",cursor:"pointer"}}>🗑 Discard & Re-record</button>
              </div>
            : <AudioRecorder onSend={url=>setAudioURL(url)} onCancel={()=>setMode("text")}/>
        }
        <button onClick={submit} disabled={posting||!title.trim()||(mode==="text"&&!content.trim())||(mode==="audio"&&!audioURL)} style={{padding:"12px",background:`linear-gradient(135deg,${T.primaryLight},${T.primary})`,color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",opacity:(posting||!title.trim()||(mode==="text"&&!content.trim())||(mode==="audio"&&!audioURL))?0.5:1}}>
          {posting?"Posting…":"📢 Post to All Staff →"}
        </button>
      </div>
    </div>
  );
}

// ── BULLETIN BOARD ────────────────────────────────────────────────────────────
function Board({currentUser,posts,setPosts,announcements,activeCycle,addNotif}) {
  const [filter,setFilter]=useState("all"); const [catFilter,setCatFilter]=useState("all");
  const [newId,setNewId]=useState(null); const [title,setTitle]=useState(""); const [content,setContent]=useState(""); const [category,setCategory]=useState("suggestion");
  const [replyOpen,setReplyOpen]=useState(null); const [replyText,setReplyText]=useState(""); const [replyMode,setReplyMode]=useState("text");
  const hasPosted=posts.some(p=>p.authorId===currentUser.id);
  const cycleOpen=!!activeCycle;
  const pinned=announcements.filter(a=>a.pinned);
  const displayed=posts.filter(p=>filter==="all"?true:filter==="pending"?!p.adminReply:!!p.adminReply).filter(p=>catFilter==="all"?true:p.category===catFilter);

async function doPost() {
    if(!title.trim()||!content.trim()) return;
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        author_id: currentUser.id,
        author_name: currentUser.name,
        author_role: currentUser.role,
        author_avatar: currentUser.avatar,
        is_admin: currentUser.isAdmin,
        category,
        title,
        content,
      }])
      .select()
      .single();
    if(error) { console.error(error); return; }
    const p = {
      id: data.id, authorId: data.author_id, category: data.category,
      title: data.title, content: data.content,
      timestamp: new Date(data.created_at), adminReply: null
    };
    setPosts(prev=>[p,...prev]); setNewId(p.id); setTitle(""); setContent(""); setCategory("suggestion");
    addNotif({type:"new_post",title:`New post from ${currentUser.name}`,body:`${currentUser.name} submitted a ${category}: "${title}"`});
  }
   async function doReply(postId) {
    if(!replyText.trim()) return;
    const post=posts.find(p=>p.id===postId);
    const { error } = await supabase
      .from('posts')
      .update({
        admin_reply_content: replyText,
        admin_reply_at: new Date().toISOString(),
      })
      .eq('id', postId);
    if(error) { console.error(error); return; }
    setPosts(prev=>prev.map(p=>p.id===postId?{...p,adminReply:{content:replyText,timestamp:new Date()}}:p));
    addNotif({type:"reply",title:"Mrs. Nannyondo replied to your post",body:`"${replyText.slice(0,80)}…"`,forUser:post.authorId});
    setReplyOpen(null); setReplyText(""); setReplyMode("text");
  }
async function doReplyAudio(postId, audioURL) {
    const post=posts.find(p=>p.id===postId);
    const { error } = await supabase
      .from('posts')
      .update({
        admin_reply_content: "🎙️ Audio reply",
        admin_reply_audio: audioURL,
        admin_reply_at: new Date().toISOString(),
      })
      .eq('id', postId);
    if(error) { console.error(error); return; }
    setPosts(prev=>prev.map(p=>p.id===postId?{...p,adminReply:{content:"🎙️ Audio reply",audioURL,timestamp:new Date()}}:p));
    addNotif({type:"reply",title:"Mrs. Nannyondo sent you an audio reply",body:"Tap to listen to the administrator's response.",forUser:post.authorId});
  }
  const pill=(label,active,onClick)=><button onClick={onClick} style={{padding:"6px 12px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",background:active?T.primary:T.surface,color:active?"#fff":T.textMute,border:active?`1.5px solid ${T.primary}`:`1.5px solid ${T.border}`}}>{label}</button>;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Pinned announcements */}
      {pinned.map(an=>{const p=PMAP[an.priority]||PMAP.normal;return(
        <div key={an.id} style={{background:p.bg,border:`1.5px solid ${p.border}`,borderRadius:16,padding:"14px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><span style={{fontSize:11}}>📌</span><span style={{fontSize:11,fontWeight:700,color:p.color}}>Pinned</span><PriBadge pKey={an.priority}/></div>
          <p style={{fontSize:14,fontWeight:700,color:T.textDark,margin:"0 0 4px"}}>{an.title}</p>
          <p style={{fontSize:13,color:T.textMid,margin:0,lineHeight:1.6}}>{an.body}</p>
        </div>
      );})}

      {/* Post form — staff only */}
      {!currentUser.isAdmin&&(
        !cycleOpen?(
          <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:16,padding:"20px",textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:8}}>🔒</div>
            <p style={{fontSize:14,fontWeight:700,color:"#92400e",margin:"0 0 4px"}}>Bulletin cycle is closed</p>
            <p style={{fontSize:13,color:"#78350f",lineHeight:1.6}}>The administrator hasn't opened a posting cycle yet. You can still read all posts below.</p>
          </div>
        ):hasPosted?(
          <div style={{background:"linear-gradient(135deg,#f0fdf4,#ecfdf5)",border:`1.5px solid ${T.accentBorder}`,borderRadius:16,padding:"20px",textAlign:"center"}}>
            <div style={{fontSize:30,marginBottom:8}}>✅</div>
            <p style={{fontSize:14,fontWeight:700,color:T.primary,margin:"0 0 4px"}}>Your post has been submitted!</p>
            <p style={{fontSize:12,color:T.textMute}}>Each staff member may post once. Mrs. Nannyondo will respond shortly.</p>
          </div>
        ):(
          <div style={{background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:18,overflow:"hidden"}}>
            <div style={{padding:"14px 18px 10px",borderBottom:`1px solid ${T.borderLight}`,background:"linear-gradient(135deg,#f0fdf7,#fff)"}}>
              <h3 style={{fontSize:15,fontWeight:700,color:T.textDark,margin:0}}>📝 Share with the Staff Board</h3>
              <p style={{fontSize:11,color:T.textFaint,margin:"3px 0 0"}}>Cycle is open — you have one opportunity to post.</p>
            </div>
            <div style={{padding:"14px 18px 18px",display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",gap:6}}>
                {CATS.map(c=><button key={c.key} onClick={()=>setCategory(c.key)} style={{flex:1,padding:"8px 4px",borderRadius:10,cursor:"pointer",fontSize:11,fontWeight:600,background:category===c.key?c.bg:T.bg,border:category===c.key?`1.5px solid ${c.border}`:`1.5px solid ${T.border}`,color:category===c.key?c.color:T.textFaint}}>{c.emoji} {c.label}</button>)}
              </div>
              <input type="text" placeholder="Title of your post…" value={title} onChange={e=>setTitle(e.target.value)} style={{borderRadius:10,padding:"11px 14px",fontSize:14,color:T.textDark,background:"#f9fffe",border:`1.5px solid ${T.border}`,outline:"none"}}/>
              <textarea placeholder="Share your idea, announcement or question in detail…" value={content} onChange={e=>setContent(e.target.value)} style={{borderRadius:10,padding:"11px 14px",fontSize:14,color:T.textDark,background:"#f9fffe",border:`1.5px solid ${T.border}`,outline:"none",minHeight:90,resize:"vertical"}}/>
              <button onClick={doPost} disabled={!title.trim()||!content.trim()} style={{padding:"12px",background:`linear-gradient(135deg,${T.primaryLight},${T.primary})`,color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",opacity:!title.trim()||!content.trim()?0.5:1}}>Post to Bulletin →</button>
            </div>
          </div>
        )
      )}

      {/* Admin — post form */}
      {currentUser.isAdmin&&(
        <AdminPostForm posts={posts} setPosts={setPosts} addNotif={addNotif}/>
      )}

      {/* Admin — reply reminder */}
      {currentUser.isAdmin&&posts.filter(p=>!p.adminReply).length>0&&(
        <div style={{background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>⏳</span>
          <p style={{fontSize:13,fontWeight:600,color:T.textMid,margin:0}}>{posts.filter(p=>!p.adminReply).length} post{posts.filter(p=>!p.adminReply).length>1?"s":""} awaiting your response</p>
        </div>
      )}

      {/* Filters */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {pill("All",filter==="all",()=>setFilter("all"))}
        {pill("⏳ Pending",filter==="pending",()=>setFilter("pending"))}
        {pill("✅ Replied",filter==="replied",()=>setFilter("replied"))}
        <div style={{width:1,height:20,background:T.border,margin:"0 2px",alignSelf:"center"}}/>
        {pill("All Types",catFilter==="all",()=>setCatFilter("all"))}
        {CATS.map(c=>pill(`${c.emoji} ${c.label}`,catFilter===c.key,()=>setCatFilter(c.key)))}
      </div>

      {/* Posts */}
      {displayed.length===0
        ?<div style={{textAlign:"center",padding:"48px 20px",color:T.textFaint}}><div style={{fontSize:40,marginBottom:10}}>📋</div><p style={{fontSize:14}}>No posts here yet.</p></div>
        :displayed.map(post=>{
          const author=ALL_USERS.find(u=>u.id===post.authorId);
          return(
            <div key={post.id} style={{background:T.surface,borderRadius:18,border:post.id===newId?`1.5px solid ${T.accentBorder}`:`1px solid ${T.border}`,boxShadow:post.id===newId?`0 4px 20px ${T.primaryGlow}`:"0 2px 8px #06403806",overflow:"hidden",animation:post.id===newId?"fadeUp 0.4s ease":"none"}}>
              <div style={{padding:"16px 18px"}}>
                <div style={{display:"flex",gap:10}}>
                  <Av user={author}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                      <span style={{fontSize:13,fontWeight:700,color:T.textDark}}>{author?.name}</span>
                      <span style={{fontSize:11,color:T.textMute,background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:20,padding:"1px 8px"}}>{author?.role}</span>
                      <CatBadge catKey={post.category}/>
                      <span style={{fontSize:11,color:T.textFaint,marginLeft:"auto"}}>{timeAgo(post.timestamp)}</span>
                    </div>
                    <h3 style={{margin:"5px 0 3px",fontSize:15,fontWeight:700,color:T.textDark}}>{post.title}</h3>
                    {post.audioURL
                      ? <AudioMsg url={post.audioURL}/>
                      : <p style={{margin:0,fontSize:13,color:T.textMid,lineHeight:1.65}}>{post.content}</p>
                    }
                  </div>
                </div>
                {post.adminReply&&(
                  <div style={{marginTop:12,marginLeft:10,background:"linear-gradient(135deg,#f0fdf7,#ecfdf5)",border:`1px solid ${T.accentBorder}`,borderLeft:`3px solid ${T.primaryLight}`,borderRadius:12,padding:"12px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                      <Av user={ADMIN_USER} size={24}/>
                      <span style={{fontSize:12,fontWeight:700,color:T.primary}}>{ADMIN_USER.name}</span>
                      <span style={{fontSize:11,color:T.textFaint,marginLeft:"auto"}}>{timeAgo(post.adminReply.timestamp)}</span>
                    </div>
                    {post.adminReply.audioURL
                      ? <AudioMsg url={post.adminReply.audioURL}/>
                      : <p style={{margin:0,fontSize:13,color:T.textMid,lineHeight:1.65}}>{post.adminReply.content}</p>
                    }
                  </div>
                )}
                {currentUser.isAdmin&&!post.adminReply&&(
                  replyOpen===post.id?(
                    <div style={{marginTop:12,marginLeft:44}}>
                      {replyMode==="audio"?(
                        <AudioRecorder
                          onSend={(url)=>{ doReplyAudio(post.id,url); setReplyOpen(null); setReplyMode("text"); }}
                          onCancel={()=>setReplyMode("text")}
                        />
                      ):(
                        <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Write your official response…" style={{width:"100%",borderRadius:10,padding:"10px 14px",border:`1.5px solid ${T.accentBorder}`,fontSize:13,outline:"none",background:"#f9fffe",minHeight:80,resize:"vertical",boxSizing:"border-box"}}/>
                      )}
                      <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                        {replyMode==="text"&&<button onClick={()=>doReply(post.id)} disabled={!replyText.trim()} style={{padding:"8px 16px",background:`linear-gradient(135deg,${T.primaryLight},${T.primary})`,color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",opacity:!replyText.trim()?0.5:1}}>Send Reply</button>}
                        {replyMode==="text"&&<button onClick={()=>setReplyMode("audio")} style={{padding:"8px 14px",background:"#fdf4ff",color:"#7e22ce",border:"1px solid #e9d5ff",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer"}}>🎙️ Audio</button>}
                        <button onClick={()=>{setReplyOpen(null);setReplyText("");setReplyMode("text");}} style={{padding:"8px 12px",background:T.accentLight,color:T.textMid,border:`1px solid ${T.border}`,borderRadius:8,fontSize:13,cursor:"pointer"}}>Cancel</button>
                      </div>
                    </div>
                  ):(
                    <div style={{marginTop:12,marginLeft:44}}>
                      <button onClick={()=>setReplyOpen(post.id)} style={{fontSize:12,fontWeight:600,color:T.primaryMid,background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:8,padding:"6px 14px",cursor:"pointer"}}>↩ Write Official Response</button>
                    </div>
                  )
                )}
              </div>
              {!post.adminReply&&<div style={{background:"#f7fdf9",borderTop:`1px solid ${T.borderLight}`,padding:"7px 18px"}}><span style={{fontSize:11,color:T.textFaint}}>⏳ Awaiting administrator response</span></div>}
            </div>
          );
        })
      }
    </div>
  );
}

// ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────
function Announcements({currentUser,announcements,setAnnouncements,addNotif}) {
  const [showForm,setShowForm]=useState(false); const [title,setTitle]=useState(""); const [body,setBody]=useState(""); const [priority,setPriority]=useState("normal"); const [pinIt,setPinIt]=useState(true); const [newId,setNewId]=useState(null);
  async function post() {
    if(!title.trim()||!body.trim()) return;
    const { data, error } = await supabase
      .from('announcements')
      .insert([{
        priority,
        title,
        body,
        pinned: pinIt,
      }])
      .select()
      .single();
    if(error) { console.error(error); return; }
    const an = {
      id: data.id, priority: data.priority,
      title: data.title, body: data.body,
      pinned: data.pinned, postedAt: "Just now", views: 0,
    };
    setAnnouncements(prev=>[an,...prev]);
    setNewId(data.id); setShowForm(false); setTitle(""); setBody(""); setPriority("normal"); setPinIt(true);
    addNotif({type:"announcement",title:`New announcement: ${title}`,body:`Mrs. Nannyondo posted: "${body.slice(0,60)}…"`});
  }
async function togglePin(id) {
    const ann=announcements.find(a=>a.id===id);
    const { error } = await supabase
      .from('announcements')
      .update({ pinned: !ann.pinned })
      .eq('id', id);
    if(error) { console.error(error); return; }
    setAnnouncements(prev=>prev.map(a=>a.id===id?{...a,pinned:!a.pinned}:a));
    addNotif({type:"pin",title:`Announcement ${ann?.pinned?"unpinned":"pinned"}`,body:`"${ann?.title}" was ${ann?.pinned?"unpinned":"pinned"}.`});
  }
  const sorted=[...announcements].sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {currentUser.isAdmin&&<button onClick={()=>setShowForm(true)} style={{padding:"12px 18px",background:`linear-gradient(135deg,${T.primaryLight},${T.primary})`,color:"#fff",border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 16px ${T.primaryGlow}`}}>+ New Announcement</button>}
      {sorted.map(an=>{const p=PMAP[an.priority]||PMAP.normal;return(
        <div key={an.id} style={{background:T.surface,border:an.pinned?`1.5px solid ${p.border}`:`1px solid ${T.border}`,borderRadius:18,overflow:"hidden",animation:an.id===newId?"fadeUp 0.4s ease":"none"}}>
          {an.pinned&&<div style={{background:p.bg,borderBottom:`1px solid ${p.border}`,padding:"6px 16px",display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:11}}>📌</span><span style={{fontSize:11,fontWeight:700,color:p.color}}>Pinned by Administrator</span></div>}
          <div style={{padding:"16px 18px"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
              <Av user={ADMIN_USER}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:4}}>
                  <span style={{fontSize:13,fontWeight:700,color:T.textDark}}>{ADMIN_USER.name}</span>
                  <PriBadge pKey={an.priority}/>
                  <span style={{fontSize:11,color:T.textFaint,marginLeft:"auto"}}>{an.postedAt}</span>
                </div>
                <h3 style={{margin:"0 0 5px",fontSize:15,fontWeight:700,color:T.textDark}}>{an.title}</h3>
                <p style={{margin:0,fontSize:13,color:T.textMid,lineHeight:1.7}}>{an.body}</p>
              </div>
            </div>
            {currentUser.isAdmin&&(
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <button onClick={()=>togglePin(an.id)} style={{fontSize:12,fontWeight:600,color:an.pinned?T.textMute:T.primaryMid,background:an.pinned?T.bg:T.accentLight,border:`1px solid ${an.pinned?T.border:T.accentBorder}`,borderRadius:8,padding:"5px 12px",cursor:"pointer"}}>{an.pinned?"📌 Unpin":"📌 Pin"}</button>
        <button onClick={async()=>{ await supabase.from('announcements').delete().eq('id',an.id); setAnnouncements(prev=>prev.filter(a=>a.id!==an.id)); }}style={{fontSize:12,fontWeight:600,color:"#e85d3a",background:"#fff1f0",border:"1px solid #fecaca",borderRadius:8,padding:"5px 12px",cursor:"pointer"}}>Delete</button>
              </div>
            )}
          </div>
        </div>
      );})}
      {showForm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
          <div style={{background:"#fff",borderRadius:22,padding:"24px 20px",maxWidth:460,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.2)",animation:"fadeUp 0.3s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><Av user={ADMIN_USER} size={40}/><div><p style={{fontSize:14,fontWeight:700,color:T.textDark,margin:0}}>{ADMIN_USER.name}</p><p style={{fontSize:11,color:T.textMute,margin:0}}>Head Administrator</p></div></div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><label style={{fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:"0.07em",display:"block",marginBottom:6}}>Priority</label>
                <div style={{display:"flex",gap:6}}>{Object.entries(PMAP).map(([k,p])=><button key={k} onClick={()=>setPriority(k)} style={{flex:1,padding:"8px 4px",borderRadius:10,cursor:"pointer",background:priority===k?p.bg:T.bg,border:priority===k?`2px solid ${p.border}`:`2px solid ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><span style={{fontSize:16}}>{p.icon}</span><span style={{fontSize:10,fontWeight:700,color:priority===k?p.color:T.textFaint}}>{p.label}</span></button>)}</div>
              </div>
              <div><label style={{fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:"0.07em",display:"block",marginBottom:6}}>Title</label><input type="text" placeholder="e.g. Staff Meeting — Friday 3:00 PM" value={title} onChange={e=>setTitle(e.target.value)} style={{width:"100%",borderRadius:12,padding:"11px 14px",fontSize:14,color:T.textDark,background:"#f9fffe",border:`1.5px solid ${T.border}`,outline:"none",boxSizing:"border-box"}}/></div>
              <div><label style={{fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:"0.07em",display:"block",marginBottom:6}}>Message</label><textarea placeholder="Write your announcement…" value={body} onChange={e=>setBody(e.target.value)} style={{width:"100%",borderRadius:12,padding:"11px 14px",fontSize:14,color:T.textDark,background:"#f9fffe",border:`1.5px solid ${T.border}`,outline:"none",minHeight:90,resize:"vertical",boxSizing:"border-box"}}/></div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 14px"}}>
                <div><p style={{fontSize:13,fontWeight:700,color:T.textDark,margin:0}}>📌 Pin this announcement</p><p style={{fontSize:11,color:T.textFaint,margin:"2px 0 0"}}>Pinned posts stay at the top for all staff</p></div>
                <button onClick={()=>setPinIt(v=>!v)} style={{width:44,height:26,borderRadius:20,border:"none",cursor:"pointer",background:pinIt?T.primary:"#d1d5db",transition:"background 0.2s",position:"relative",flexShrink:0}}><div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:pinIt?21:3,transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/></button>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,padding:13,background:T.bg,color:T.textMid,border:`1px solid ${T.border}`,borderRadius:12,fontSize:14,fontWeight:600,cursor:"pointer"}}>Cancel</button>
              <button onClick={post} disabled={!title.trim()||!body.trim()} style={{flex:2,padding:13,background:title.trim()&&body.trim()?`linear-gradient(135deg,${T.primaryLight},${T.primary})`:T.bg,color:title.trim()&&body.trim()?"#fff":T.textFaint,border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",transition:"all 0.2s"}}>📢 Post & Notify All →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CYCLE ─────────────────────────────────────────────────────────────────────
function Cycles({activeCycle,setActiveCycle,pastCycles,setPastCycles,addNotif}) {
  const [showNew,setShowNew]=useState(false); const [showClose,setShowClose]=useState(false); const [detail,setDetail]=useState(null); const [showNudge,setShowNudge]=useState(false); const [nudged,setNudged]=useState([]);
  const [cTitle,setCTitle]=useState(""); const [cType,setCType]=useState("daily"); const [openTime,setOpenTime]=useState("07:00"); const [closeTime,setCloseTime]=useState("16:00"); const [selDays,setSelDays]=useState([]); const [startDate,setStartDate]=useState(""); const [endDate,setEndDate]=useState(""); const [ff,setFf]=useState(null);
  function desc(c){if(!c)return"";if(c.type==="daily")return`Every day · ${c.openTime}–${c.closeTime}`;if(c.type==="weekday")return`Every ${(c.days||[]).join(", ")} · All day`;if(c.type==="fullweek")return"Mon–Sun · All day";if(c.type==="custom")return`${c.startDate}→${c.endDate}`;return"";}
  function canCreate(){if(!cTitle.trim())return false;if(cType==="daily")return openTime&&closeTime;if(cType==="weekday")return selDays.length>0;if(cType==="fullweek")return true;if(cType==="custom")return startDate&&endDate;return false;}
  async function create(){
    if(!canCreate())return;
    const { data, error } = await supabase
      .from('cycles')
      .insert([{
        title: cTitle, type: cType,
        open_time: openTime, close_time: closeTime,
        days: selDays, start_date: startDate, end_date: endDate,
        status: 'open',
      }])
      .select().single();
    if(error){ console.error(error); return; }
    const now = new Date(data.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
    setActiveCycle({id:data.id,title:data.title,type:data.type,openTime:data.open_time,closeTime:data.close_time,days:data.days||[],startDate:data.start_date,endDate:data.end_date,posts:0,replied:0,staff:7,status:"open",createdAt:now});
    setShowNew(false);setCTitle("");setCType("daily");setOpenTime("07:00");setCloseTime("16:00");setSelDays([]);setStartDate("");setEndDate("");
    addNotif({type:"cycle_open",title:`${cTitle} is now open`,body:"The bulletin cycle has started. You can now post your suggestions, announcements and questions."});
  }
async function end(openNew=false){
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('cycles')
      .update({ status:'closed', ended_at: now })
      .eq('id', activeCycle.id);
    if(error){ console.error(error); return; }
    const endStr = new Date(now).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
    setPastCycles(p=>[{...activeCycle,status:"closed",period:`${activeCycle.createdAt}–${endStr}`,participation:Math.round((activeCycle.posts/activeCycle.staff)*100)},...p]);
    setActiveCycle(null);setShowClose(false);
    addNotif({type:"cycle_close",title:"Bulletin cycle has ended",body:"Posting is now closed. All posts and replies remain visible."});
    if(openNew)setTimeout(()=>setShowNew(true),400);
  }
    function nudgeOne(id){setNudged(p=>[...p,id]);const m=STAFF_USERS.find(s=>s.id===id);addNotif({type:"nudge",title:`Reminder sent to ${m?.name}`,body:"\"The bulletin cycle is still open — don't forget to post!\""});}
  function nudgeAll(){STAFF_USERS.filter(s=>!nudged.includes(s.id)).forEach(s=>nudgeOne(s.id));setShowNudge(false);}
  const inp=(f)=>({width:"100%",borderRadius:12,padding:"11px 14px",fontSize:14,color:T.textDark,background:"#f9fffe",boxSizing:"border-box",outline:"none",border:ff===f?`1.5px solid ${T.primaryLight}`:`1.5px solid ${T.border}`,boxShadow:ff===f?`0 0 0 3px ${T.primaryGlow}`:"none",transition:"all 0.2s"});
  const lbl={fontSize:11,fontWeight:700,color:T.textMid,textTransform:"uppercase",letterSpacing:"0.07em",display:"block",marginBottom:7};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {activeCycle?(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h3 style={{fontSize:15,fontWeight:700,color:T.textDark,margin:0}}>Active Cycle</h3>
            <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",animation:"pulse 2s infinite"}}/><span style={{fontSize:12,fontWeight:700,color:"#16a34a"}}>LIVE</span></div>
          </div>
          <div style={{background:`linear-gradient(135deg,${T.primaryLight},${T.primary})`,borderRadius:20,padding:20,color:"#fff",boxShadow:`0 6px 28px ${T.primaryGlow}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:14}}>
              <div><p style={{fontSize:11,opacity:0.7,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",margin:"0 0 4px"}}>Current Cycle</p><h3 style={{fontSize:18,fontWeight:700,margin:0}}>{activeCycle.title}</h3><p style={{fontSize:12,opacity:0.7,margin:"3px 0 0"}}>Started {activeCycle.createdAt}</p></div>
              <div style={{background:"rgba(255,255,255,0.15)",border:"1.5px solid rgba(255,255,255,0.25)",borderRadius:12,padding:"10px 12px",textAlign:"center",minWidth:120,flexShrink:0}}><p style={{fontSize:11,opacity:0.75,margin:"0 0 4px",fontWeight:600}}>Schedule</p><p style={{fontSize:12,fontWeight:700,margin:0,lineHeight:1.4}}>{desc(activeCycle)}</p></div>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {[["Posts",activeCycle.posts],["Replied",activeCycle.replied],["Pending",activeCycle.posts-activeCycle.replied],["Staff",activeCycle.staff]].map(([l,v])=><div key={l} style={{flex:1,background:"rgba(255,255,255,0.12)",borderRadius:10,padding:"10px 6px",textAlign:"center"}}><p style={{fontSize:18,fontWeight:700,margin:0}}>{v}</p><p style={{fontSize:10,opacity:0.75,margin:"2px 0 0",fontWeight:600}}>{l}</p></div>)}
            </div>
            <div style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,opacity:0.8,fontWeight:600}}>Participation</span><span style={{fontSize:12,opacity:0.8,fontWeight:700}}>{activeCycle.posts}/{activeCycle.staff}</span></div>
              <div style={{background:"rgba(255,255,255,0.2)",borderRadius:20,height:7}}><div style={{width:`${Math.round((activeCycle.posts/activeCycle.staff)*100)}%`,height:"100%",borderRadius:20,background:"#fff",transition:"width 0.5s"}}/></div>
            </div>
            <div style={{background:"rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 12px",marginBottom:14}}><p style={{fontSize:12,opacity:0.85,margin:0,lineHeight:1.6}}>📖 Staff can always <strong>read all posts</strong>. ✉️ <strong>Admin replies never lock.</strong></p></div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowClose(true)} style={{flex:1,padding:"10px",background:"rgba(239,68,68,0.2)",color:"#fca5a5",border:"1.5px solid rgba(239,68,68,0.35)",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer"}}>🔒 End</button>
              <button onClick={()=>setShowNudge(true)} style={{flex:1,padding:"10px",background:"rgba(255,255,255,0.15)",color:"#fff",border:"1.5px solid rgba(255,255,255,0.25)",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer"}}>📣 Nudge</button>
              <button onClick={()=>end(true)} style={{flex:1,padding:"10px",background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.85)",border:"1.5px solid rgba(255,255,255,0.2)",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer"}}>↺ New</button>
            </div>
          </div>
        </div>
      ):(
        <div style={{background:T.surface,border:`2px dashed ${T.border}`,borderRadius:20,padding:"36px 20px",textAlign:"center"}}>
          <div style={{fontSize:44,marginBottom:12}}>📋</div>
          <h3 style={{fontSize:17,fontWeight:700,color:T.textDark,marginBottom:6}}>No Active Cycle</h3>
          <p style={{fontSize:13,color:T.textMute,lineHeight:1.65,marginBottom:6,maxWidth:260,margin:"0 auto 6px"}}>Staff cannot post until you start a cycle.</p>
          <p style={{fontSize:12,color:T.textFaint,marginBottom:20}}>Staff can still read all posts. You can still reply.</p>
          <button onClick={()=>setShowNew(true)} style={{background:`linear-gradient(135deg,${T.primaryLight},${T.primary})`,color:"#fff",border:"none",borderRadius:12,padding:"12px 24px",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 20px ${T.primaryGlow}`}}>+ Start New Cycle</button>
        </div>
      )}
      <div>
        <h3 style={{fontSize:15,fontWeight:700,color:T.textDark,margin:"0 0 12px"}}>Cycle History</h3>
        {pastCycles.length===0?<div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:24,textAlign:"center"}}><p style={{fontSize:13,color:T.textFaint}}>No past cycles yet.</p></div>
        :<div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden"}}>
          {pastCycles.map((c,i)=><div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px",borderBottom:i<pastCycles.length-1?`1px solid ${T.borderLight}`:"none"}}>
            <div style={{flex:1,minWidth:0}}><p style={{fontSize:13,fontWeight:700,color:T.textDark,margin:"0 0 3px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</p><p style={{fontSize:11,color:T.textFaint,margin:0}}>{c.period}</p></div>
            <div style={{textAlign:"right",flexShrink:0}}><p style={{fontSize:13,fontWeight:700,color:T.primary,margin:"0 0 2px"}}>{c.posts} posts</p><p style={{fontSize:11,color:T.textMute,margin:0}}>{c.participation}% participated</p></div>
            <button onClick={()=>setDetail(c)} style={{background:T.accentLight,color:T.primary,border:`1px solid ${T.accentBorder}`,borderRadius:8,padding:"6px 10px",fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>View</button>
          </div>)}
        </div>}
      </div>

      {showNew&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20,overflowY:"auto"}}>
        <div style={{background:"#fff",borderRadius:22,padding:"24px 20px",maxWidth:440,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.2)",animation:"fadeUp 0.3s ease"}}>
          <h3 style={{fontSize:19,fontWeight:700,color:T.textDark,marginBottom:4}}>Start New Cycle</h3>
          <p style={{fontSize:13,color:T.textMute,marginBottom:18}}>Choose how staff can post. You can end it any time.</p>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><label style={lbl}>Cycle Title</label><input type="text" placeholder="e.g. April 2025 Cycle" value={cTitle} onChange={e=>setCTitle(e.target.value)} onFocus={()=>setFf("title")} onBlur={()=>setFf(null)} style={inp("title")}/></div>
            <div><label style={lbl}>Cycle Type</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {CYCLE_TYPES.map(ct=><button key={ct.key} onClick={()=>setCType(ct.key)} style={{padding:"10px",borderRadius:12,cursor:"pointer",textAlign:"left",background:cType===ct.key?T.accentLight:T.bg,border:cType===ct.key?`2px solid ${T.primaryLight}`:`2px solid ${T.border}`,transition:"all 0.15s"}}>
                  <div style={{fontSize:18,marginBottom:3}}>{ct.icon}</div>
                  <div style={{fontSize:12,fontWeight:700,color:cType===ct.key?T.primary:T.textDark}}>{ct.label}</div>
                  <div style={{fontSize:10,color:T.textFaint,lineHeight:1.4}}>{ct.desc}</div>
                </button>)}
              </div>
            </div>
            {cType==="daily"&&<div style={{display:"flex",gap:10}}><div style={{flex:1}}><label style={lbl}>Opens At</label><input type="time" value={openTime} onChange={e=>setOpenTime(e.target.value)} onFocus={()=>setFf("open")} onBlur={()=>setFf(null)} style={inp("open")}/></div><div style={{flex:1}}><label style={lbl}>Closes At</label><input type="time" value={closeTime} onChange={e=>setCloseTime(e.target.value)} onFocus={()=>setFf("close")} onBlur={()=>setFf(null)} style={inp("close")}/></div></div>}
            {cType==="weekday"&&<div><label style={lbl}>Select Days</label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{DAYS.map((day,i)=><button key={day} onClick={()=>setSelDays(p=>p.includes(day)?p.filter(x=>x!==day):[...p,day])} style={{padding:"7px 11px",borderRadius:20,cursor:"pointer",background:selDays.includes(day)?T.primary:T.bg,color:selDays.includes(day)?"#fff":T.textMute,border:selDays.includes(day)?`1.5px solid ${T.primary}`:`1.5px solid ${T.border}`,fontSize:12,fontWeight:700}}>{SHORT_DAYS[i]}</button>)}</div></div>}
            {cType==="fullweek"&&<div style={{background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:12,padding:"12px 14px"}}><p style={{fontSize:13,color:T.textMid,fontWeight:600,margin:0}}>🗓️ Staff can post any time, Monday through Sunday.</p></div>}
            {cType==="custom"&&<div style={{display:"flex",gap:10}}><div style={{flex:1}}><label style={lbl}>Start Date</label><input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} onFocus={()=>setFf("start")} onBlur={()=>setFf(null)} style={inp("start")}/></div><div style={{flex:1}}><label style={lbl}>End Date</label><input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} onFocus={()=>setFf("end")} onBlur={()=>setFf(null)} style={inp("end")}/></div></div>}
            <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:"10px 14px"}}><p style={{fontSize:12,color:T.textMute,margin:0,lineHeight:1.7}}>📖 Staff always read all posts. ✉️ Admin replies never lock.</p></div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:16}}>
            <button onClick={()=>setShowNew(false)} style={{flex:1,padding:13,background:T.bg,color:T.textMid,border:`1px solid ${T.border}`,borderRadius:12,fontSize:14,fontWeight:600,cursor:"pointer"}}>Cancel</button>
            <button onClick={create} disabled={!canCreate()} style={{flex:1,padding:13,background:canCreate()?`linear-gradient(135deg,${T.primaryLight},${T.primary})`:T.bg,color:canCreate()?"#fff":T.textFaint,border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:canCreate()?"pointer":"not-allowed",transition:"all 0.2s"}}>Start Cycle →</button>
          </div>
        </div>
      </div>}

      {showClose&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
        <div style={{background:"#fff",borderRadius:22,padding:"24px 20px",maxWidth:360,width:"100%",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.2)",animation:"fadeUp 0.3s ease"}}>
          <div style={{fontSize:44,marginBottom:12}}>🔒</div>
          <h3 style={{fontSize:19,fontWeight:700,color:T.textDark,marginBottom:8}}>End This Cycle?</h3>
          <p style={{fontSize:14,color:T.textMute,lineHeight:1.65,marginBottom:12}}>Staff will no longer be able to post. All posts stay visible.</p>
          <div style={{background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:12,padding:"11px 14px",marginBottom:18}}><p style={{fontSize:13,color:T.textMid,fontWeight:600,margin:0}}>✉️ You can still reply to any post after the cycle ends.</p></div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setShowClose(false)} style={{flex:1,padding:13,background:T.bg,color:T.textMid,border:`1px solid ${T.border}`,borderRadius:12,fontSize:14,fontWeight:600,cursor:"pointer"}}>Keep Open</button>
            <button onClick={()=>end(false)} style={{flex:1,padding:13,background:"#e85d3a",color:"#fff",border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>End Cycle</button>
          </div>
        </div>
      </div>}

      {showNudge&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
        <div style={{background:"#fff",borderRadius:22,padding:"24px 20px",maxWidth:400,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.2)",animation:"fadeUp 0.3s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><h3 style={{fontSize:18,fontWeight:700,color:T.textDark,margin:0}}>Nudge Staff</h3><span style={{fontSize:12,color:T.textFaint,background:T.bg,border:`1px solid ${T.border}`,borderRadius:20,padding:"3px 10px"}}>{STAFF_USERS.filter(s=>!nudged.includes(s.id)).length} not nudged</span></div>
          <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:260,overflowY:"auto",marginBottom:14}}>
            {STAFF_USERS.map(s=><div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:T.bg,border:`1px solid ${T.border}`,borderRadius:12}}>
              <Av user={s} size={32}/><div style={{flex:1}}><p style={{fontSize:13,fontWeight:600,color:T.textDark,margin:0}}>{s.name}</p><p style={{fontSize:11,color:T.textFaint,margin:"1px 0 0"}}>{s.role}</p></div>
              {nudged.includes(s.id)?<span style={{fontSize:11,color:"#92400e",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:20,padding:"3px 10px",fontWeight:700}}>✓ Nudged</span>:<button onClick={()=>nudgeOne(s.id)} style={{fontSize:12,fontWeight:700,color:T.primaryMid,background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:8,padding:"5px 12px",cursor:"pointer"}}>Nudge</button>}
            </div>)}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setShowNudge(false)} style={{flex:1,padding:12,background:T.bg,color:T.textMid,border:`1px solid ${T.border}`,borderRadius:12,fontSize:14,fontWeight:600,cursor:"pointer"}}>Close</button>
            <button onClick={nudgeAll} style={{flex:1,padding:12,background:`linear-gradient(135deg,${T.primaryLight},${T.primary})`,color:"#fff",border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>📣 Nudge All</button>
          </div>
        </div>
      </div>}

      {detail&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
        <div style={{background:"#fff",borderRadius:22,padding:"24px 20px",maxWidth:380,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.2)",animation:"fadeUp 0.3s ease"}}>
          <h3 style={{fontSize:17,fontWeight:700,color:T.textDark,marginBottom:14}}>{detail.title}</h3>
          {[["Period",detail.period],["Total Posts",`${detail.posts} posts`],["All Replied",detail.replied===detail.posts?"✅ Yes":`⚠️ ${detail.posts-detail.replied} unreplied`],["Staff Count",`${detail.staff} members`],["Participation",`${detail.participation}%`]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${T.borderLight}`}}><span style={{fontSize:13,color:T.textMute}}>{l}</span><span style={{fontSize:13,fontWeight:700,color:T.textDark}}>{v}</span></div>)}
          <button onClick={()=>setDetail(null)} style={{width:"100%",marginTop:14,padding:12,background:T.bg,color:T.textMid,border:`1px solid ${T.border}`,borderRadius:12,fontSize:14,fontWeight:600,cursor:"pointer"}}>Close</button>
        </div>
      </div>}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({posts,onReadReceipts}) {
  const [removeConfirm,setRemoveConfirm]=useState(null); const [staffList,setStaffList]=useState(STAFF_USERS);
  const inviteLink="bulletinboard.app/join/dez-junior-x7k2p";
  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[{label:"Total Staff",val:staffList.length,color:T.primary},{label:"Posts",val:posts.length,color:T.primaryLight},{label:"Pending",val:posts.filter(p=>!p.adminReply).length,color:"#e85d3a"},{label:"Replied",val:posts.filter(p=>p.adminReply).length,color:"#16a34a"}].map(s=><div key={s.label} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px",textAlign:"center"}}><p style={{fontSize:24,fontWeight:700,color:s.color,margin:0}}>{s.val}</p><p style={{fontSize:12,color:T.textMute,margin:"4px 0 0",fontWeight:600}}>{s.label}</p></div>)}
      </div>
      {/* Invite link */}
      <div style={{background:`linear-gradient(135deg,${T.primaryLight},${T.primary})`,borderRadius:18,padding:"18px 20px",color:"#fff",boxShadow:`0 4px 24px ${T.primaryGlow}`}}>
        <p style={{fontSize:11,opacity:0.7,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",margin:"0 0 5px"}}>Staff Invite Link</p>
        <p style={{fontSize:13,fontWeight:600,opacity:0.9,marginBottom:10,wordBreak:"break-all"}}>{inviteLink}</p>
        <button style={{background:"rgba(255,255,255,0.2)",border:"1.5px solid rgba(255,255,255,0.3)",borderRadius:10,padding:"8px 16px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>📋 Copy Link</button>
      </div>
      {/* Read Receipts shortcut */}
      <button onClick={onReadReceipts} style={{display:"flex",alignItems:"center",gap:12,padding:"16px 18px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,cursor:"pointer",textAlign:"left",boxShadow:"0 2px 8px #06403806"}}>
        <div style={{width:42,height:42,borderRadius:12,background:T.accentLight,border:`1px solid ${T.accentBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>👁️</div>
        <div style={{flex:1}}><p style={{fontSize:14,fontWeight:700,color:T.textDark,margin:0}}>Read Receipts</p><p style={{fontSize:12,color:T.textMute,margin:"2px 0 0"}}>See who has read your replies & announcements</p></div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textFaint} strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>
      {/* Staff roster */}
      <div>
        <p style={{fontSize:12,fontWeight:700,color:T.textFaint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Staff Roster</p>
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden"}}>
          {staffList.map((s,i)=>{const posted=posts.some(p=>p.authorId===s.id);return(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderBottom:i<staffList.length-1?`1px solid ${T.borderLight}`:"none"}}>
              <Av user={s} size={34}/><div style={{flex:1,minWidth:0}}><p style={{fontSize:13,fontWeight:600,color:T.textDark,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</p><p style={{fontSize:11,color:T.textFaint,margin:"1px 0 0"}}>{s.role}</p></div>
              <span style={{width:8,height:8,borderRadius:"50%",background:posted?"#22c55e":T.borderLight,flexShrink:0}} title={posted?"Posted":"Not posted"}/>
              <button onClick={()=>setRemoveConfirm(s.id)} style={{fontSize:11,fontWeight:700,color:"#e85d3a",background:"#fff1f0",border:"1px solid #fecaca",borderRadius:8,padding:"4px 10px",cursor:"pointer",flexShrink:0}}>Remove</button>
            </div>
          );})}
        </div>
      </div>
      {removeConfirm&&(()=>{const m=staffList.find(s=>s.id===removeConfirm);return(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:24}}>
          <div style={{background:"#fff",borderRadius:20,padding:"26px 22px",maxWidth:360,width:"100%",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.2)",animation:"fadeUp 0.3s ease"}}>
            <div style={{fontSize:40,marginBottom:12}}>🗑️</div>
            <h3 style={{fontSize:18,fontWeight:700,color:T.textDark,marginBottom:8}}>Remove Staff Member?</h3>
            <p style={{fontSize:14,color:T.textMute,lineHeight:1.65,marginBottom:22}}><strong style={{color:T.textDark}}>{m?.name}</strong> will lose access to the bulletin board.</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setRemoveConfirm(null)} style={{flex:1,padding:"12px",background:T.bg,color:T.textMid,border:`1px solid ${T.border}`,borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer"}}>Cancel</button>
              <button onClick={()=>{setStaffList(p=>p.filter(s=>s.id!==removeConfirm));setRemoveConfirm(null);}} style={{flex:1,padding:"12px",background:"#e85d3a",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer"}}>Remove</button>
            </div>
          </div>
        </div>
      );})()}
    </div>
  );
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
function Notifs({notifs,setNotifs}) {
  const NTYPE={reply:{icon:"✉️",bg:"#f0fdf4",color:"#166534",border:"#bbf7d0",label:"Reply"},cycle_open:{icon:"📋",bg:"#eff6ff",color:"#1e40af",border:"#bfdbfe",label:"Cycle"},cycle_close:{icon:"🔒",bg:"#f8fafc",color:"#475569",border:"#e2e8f0",label:"Cycle"},announcement:{icon:"📢",bg:"#fefce8",color:"#854d0e",border:"#fde68a",label:"Announcement"},pin:{icon:"📌",bg:"#fffbeb",color:"#92400e",border:"#fde68a",label:"Pinned"},nudge:{icon:"👋",bg:"#fdf4ff",color:"#7e22ce",border:"#e9d5ff",label:"Reminder"},new_post:{icon:"📝",bg:"#f0faf5",color:"#065f46",border:"#d1e7dd",label:"New Post"}};
  const unread=notifs.filter(n=>!n.read).length;
  const NotifCard=({n,isUnread})=>{const nt=NTYPE[n.type]||NTYPE.new_post;return(
    <div onClick={()=>isUnread&&setNotifs(p=>p.map(x=>x.id===n.id?{...x,read:true}:x))} style={{background:isUnread?"#f7fefb":T.surface,border:`1px solid ${isUnread?T.accentBorder:T.border}`,borderLeft:`4px solid ${isUnread?T.primaryLight:T.border}`,borderRadius:14,padding:"13px 14px",cursor:isUnread?"pointer":"default",position:"relative",animation:isUnread?"fadeUp 0.3s ease":"none"}}>
      <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
        <div style={{width:36,height:36,borderRadius:10,background:nt.bg,border:`1px solid ${nt.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{nt.icon}</div>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:3}}>
            <span style={{background:nt.bg,color:nt.color,border:`1px solid ${nt.border}`,borderRadius:20,padding:"1px 8px",fontSize:10,fontWeight:700}}>{nt.label}</span>
            {isUnread&&<span style={{width:7,height:7,borderRadius:"50%",background:T.primaryLight,display:"inline-block"}}/>}
            <span style={{fontSize:11,color:T.textFaint,marginLeft:"auto"}}>{n.time||"Just now"}</span>
          </div>
          <p style={{fontSize:13,fontWeight:700,color:T.textDark,margin:"0 0 3px"}}>{n.title}</p>
          <p style={{fontSize:12,color:T.textMute,margin:0,lineHeight:1.55}}>{n.body}</p>
        </div>
      </div>
      <button onClick={e=>{e.stopPropagation();setNotifs(p=>p.filter(x=>x.id!==n.id));}} style={{position:"absolute",top:10,right:10,background:"none",border:"none",cursor:"pointer",color:T.textFaint,fontSize:14,padding:2}}>✕</button>
    </div>
  );};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><h3 style={{fontSize:17,fontWeight:700,color:T.textDark,margin:0}}>Notifications</h3>{unread>0&&<span style={{background:T.primaryLight,color:"#fff",borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:700}}>{unread} new</span>}</div>
        <div style={{display:"flex",gap:8}}>
          {unread>0&&<button onClick={()=>setNotifs(p=>p.map(n=>({...n,read:true})))} style={{fontSize:12,fontWeight:700,color:T.primaryMid,background:T.accentLight,border:`1px solid ${T.accentBorder}`,borderRadius:8,padding:"6px 12px",cursor:"pointer"}}>✓ All read</button>}
          {notifs.length>0&&<button onClick={()=>setNotifs([])} style={{fontSize:12,fontWeight:700,color:"#e85d3a",background:"#fff1f0",border:"1px solid #fecaca",borderRadius:8,padding:"6px 12px",cursor:"pointer"}}>Clear</button>}
        </div>
      </div>
      {notifs.length===0?<div style={{textAlign:"center",padding:"56px 20px"}}><div style={{fontSize:48,marginBottom:12}}>🔔</div><p style={{fontSize:15,fontWeight:700,color:T.textDark,marginBottom:6}}>All caught up!</p><p style={{fontSize:13,color:T.textFaint}}>No notifications.</p></div>:<>
        {notifs.filter(n=>!n.read).length>0&&<><p style={{fontSize:11,fontWeight:700,color:T.textFaint,textTransform:"uppercase",letterSpacing:"0.08em",margin:"4px 0"}}>New</p>{notifs.filter(n=>!n.read).map(n=><NotifCard key={n.id} n={n} isUnread/>)}</>}
        {notifs.filter(n=>n.read).length>0&&<><p style={{fontSize:11,fontWeight:700,color:T.textFaint,textTransform:"uppercase",letterSpacing:"0.08em",margin:"8px 0 4px"}}>Earlier</p>{notifs.filter(n=>n.read).map(n=><NotifCard key={n.id} n={n} isUnread={false}/>)}</>}
      </>}
    </div>
  );
}

// ── PROFILE ───────────────────────────────────────────────────────────────────
function Profile({currentUser,posts,onLogout,onSchoolSetup}) {
  const myPosts=posts.filter(p=>p.authorId===currentUser.id);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{background:`linear-gradient(135deg,${T.primaryLight},${T.primary})`,borderRadius:20,padding:"26px 22px",display:"flex",flexDirection:"column",alignItems:"center",gap:12,color:"#fff",boxShadow:`0 6px 28px ${T.primaryGlow}`}}>
        <Av user={currentUser} size={72}/>
        <div style={{textAlign:"center"}}><h2 style={{fontSize:20,fontWeight:700,margin:0}}>{currentUser.name}</h2><p style={{fontSize:14,opacity:0.8,margin:"4px 0 0"}}>{currentUser.role}</p><p style={{fontSize:12,opacity:0.6,margin:"2px 0 0"}}>Dez Junior School</p></div>
        {currentUser.isAdmin&&<span style={{background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:20,padding:"4px 14px",fontSize:12,fontWeight:700}}>👑 Head Administrator</span>}
      </div>
      {!currentUser.isAdmin&&(
        <div style={{display:"flex",gap:10}}>
          {[{label:"Submitted",val:myPosts.length,color:T.primary},{label:"Replied",val:myPosts.filter(p=>p.adminReply).length,color:"#16a34a"},{label:"Pending",val:myPosts.filter(p=>!p.adminReply).length,color:"#e85d3a"}].map(s=><div key={s.label} style={{flex:1,background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 10px",textAlign:"center"}}><p style={{fontSize:22,fontWeight:700,color:s.color,margin:0}}>{s.val}</p><p style={{fontSize:11,color:T.textMute,margin:"4px 0 0",fontWeight:600,lineHeight:1.3}}>{s.label}</p></div>)}
        </div>
      )}
      {!currentUser.isAdmin&&myPosts.length>0&&(
        <div><p style={{fontSize:12,fontWeight:700,color:T.textFaint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>My Posts</p>
          {myPosts.map(p=><div key={p.id} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"13px 16px",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}><CatBadge catKey={p.category}/><span style={{fontSize:11,color:p.adminReply?"#16a34a":"#e85d3a",fontWeight:700}}>{p.adminReply?"✓ Replied":"⏳ Pending"}</span><span style={{fontSize:11,color:T.textFaint,marginLeft:"auto"}}>{timeAgo(p.timestamp)}</span></div>
            <p style={{fontSize:13,fontWeight:700,color:T.textDark,margin:0}}>{p.title}</p>
            {p.adminReply&&<p style={{fontSize:12,color:T.textMute,margin:"5px 0 0",lineHeight:1.55,fontStyle:"italic"}}>"{p.adminReply.content.slice(0,80)}…"</p>}
          </div>)}
        </div>
      )}
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden"}}>
        {currentUser.isAdmin&&<button onClick={onSchoolSetup} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"14px 18px",borderBottom:`1px solid ${T.borderLight}`,cursor:"pointer",background:"none",border:"none",borderBottom:`1px solid ${T.borderLight}`,textAlign:"left"}}>
          <span style={{fontSize:20}}>🏫</span><span style={{fontSize:14,fontWeight:600,color:T.textDark,flex:1}}>School Settings</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textFaint} strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>}
        {[{icon:"🔔",label:"Notification Preferences"},{icon:"🔒",label:"Privacy & Security"},{icon:"📱",label:"App Settings"}].map((item,i)=><div key={item.label} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",borderBottom:i<2?`1px solid ${T.borderLight}`:"none",cursor:"pointer"}}><span style={{fontSize:20}}>{item.icon}</span><span style={{fontSize:14,fontWeight:600,color:T.textDark,flex:1}}>{item.label}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textFaint} strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></div>)}
      </div>
      <button onClick={onLogout} style={{padding:"14px",background:"#fff1f0",color:"#e85d3a",border:"1px solid #fecaca",borderRadius:14,fontSize:14,fontWeight:700,cursor:"pointer"}}>Sign Out</button>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [appState,      setAppState]      = useState("splash");
  const [currentUser,   setCurrentUser]   = useState(null);
  const [activeTab,     setActiveTab]     = useState("board");
  const [subScreen,     setSubScreen]     = useState(null); // "read_receipts" | "school_setup"
  const [posts, setPosts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifs,        setNotifs]        = useState(INIT_NOTIFS);
  const [activeCycle, setActiveCycle] = useState(null);
  const [pastCycles, setPastCycles] = useState([]);
  const [school,        setSchool]        = useState(SCHOOL_DEFAULT);
  const [toast,         setToast]         = useState(null);

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(null),3000); }
  function addNotif(n) { setNotifs(prev=>[{id:`n${Date.now()}`,...n,read:false,time:"Just now"},...prev]); }
useEffect(() => {
    async function loadPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if(error) { console.error(error); return; }
      setPosts(data.map(p => ({
        id: p.id,
        authorId: p.author_id,
        category: p.category,
        title: p.title,
        content: p.content,
        audioURL: p.audio_url,
        timestamp: new Date(p.created_at),
        adminReply: p.admin_reply_content ? {
          content: p.admin_reply_content,
          audioURL: p.admin_reply_audio,
          timestamp: new Date(p.admin_reply_at)
        } : null
      })));
    }
    loadPosts();
  }, []);
useEffect(() => {
    async function loadAnnouncements() {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('posted_at', { ascending: false });
      if(error) { console.error(error); return; }
      setAnnouncements(data.map(a => ({
        id: a.id,
        priority: a.priority,
        title: a.title,
        body: a.body,
        pinned: a.pinned,
        postedAt: new Date(a.posted_at).toLocaleDateString(),
        views: 0,
      })));
    }
    loadAnnouncements();
  }, []);
useEffect(() => {
    async function loadCycles() {
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .order('created_at', { ascending: false });
      if(error) { console.error(error); return; }
      const active = data.find(c => c.status === 'open');
      const past   = data.filter(c => c.status === 'closed');
      if(active) {
        setActiveCycle({
          id: active.id,
          title: active.title,
          type: active.type,
          openTime: active.open_time || "07:00",
          closeTime: active.close_time || "16:00",
          days: active.days || [],
          startDate: active.start_date || "",
          endDate: active.end_date || "",
          status: active.status,
          posts: 0, replied: 0, staff: 7,
          createdAt: new Date(active.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}),
        });
      } else {
        setActiveCycle(null);
      }
      setPastCycles(past.map(c => ({
        id: c.id,
        title: c.title,
        type: c.type,
        period: `${new Date(c.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})} – ${c.ended_at ? new Date(c.ended_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "ongoing"}`,
        posts: 0, replied: 0, staff: 7, participation: 0,
      })));
    }
    loadCycles();
  }, []);
  function handleLogin(user) { setCurrentUser(user); setAppState("app"); setActiveTab(user.isAdmin?"dashboard":"board"); }
  function handleLogout() { setCurrentUser(null); setAppState("splash"); setActiveTab("board"); setSubScreen(null); }

  const unreadCount = notifs.filter(n=>!n.read).length;
  const isAdmin = currentUser?.isAdmin;

  const STAFF_TABS = [
    { key:"board",         icon:"📋", label:"Board"   },
    { key:"announcements", icon:"📢", label:"Updates" },
    { key:"notifs",        icon:"🔔", label:"Alerts",  badge:unreadCount },
    { key:"profile",       icon:"👤", label:"Profile" },
  ];
  const ADMIN_TABS = [
    { key:"board",         icon:"📋", label:"Board"     },
    { key:"dashboard",     icon:"📊", label:"Dashboard" },
    { key:"cycle",         icon:"🔄", label:"Cycles"    },
    { key:"announcements", icon:"📢", label:"Post"      },
    { key:"notifs",        icon:"🔔", label:"Alerts",    badge:unreadCount },
    { key:"profile",       icon:"👤", label:"Profile"   },
  ];
  const tabs = isAdmin ? ADMIN_TABS : STAFF_TABS;

  const PAGE_TITLES = {
    board:"Bulletin Board", dashboard:"Admin Dashboard", cycle:"Cycle Management",
    announcements: isAdmin?"Post Announcement":"Announcements",
    notifs:"Notifications", profile:"My Profile",
  };

  // ── Splash ──
  if(appState==="splash") return <>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body,textarea,input,button{font-family:'Lora',serif!important;}@keyframes scaleIn{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}@keyframes floatUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:0.12}50%{opacity:0.22}}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes slideIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}`}</style>
    <Splash onDone={()=>setAppState("login")}/>
  </>;

  // ── Login ──
  if(appState==="login") return <>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body,textarea,input,button{font-family:'Lora',serif!important;}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <Login onLogin={handleLogin}/>
  </>;

  // ── App ──
  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",maxWidth:680,margin:"0 auto"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body,textarea,input,button{font-family:'Lora',serif!important;}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes slideIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}@keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#f0faf5;}::-webkit-scrollbar-thumb{background:#6ee7b7;border-radius:4px;}`}</style>
      <Toast msg={toast}/>

      {/* Header */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,zIndex:50}}>
        <div style={{padding:"0 16px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {subScreen?(
              <button onClick={()=>setSubScreen(null)} style={{background:"none",border:"none",cursor:"pointer",color:T.primaryMid,fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:4}}>← Back</button>
            ):(
              <><SchoolMark school={school} size={32}/>
              <div><div style={{fontSize:13,fontWeight:700,color:T.textDark,lineHeight:1.2}}>{school.name}</div><div style={{fontSize:10,color:T.textFaint}}>Staff Bulletin Board</div></div></>
            )}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>{setSubScreen(null);setActiveTab("notifs");}} style={{position:"relative",background:"none",border:"none",cursor:"pointer",padding:6,color:T.textMute}}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              {unreadCount>0&&<span style={{position:"absolute",top:2,right:2,width:16,height:16,borderRadius:"50%",background:"#e85d3a",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{unreadCount}</span>}
            </button>
            <Av user={currentUser} size={30}/>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div style={{flex:1,padding:"18px 16px 88px",overflowY:"auto"}}>
        {/* Sub screen title */}
        {subScreen&&<h2 style={{fontSize:18,fontWeight:700,color:T.textDark,marginBottom:16}}>
          {subScreen==="read_receipts"&&"Read Receipts"}
          {subScreen==="school_setup"&&"School Settings"}
        </h2>}
        {/* Main page title */}
        {!subScreen&&<h2 style={{fontSize:17,fontWeight:700,color:T.textDark,marginBottom:16}}>{PAGE_TITLES[activeTab]}</h2>}

        {/* Sub screens */}
        {subScreen==="read_receipts"&&<ReadReceipts posts={posts} announcements={announcements} onBack={()=>setSubScreen(null)}/>}
        {subScreen==="school_setup"&&<SchoolSetup school={school} onSave={(s)=>{setSchool(s);setSubScreen(null);showToast("✅ School settings saved!");}} onBack={()=>setSubScreen(null)}/>}

        {/* Main tabs */}
        {!subScreen&&<>
          {activeTab==="board"&&<Board currentUser={currentUser} posts={posts} setPosts={setPosts} announcements={announcements} activeCycle={activeCycle} addNotif={addNotif}/>}
          {activeTab==="dashboard"&&isAdmin&&<Dashboard posts={posts} onReadReceipts={()=>setSubScreen("read_receipts")}/>}
          {activeTab==="cycle"&&isAdmin&&<Cycles activeCycle={activeCycle} setActiveCycle={setActiveCycle} pastCycles={pastCycles} setPastCycles={setPastCycles} addNotif={addNotif}/>}
          {activeTab==="announcements"&&<Announcements currentUser={currentUser} announcements={announcements} setAnnouncements={setAnnouncements} addNotif={addNotif}/>}
          {activeTab==="notifs"&&<Notifs notifs={notifs} setNotifs={setNotifs}/>}
          {activeTab==="profile"&&<Profile currentUser={currentUser} posts={posts} onLogout={handleLogout} onSchoolSetup={()=>setSubScreen("school_setup")}/>}
        </>}
      </div>

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:680,background:T.surface,borderTop:`1px solid ${T.border}`,display:"flex",zIndex:50,boxShadow:"0 -4px 20px #06403810"}}>
        {tabs.map(tab=>(
          <button key={tab.key} onClick={()=>{setActiveTab(tab.key);setSubScreen(null);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"9px 4px 11px",background:"none",border:"none",cursor:"pointer",position:"relative",transition:"all 0.15s"}}>
            <div style={{position:"relative",marginBottom:2}}>
              <span style={{fontSize:isAdmin?18:20,filter:activeTab===tab.key&&!subScreen?"none":"grayscale(0.3)",opacity:activeTab===tab.key&&!subScreen?1:0.45}}>{tab.icon}</span>
              {tab.badge>0&&<span style={{position:"absolute",top:-4,right:-6,background:"#e85d3a",color:"#fff",borderRadius:"50%",width:15,height:15,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{tab.badge}</span>}
            </div>
            <span style={{fontSize:isAdmin?9:10,fontWeight:700,color:activeTab===tab.key&&!subScreen?T.primary:T.textFaint,letterSpacing:"0.02em"}}>{tab.label}</span>
            {activeTab===tab.key&&!subScreen&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:24,height:3,borderRadius:"0 0 4px 4px",background:T.primary}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}
