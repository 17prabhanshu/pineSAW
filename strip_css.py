with open('src/app/globals.css', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.strip() == ".glow-border {":
        break
    new_lines.append(line)

with open('src/app/globals.css', 'w') as f:
    f.writelines(new_lines)
