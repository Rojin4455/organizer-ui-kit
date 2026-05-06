#!/bin/bash

# Load .env file
if [ -f .env ]; then
    # Load .env variables, ignoring comments
    export $(grep -v '^\s*#' .env | xargs)
fi

# Required Variables checking
REQUIRED_VARS=(
  "KEY_PATH"
  "SERVER_USER"
  "SERVER_HOST"
  "REMOTE_PARENT_DIR"
  "VITE_API_URL"
  "VITE_BASENAME"
)

MISSING_VARS=0
for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ]; then
    echo "Error: Required variable '$VAR' is not set."
    MISSING_VARS=1
  fi
done

if [ $MISSING_VARS -eq 1 ]; then
  echo "Please set these variables in your .env file or environment."
  exit 1
fi

REMOTE_TARGET_DIR="${REMOTE_PARENT_DIR}"

echo "========================================"
echo "Starting Frontend Deployment"
echo "========================================"
echo "Configuration:"
echo "  Key Path: $KEY_PATH"
echo "  Server: $SERVER_USER@$SERVER_HOST"
echo "  Remote Dir: $REMOTE_TARGET_DIR"
echo "  VITE_API_URL: $VITE_API_URL"
echo "  VITE_BASENAME: $VITE_BASENAME"
echo "  (VITE_API_URL must be the Django API base URL ending in /api, e.g. …/api.)"
echo "========================================"

# 1. Build the Project
echo "Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed! Aborting deployment."
    exit 1
fi

# 2. Generate Local Manifest
echo "Generating file manifest..."
# Create a temporary file for the manifest
MANIFEST_FILE="deploy_manifest.txt"
# List all files relative to dist/
cd dist
find . -type f > "../$MANIFEST_FILE"
cd ..

# 3. Transfer Files
echo "Transferring files to server..."
# Use shopt to ensure dotfiles like .htaccess are included in dist/*
shopt -s dotglob
scp -i "$KEY_PATH" -r dist/* "${SERVER_USER}@${SERVER_HOST}:${REMOTE_TARGET_DIR}/"
shopt -u dotglob
scp -i "$KEY_PATH" "$MANIFEST_FILE" "${SERVER_USER}@${SERVER_HOST}:/tmp/"

if [ $? -ne 0 ]; then
    echo "File transfer failed! Aborting."
    rm "$MANIFEST_FILE"
    exit 1
fi

# 4. Remote Execution: Restart Nginx and Cleanup
echo "Executing remote commands (Restart Nginx & Cleanup)..."

# Construct the remote script
REMOTE_SCRIPT="
    echo 'Remote: Restarting Nginx...'
    sudo systemctl restart nginx

    echo 'Remote: Cleaning up old files...'
    cd ${REMOTE_TARGET_DIR} || exit 1
    
    # Read manifest and delete files not in it
    # We use comm to compare sorted lists of files
    
    # 1. Get list of current files on remote (relative to dist)
    find . -type f | sort > /tmp/current_files.txt
    
    # 2. Sort the uploaded manifest
    sort /tmp/${MANIFEST_FILE} > /tmp/sorted_manifest.txt
    
    # 3. Find files that are in current_files.txt but NOT in sorted_manifest.txt
    # comm -23 suppresses lines in file 2 (manifest) and common lines, leaving only unique to file 1 (current remote)
    comm -23 /tmp/current_files.txt /tmp/sorted_manifest.txt > /tmp/files_to_delete.txt
    
    if [ -s /tmp/files_to_delete.txt ]; then
        echo 'Remote: Deleting the following obsolete files:'
        cat /tmp/files_to_delete.txt
        # xargs rm to delete
        # Use tr to ensure safe handling if newlines (though standard find output is usually safe for simple filenames)
        # For robustness with standard filenames:
        while IFS= read -r file; do
            rm \"\$file\"
        done < /tmp/files_to_delete.txt
    else
        echo 'Remote: No obsolete files found.'
    fi
    
    # Cleanup temporary files on remote
    rm -f /tmp/current_files.txt /tmp/sorted_manifest.txt /tmp/files_to_delete.txt /tmp/${MANIFEST_FILE}
    
    echo 'Remote: Deployment & Cleanup Complete.'
"

# Execute remote script
ssh -i "$KEY_PATH" "${SERVER_USER}@${SERVER_HOST}" "$REMOTE_SCRIPT"

if [ $? -ne 0 ]; then
    echo "Remote execution failed!"
    # Cleanup local manifest even if remote failed
    rm "$MANIFEST_FILE"
    exit 1
fi

# Cleanup local manifest
rm "$MANIFEST_FILE"

echo "========================================"
echo "Deployment Successfully Completed!"
echo "========================================"
