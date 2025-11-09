'use client'
import Timer from '../components/Timer';
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
        <header className="w-full">Settings</header>
        <input
          type="color"
          className="w-10 h-10 cursor-pointer"
        />

        <div className="w-full h-96 bg-test"> 
          <h1 className="text-6xl">Pomodoro Puppy</h1>
          <Timer />
        </div>

        <div id="app" 
          className="min-h-screen bg-[var(--background)] text-[var(--text-color)]" 
          onClick={changeColor}>
          test2
        </div>
      </main>
    </div>
  );
}
