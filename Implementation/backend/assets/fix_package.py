import os

# The path to your venv carball folder
base_path = r"C:\Users\Krystian\OneDrive\Documents\[] FYP\kxp314\Implementation\backend\venv\lib\site-packages\carball"

def patch_carball():
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.endswith(".py"):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Fix 1: Change '.api.metadata' or '.api.stats' to absolute paths
                new_content = content.replace("from .api", "from carball.generated.api")
                
                # Fix 2: Change '..api' to absolute paths
                new_content = new_content.replace("from ..api", "from carball.generated.api")
                
                # Fix 3: Specifically fix the game_pb2 sibling error in ball.py
                # It tries to import FROM game_pb2, but it should import FROM api
                new_content = new_content.replace(
                    "from carball.generated.api.game_pb2 import mutators_pb2",
                    "from carball.generated.api.metadata import mutators_pb2"
                )

                if content != new_content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Patched: {file}")

if __name__ == "__main__":
    patch_carball()
    print("\n--- All known import bugs patched. Try running test.py again. ---")