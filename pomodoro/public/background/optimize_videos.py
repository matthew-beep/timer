import subprocess
import os

def optimize_videos():
    # 1. Setup Folders
    os.makedirs("optimized", exist_ok=True)
    os.makedirs("posters", exist_ok=True)

    videos = [f for f in os.listdir('.') if f.lower().endswith(('.mp4', '.mov', '.webm'))]
    
    if not videos:
        print("📭 No new videos found in this folder!")
        return

    for filename in videos:
        name_only = os.path.splitext(filename)[0]
        output_video = f'optimized/{name_only}.mp4'
        output_poster = f'posters/{name_only}_first_frame.jpg'
        
        # --- THE SKIP CHECK ---
        # If both files already exist, we skip the whole loop for this video
        if os.path.exists(output_video) and os.path.exists(output_poster):
            print(f"⏩ Skipping: {filename} (Already optimized)")
            continue

        print(f"\n⚡ Processing: {filename}")

        # --- COMMAND 1: Compress Video ---
        video_cmd = [
            'ffmpeg', '-y', '-i', filename,
            '-vcodec', 'libx264', '-crf', '28', 
            '-preset', 'slow', '-an', output_video
        ]

        # --- COMMAND 2: Grab First Frame ---
        poster_cmd = [
            'ffmpeg', '-y', '-i', filename,
            '-ss', '0', '-vframes', '1', 
            '-q:v', '2', output_poster
        ]

        try:
            # Only run if output_video is missing
            if not os.path.exists(output_video):
                subprocess.run(video_cmd, check=True, capture_output=True)
            
            # Only run if output_poster is missing
            if not os.path.exists(output_poster):
                subprocess.run(poster_cmd, check=True, capture_output=True)
            
            # Show stats
            initial_size = os.path.getsize(filename) / (1024 * 1024)
            final_size = os.path.getsize(output_video) / (1024 * 1024)
            savings = (1 - (final_size / initial_size)) * 100
            
            print(f"✅ Success! ({savings:.1f}% smaller)")
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Error with {filename}: {e}")
        except Exception as e:
            print(f"❌ An unexpected error occurred: {e}")

    print("\n🎉 All videos up to date!")

if __name__ == "__main__":
    optimize_videos()