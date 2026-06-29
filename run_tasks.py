import re
import subprocess
import sys

def parse_and_run_tasks(filename="C:\Users\kade4\OneDrive\Desktop\blog-automation\todo.md"):
    # Read the markdown file
    try:
        with open(filename, "r") as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"Error: {filename} not found.")
        sys.exit(1)

    updated_lines = []
    task_executed = False

    for line in lines:
        # Match incomplete markdown checkboxes followed by a command in backticks
        # Example: - [ ] Run tests `npm test`
        match = re.match(r"^(\s*-\s*\[\s*\]\s*.*?`)(.*?)(`.*)$", line)
       
        if match and not task_executed:
            prefix, command, suffix = match.groups()
            print(f"\n🚀 Running task: {command.strip()}")
           
            # Execute the command in the shell
            result = subprocess.run(command.strip(), shell=True)
           
            if result.returncode == 0:
                print("✅ Task completed successfully!")
                # Change [ ] to [x]
                line = line.replace("[ ]", "[x]", 1)
                task_executed = True
            else:
                print("❌ Task failed. Stopping execution.")
                updated_lines.append(line)
                # Keep remaining lines as they are
                remaining_index = lines.index(line) + 1
                updated_lines.extend(lines[remaining_index:])
                break
       
        updated_lines.append(line)

    # Save updates back to the file
    with open (filename, "w") as f:
        f.writelines(updated_lines)

    if not task_executed:
        print("\n🎉 No pending tasks found!")

if __name__ == "__main__":
    parse_and_run_tasks()



Kevin Valade
kade4111@aol.com


On Friday, May 29, 2026 at 09:06:21 PM EDT, Kevin Valade <kade4111@aol.com> wrote:


import re
import subprocess
import sys

def parse_and_run_tasks(filename="todo.md"):
    # Read the markdown file
    try:
        with open(filename, "r") as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"Error: {filename} not found.")
        sys.exit(1)

    updated_lines = []
    task_executed = False

    for line in lines:
        # Match incomplete markdown checkboxes followed by a command in backticks
        # Example: - [ ] Run tests `npm test`
        match = re.match(r"^(\s*-\s*\[\s*\]\s*.*?`)(.*?)(`.*)$", line)
       
        if match and not task_executed:
            prefix, command, suffix = match.groups()
            print(f"\n🚀 Running task: {command.strip()}")
           
            # Execute the command in the shell
            result = subprocess.run(command.strip(), shell=True)
           
            if result.returncode == 0:
                print("✅ Task completed successfully!")
                # Change [ ] to [x]
                line = line.replace("[ ]", "[x]", 1)
                task_executed = True
            else:
                print("❌ Task failed. Stopping execution.")
                updated_lines.append(line)
                # Keep remaining lines as they are
                remaining_index = lines.index(line) + 1
                updated_lines.extend(lines[remaining_index:])
                break
       
        updated_lines.append(line)

    # Save updates back to the file
    with open(filename, "w") as f:
        f.writelines(updated_lines)

    if not task_executed:
        print("\n🎉 No pending tasks found!")

if __name__ == "__main__":
    parse_and_run_tasks()
