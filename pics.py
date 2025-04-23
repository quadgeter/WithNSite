import os

def list_lookbook_images(directory):
    try:
        files = os.listdir(directory)
        image_files = [f for f in files if f.endswith(('.PNG', 'JPEG'))]
        
        for filename in image_files:
            base, ext = os.path.splitext(filename)
            new_filename = base + ext.lower()
            
            old_path = os.path.join(directory, filename)
            new_path = os.path.join(directory, new_filename)
            
            os.rename(old_path, new_path)
            print(f"Renamed: {filename} → {new_filename}")
    
    except FileNotFoundError:
        print(f"Directory '{directory}' not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

# Run it on your pics folder
list_lookbook_images('/Users/quadgeter/Desktop/WithNSite/WithNSite-copy/assets/pics')
