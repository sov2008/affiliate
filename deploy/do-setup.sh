#!/bin/bash
# deploy/do-setup.sh
# Requires 'doctl' to be installed and authenticated locally, or use DO_PAT.

source ../.env

if [ -z "$DO_PAT" ] || [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: DO_PAT or GITHUB_TOKEN is not set in .env"
  exit 1
fi

DROPLET_NAME="affiliate-autopilot-node"
REGION="fra1"
SIZE="s-1vcpu-1gb"
IMAGE="ubuntu-24-04-x64"

# We substitute the GITHUB_TOKEN and GITHUB_USER into the cloud-init file dynamically
sed -e "s/{{GITHUB_TOKEN}}/${GITHUB_TOKEN}/g" \
    -e "s/{{GITHUB_USER}}/${GITHUB_USER}/g" \
    -e "s/{{GITHUB_REPO}}/${GITHUB_REPO}/g" \
    cloud-init.yaml > cloud-init-resolved.yaml

echo "Provisioning DigitalOcean Droplet ($DROPLET_NAME)..."

# Assuming doctl is installed. 
doctl compute droplet create $DROPLET_NAME \
  --region $REGION \
  --size $SIZE \
  --image $IMAGE \
  --user-data-file cloud-init-resolved.yaml \
  --access-token $DO_PAT \
  --wait

rm cloud-init-resolved.yaml
echo "Droplet created successfully! Background daemon will start automatically within a few minutes."
