#!/usr/bin/env bash

# Display warning message
echo "⚠️  WARNING ⚠️"
echo "This script will create or overwrite the following environment files:"
echo "  - .env"
echo "  - .env.wpi"
echo "  - .env.prod"
echo "  - .env.aws"
echo ""
echo "Only run this script once during initial setup or if you want to reset to default configuration."
echo ""

# Ask for confirmation
read -p "Do you want to continue? (y/N): " confirm

# Check confirmation
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Setup canceled."
  exit 0
fi

# Copy example files
cp .env.example .env
cp .env.example .env.wpi
cp .env.example .env.prod
cp .env.aws.example .env.aws

echo "Setup complete! ✅"
echo "Remember to update these files with your actual configuration values."
echo "These files will not be committed to Git. Only the example configuration files will be committed."