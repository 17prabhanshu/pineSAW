import os

for path in ["generate_doc.py", "PITCH_GUIDE.md"]:
    abs_path = os.path.join("/Users/prabhanshushekhar/Desktop/CP3", path)
    if os.path.exists(abs_path):
        with open(abs_path, "r", encoding="utf-8") as f:
            c = f.read()
        c = c.replace("Quantella", "ctrl addicts").replace("Anantapadmanaabhan S", "Prabhanshu").replace("Chennai Institute of Technology", "UIET (Panjab University)")
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(c)

print("Updated team info in doc generators.")
