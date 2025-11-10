'use client'
import Timer from '@/components/Timer';
import Header from '@/components/Header';
import { useEffect, useState } from 'react';
export default function Home() {
  const [bgColor, setBgColor] = useState<string>("#1e293b");

  useEffect(() => {
    document.documentElement.style.setProperty('--background', bgColor);
    document.documentElement.style.setProperty('--text-color', '#ffffff');
  }, []);


  function changeColor() {
    console.log("clicked")
    document.documentElement.style.setProperty('--background', bgColor);

  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans border-2">
      <main className="w-full">
        <Header />
        <input
          type="color"
          className="w-10 h-10 cursor-pointer"
            onChange={(e) => {
            const newColor = e.target.value;   // <-- hex color
            console.log("New color:", newColor);
            setBgColor(newColor);
            // Fire your function + update CSS variable
            document.documentElement.style.setProperty('--background', newColor);
          }}
          value={bgColor}
        />
        <div id="app" 
          className="min-h-screen bg-[var(--background)] text-[var(--text-color)]" >
          <div className="w-full h-96 flex flex-col items-center justify-center"> 
          <h1 className="text-6xl">Pomodoro Puppy</h1>
          <Timer />
        </div>
        </div>
      </main>
    </div>
  );
}
