#!/bin/bash
# test-subpath-build.sh

echo "🔍 Testing subpath build..."

# Build with subpath
npm run build

echo "🔍 Checking generated HTML..."

# Check for absolute asset paths with subpath prefix
if grep -q '"/crossword-good-prompt/static/' build/index.html; then
  echo "✅ Absolute asset paths found"
else
  echo "❌ Asset paths are still relative"
  exit 1
fi

# Check for favicon path
if grep -q 'href="/crossword-good-prompt/favicon.ico"' build/index.html; then
  echo "✅ Favicon path is correct"
else
  echo "❌ Favicon path is incorrect"
  exit 1
fi

# Check that assets were actually generated
if [ -f "build/static/js/main.*.js" ] || ls build/static/js/main.*.js 1> /dev/null 2>&1; then
  echo "✅ JavaScript assets generated"
else
  echo "❌ JavaScript assets missing"
  exit 1
fi

if [ -f "build/static/css/main.*.css" ] || ls build/static/css/main.*.css 1> /dev/null 2>&1; then
  echo "✅ CSS assets generated"
else
  echo "❌ CSS assets missing"
  exit 1
fi

echo "🎉 Subpath build test passed!"
echo ""
echo "📋 Build verification:"
echo "  Homepage: /crossword-good-prompt"
echo "  Assets use absolute paths with subpath prefix"
echo "  Ready for Kubernetes deployment!"