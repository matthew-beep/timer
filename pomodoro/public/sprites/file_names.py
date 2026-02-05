import os
import sys
import struct

def get_png_size(filename):
    """Return width and height of a PNG file."""
    with open(filename, 'rb') as f:
        signature = f.read(8)
        if signature != b'\x89PNG\r\n\x1a\n':
            raise ValueError(f"{filename} is not a valid PNG file")
        # Read IHDR chunk
        chunk_length = struct.unpack(">I", f.read(4))[0]
        chunk_type = f.read(4)
        if chunk_type != b'IHDR':
            raise ValueError(f"{filename} missing IHDR chunk")
        width, height = struct.unpack(">II", f.read(8))
        return width, height

def scan_folder(folder_name):
    """Scan folder for PNGs and return a dict of filename -> {width, height}."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    folder_path = os.path.join(script_dir, folder_name)

    if not os.path.exists(folder_path):
        print(f"Folder not found: {folder_path}")
        return {}

    result = {}
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(".png"):
            file_path = os.path.join(folder_path, filename)
            try:
                w, h = get_png_size(file_path)
                result[filename] = {"width": w, "height": h, "frames": w / h}
            except Exception as e:
                print(f"Error reading {filename}: {e}")
    
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python file_names.py <folder_name>")
        sys.exit(1)
    
    folder_name = sys.argv[1]
    sizes = scan_folder(folder_name)
    
    if sizes:
        for fname, dims in sizes.items():
            print(f"{fname}: {dims}")
    else:
        print("No PNG files found or folder doesn't exist.")
