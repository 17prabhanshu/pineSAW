#!/bin/bash
# Script to download Kaggle datasets for VendorLink / CyberCrimelinker
set -e

echo "==========================================="
echo "  DARKINT V4.2: Kaggle Dataset Downloader"
echo "==========================================="

# Check if kaggle API is installed
if ! command -v kaggle &> /dev/null
then
    echo "Kaggle CLI could not be found. Installing..."
    ./venv/bin/pip install kaggle
    export PATH="$PATH:$(pwd)/venv/bin"
fi

# Check if kaggle.json exists
if [ ! -f ~/.kaggle/kaggle.json ]; then
    echo "ERROR: Kaggle API token not found at ~/.kaggle/kaggle.json"
    echo "Please follow these steps:"
    echo "1. Go to https://www.kaggle.com/settings"
    echo "2. Click 'Create New Token' to download kaggle.json"
    echo "3. Run: mkdir -p ~/.kaggle && mv /path/to/downloads/kaggle.json ~/.kaggle/"
    echo "4. Run: chmod 600 ~/.kaggle/kaggle.json"
    echo "5. Re-run this script."
    exit 1
fi

mkdir -p ../data/raw_external

echo "[1/2] Downloading Agora dataset (Dark Net Marketplace Drug Data)..."
# Using a well-known Agora dataset on Kaggle
kaggle datasets download -d philipjames11/dark-net-marketplace-drug-data-agora-20142015 -p ../data/raw_external --unzip

echo "==========================================="
echo "✅ Download script finished. Check ../data/raw_external/"
echo "==========================================="
