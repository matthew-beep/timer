'use client'
import Timer from '@/components/Timer';
import Header from '@/components/Header';
import { useTimer } from "@/store/useTimer";
export default function Home() {
  const bgColor = '#1e293b';


  function changeColor() {
    console.log("clicked")
    document.documentElement.style.setProperty('--background', bgColor);

  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black border-2">
      <main className="w-full">
        <Header />
        <input
          type="color"
          className="w-10 h-10 cursor-pointer"
        />
        <div id="app" 
          className="min-h-screen bg-[var(--background)] text-[var(--text-color)]" 
          onClick={changeColor}>
          <div className="w-full h-96 flex flex-col items-center justify-center"> 
          <h1 className="text-6xl">Pomodoro Puppy</h1>
          <Timer />
        </div>
        </div>
      </main>
    </div>
  );
}
