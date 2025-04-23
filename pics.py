import os

def list_lookbook_images(directory='/Users/quadgeter/Desktop/WithNSite/WithNSite-copy/assets/vids'):
    try:
        files = os.listdir(directory)
        image_files = [f for f in files if f.lower().endswith(('.mp4'))]
    except FileNotFoundError:
        print(f"Directory '{directory}' not found.")
    except Exception as e:
        print(f"An error occurred: {e}")
        
    return image_files

# Run the function
images = list_lookbook_images()

print(images)