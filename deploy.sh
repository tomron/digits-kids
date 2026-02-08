#!/bin/bash

set -e

DIST_DIR="./dist"
GH_PAGES_DIR="../digits-kids-gh-pages"

echo "📦 Building application..."
npm run build

echo "🧹 Cleaning gh-pages worktree..."
cd "$GH_PAGES_DIR"
git rm -rf . 2>/dev/null || true
git clean -fxd

echo "📋 Copying build files..."
cp -r "$OLDPWD/$DIST_DIR"/* .

echo "📝 Creating .nojekyll file..."
touch .nojekyll

echo "💾 Committing changes..."
git add -A

if git commit -m "Deploy to GitHub Pages"; then
  echo "✅ Committed successfully"
else
  echo "ℹ️  No changes to commit"
fi

echo "🚀 Pushing to GitHub..."
git push origin gh-pages

echo "✨ Deployment complete!"
echo "🌐 Your site will be available at: https://tomron.github.io/digits-kids/"

cd "$OLDPWD"
