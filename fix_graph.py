import re

with open('src/components/NetworkGraph.tsx', 'r') as f:
    lines = f.readlines()

filtered_data_start = -1
filtered_data_end = -1
for i, line in enumerate(lines):
    if "const filteredData = {" in line:
        filtered_data_start = i - 1 # Include comment
    if filtered_data_start != -1 and "};" in line and i > filtered_data_start:
        filtered_data_end = i
        break

if filtered_data_start != -1:
    block = lines[filtered_data_start:filtered_data_end+1]
    del lines[filtered_data_start:filtered_data_end+1]
    
    # insert before the useEffect on line 23 (which might be shifted now)
    insert_idx = -1
    for i, line in enumerate(lines):
        if "useEffect(() => {" in line and "!mounted || !filteredData.links" in "".join(lines[i:i+3]):
            insert_idx = i
            break
            
    if insert_idx != -1:
        for j, b_line in enumerate(block):
            lines.insert(insert_idx + j, b_line)
        
with open('src/components/NetworkGraph.tsx', 'w') as f:
    f.writelines(lines)
