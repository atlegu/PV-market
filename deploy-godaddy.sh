#!/bin/bash

# GoDaddy Deployment Script for PV Market
# ========================================

echo "🚀 Starting GoDaddy deployment for PV Market..."

# Step 1: Build the application
echo "📦 Building application..."
npm run build:godaddy

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Step 2: Copy .htaccess to dist folder
echo "📄 Copying .htaccess file..."
cp .htaccess dist/

# Step 3: Create deployment info
echo "📝 Creating deployment info..."
echo "Deployed: $(date)" > dist/deployment.txt
echo "Version: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')" >> dist/deployment.txt

echo "✅ Build ready for deployment!"
echo ""
echo "📤 Next steps:"
echo "1. Open your FTP client (FileZilla, Cyberduck, etc.)"
echo "2. Connect to your GoDaddy hosting:"
echo "   - Host: Your GoDaddy FTP hostname"
echo "   - Username: Your FTP username"
echo "   - Password: Your FTP password"
echo "   - Port: 21 (or as specified by GoDaddy)"
echo ""
echo "3. Navigate to your public_html folder (or the folder for your domain)"
echo "4. Upload ALL contents from the 'dist' folder"
echo "5. Make sure .htaccess file is uploaded (it might be hidden)"
echo ""
echo "📁 Files to upload are in: $(pwd)/dist"
echo ""
echo "🎉 After upload, your site will be live at your GoDaddy domain!"