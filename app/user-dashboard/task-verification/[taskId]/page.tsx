"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, CheckCircle2, Loader2, Info } from "lucide-react";

// Navigation Imports
import UserSidebar from "@/components/user-dashboard/UserSidebar";
import UserHeader from "@/components/user-dashboard/UserHeader";

export default function TaskVerificationPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const searchParams = useSearchParams();
  const taskTitle = searchParams.get("title") || "Task";
  const reward = searchParams.get("reward") || "0";

  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const onChooseFile = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ taskId, taskTitle, reward, description, fileName: file?.name });
    alert("Proof submitted successfully!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* 1. SIDEBAR */}
      <UserSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 2. HEADER */}
        <UserHeader />

        {/* 3. MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            
            {/* Breadcrumb/Navigation Info */}
            <header className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Submit Proof
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                   {taskTitle}
                </span>
                <span className="text-muted-foreground font-mono">ID: {String(taskId)}</span>
                <span className="text-green-500 font-bold">+{reward} TP Reward</span>
              </div>
            </header>

            {/* Submission Form */}
            <form 
              onSubmit={onSubmit} 
              className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8"
            >
              {/* Description Field */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Proof Details & Context
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Paste links, transaction IDs, or describe how you completed the task..."
                  className="w-full h-40 resize-none bg-muted/30 border border-border rounded-2xl p-4 text-foreground placeholder:text-muted-foreground focus:ring-2 ring-primary/20 outline-none transition-all"
                />
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/20 p-3 rounded-xl border border-border/50">
                    <Info className="w-4 h-4 text-primary shrink-0" />
                    <p>Make sure to provide clear evidence. Incorrect or fake submissions may lead to account suspension.</p>
                </div>
              </div>

              {/* File Upload Field */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Screenshot / Image Proof
                </label>
                <div
                  className={`relative group rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-8 cursor-pointer ${
                    file 
                    ? "border-green-500/50 bg-green-500/5" 
                    : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
                  }`}
                  onClick={onChooseFile}
                >
                  {file ? (
                    <div className="text-center space-y-2">
                      <div className="bg-green-500 text-white p-2 rounded-full inline-block">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-sm text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">Click to replace image</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <div className="bg-primary/10 text-primary p-3 rounded-2xl inline-block group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Click to upload screenshot</p>
                        <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-purple-600 text-white font-black text-lg shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
              >
                Submit for Verification
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
                Average review time: <span className="text-foreground font-medium">12-24 hours</span>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}




// "use client";

// import { useState, useRef } from "react";
// import { useParams, useSearchParams } from "next/navigation";
// import { motion } from "framer-motion";

// export default function TaskVerificationPage() {
//   const { taskId } = useParams<{ taskId: string }>();
//   const searchParams = useSearchParams();
//   const taskTitle = searchParams.get("title") || "Task";
//   const reward = searchParams.get("reward") || "0";

//   const [description, setDescription] = useState("");
//   const [file, setFile] = useState<File | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const onChooseFile = () => fileInputRef.current?.click();

//   const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0] ?? null;
//     setFile(f);
//   };

//   const onSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // For now, log to console as requested
//     // eslint-disable-next-line no-console
//     console.log({ taskId, taskTitle, reward, description, fileName: file?.name });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
//       <div className="max-w-3xl mx-auto px-4 py-10">
//         <motion.div
//           initial={{ opacity: 0, y: 16 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4, ease: "easeOut" }}
//           className="space-y-6"
//         >
//           <header>
//             <h1 className="text-2xl sm:text-3xl font-bold">
//               Submit Proof for {taskTitle}
//             </h1>
//             <p className="text-gray-300 mt-1">Task ID: {String(taskId)}</p>
//             <p className="text-green-400 mt-1">Reward: {reward} TP</p>
//           </header>

//           <form onSubmit={onSubmit} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-2">
//                 Proof Description
//               </label>
//               <textarea
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 placeholder="Describe your proof, add links or context..."
//                 className="w-full h-32 resize-y bg-gray-950 border border-gray-800 rounded-lg p-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-2">
//                 Image Proof (optional)
//               </label>
//               <div
//                 className="rounded-lg border border-dashed border-gray-700 bg-gray-950 p-5 text-center cursor-pointer hover:border-purple-600 transition"
//                 onClick={onChooseFile}
//               >
//                 {file ? (
//                   <div>
//                     <div className="text-sm text-gray-300">{file.name}</div>
//                     <div className="text-xs text-gray-500 mt-1">Click to change file</div>
//                   </div>
//                 ) : (
//                   <div>
//                     <div className="text-gray-400">Click to upload an image (PNG, JPG)</div>
//                   </div>
//                 )}
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/png,image/jpeg,image/jpg"
//                   className="hidden"
//                   onChange={onFileChange}
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-purple-600 text-white font-semibold shadow transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-gray-900"
//             >
//               Submit Proof
//             </button>
//           </form>
//         </motion.div>
//       </div>
//     </div>
//   );
// }
