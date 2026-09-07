import os
import hashlib
import json
import pandas as pd
import numpy as np

def compute_file_hash(filepath):
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as afile:
        buf = afile.read(65536)
        while len(buf) > 0:
            hasher.update(buf)
            buf = afile.read(65536)
    return hasher.hexdigest()

def preprocess_elliptic():
    print("=========================================")
    print("DARKINT V4.2: Elliptic++ Preprocessor (FORENSIC)")
    print("=========================================\n")
    
    artifact_dir = "../artifacts/elliptic"
    os.makedirs(artifact_dir, exist_ok=True)
    
    artifact_path = os.path.join(artifact_dir, "elliptic_compact_benchmark.json")
    manifest_path = os.path.join(artifact_dir, "manifest.json")
    
    print("[1/3] Attempting to acquire ACTUAL Elliptic++ dataset from GitHub...")
    
    # V4.2 FORENSIC FIX:
    # The Elliptic++ CSVs ARE in the git-disl/EllipticPlusPlus repository,
    # BUT they are stored in Git LFS (Large File Storage).
    # raw.githubusercontent.com returns LFS POINTER FILES, not actual data.
    # To get the real bytes, you must: git clone --depth 1 https://github.com/git-disl/EllipticPlusPlus.git
    # with Git LFS installed (git lfs install && git lfs pull).
    #
    # This preprocessor checks for a local clone first, then falls back to SIMULATED_EXTERNAL.
    
    local_clone_dir = "../data/EllipticPlusPlus"
    local_classes = os.path.join(local_clone_dir, "Transactions Dataset", "txs_classes.csv")
    local_features = os.path.join(local_clone_dir, "Transactions Dataset", "txs_features.csv")
    
    status = "SIMULATED_EXTERNAL"
    nodes = []
    
    if os.path.exists(local_classes) and os.path.exists(local_features):
        try:
            print("  - Found local Elliptic++ clone. Reading actual data...")
            df_classes = pd.read_csv(local_classes, nrows=1000)
            df_features = pd.read_csv(local_features, nrows=1000)
            
            # Detect LFS pointer files (they start with "version https://git-lfs")
            first_col = df_classes.columns[0]
            if 'git-lfs' in first_col:
                raise ValueError("Local files are Git LFS pointers, not actual data. Run: git lfs pull")
            
            # Merge on first column (txId)
            merge_col = df_classes.columns[0]
            df = pd.merge(df_classes, df_features, on=merge_col)
            
            for _, row in df.iterrows():
                nodes.append({
                    "txId": str(row.iloc[0]),
                    "class": str(row.iloc[1]),
                    "features": [float(x) for x in row.values[2:12]]
                })
                
            status = "ACTUAL_EXTERNAL"
            print(f"  - Successfully processed {len(nodes)} actual Elliptic++ nodes.")
            
        except Exception as e:
            print(f"  - Local data processing failed: {e}")
            print("  - Falling back to SIMULATED_EXTERNAL.")
    else:
        print("  - No local Elliptic++ clone found at ../data/EllipticPlusPlus/")
        print("  - NOTE: raw.githubusercontent.com returns Git LFS pointers, NOT actual CSVs.")
        print("  - To use actual data: git clone https://github.com/git-disl/EllipticPlusPlus.git ../data/EllipticPlusPlus && cd ../data/EllipticPlusPlus && git lfs pull")
        print("  - Generating SIMULATED_EXTERNAL artifact.")
    
    if status == "SIMULATED_EXTERNAL":
        np.random.seed(42)
        n_nodes = 500
        
        for i in range(n_nodes):
            timestep = np.random.randint(1, 50)
            cls = np.random.choice([1, 2, 3], p=[0.05, 0.25, 0.70])
            features = np.random.normal(0, 1, 10).tolist()
            
            nodes.append({
                "txId": f"tx_{i}",
                "class": str(int(cls)),
                "features": features
            })
            
    with open(artifact_path, "w") as f:
        json.dump(nodes, f)
            
    print("[2/3] Versioning and Hashing Artifact...")
    artifact_hash = compute_file_hash(artifact_path)
    
    manifest = {
        "dataset_name": "Elliptic++",
        "preprocessing_version": "v2.0",
        "status": status,
        "artifact_hash": artifact_hash,
        "nodes_processed": len(nodes),
        "data_access_method": "Git LFS clone required" if status == "SIMULATED_EXTERNAL" else "Local clone",
        "limitations": "Data is in Git LFS; raw.githubusercontent.com returns pointer files, not CSVs" if status == "SIMULATED_EXTERNAL" else "First 1000 rows only"
    }
    
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
        
    print(f"  - Artifact Hash: {artifact_hash}")
    print(f"  - Status: {status}")
    
    print("\n[3/3] Preprocessing Complete.")

if __name__ == "__main__":
    preprocess_elliptic()
