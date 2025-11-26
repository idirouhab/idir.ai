#!/bin/bash

# Test Gzip/Brotli compression on deployed site
# Usage: ./scripts/test-compression.sh https://idir.ai

if [ -z "$1" ]; then
  echo "Usage: $0 <url>"
  echo "Example: $0 https://idir.ai"
  exit 1
fi

URL="$1"

echo "Testing compression for: $URL"
echo "========================================"
echo ""

# Test Brotli compression
echo "1. Testing Brotli compression:"
BROTLI_SIZE=$(curl -sI -H "Accept-Encoding: br" "$URL" | grep -i "Content-Encoding: br" && echo "✓ Brotli enabled" || echo "✗ Brotli not available")
echo "$BROTLI_SIZE"
echo ""

# Test Gzip compression
echo "2. Testing Gzip compression:"
GZIP_SIZE=$(curl -sI -H "Accept-Encoding: gzip" "$URL" | grep -i "Content-Encoding: gzip" && echo "✓ Gzip enabled" || echo "✗ Gzip not available")
echo "$GZIP_SIZE"
echo ""

# Test actual size difference
echo "3. Comparing response sizes:"
echo "   Uncompressed size:"
UNCOMPRESSED=$(curl -s "$URL" | wc -c | xargs)
echo "   $UNCOMPRESSED bytes"

echo "   Gzipped size:"
COMPRESSED=$(curl -s -H "Accept-Encoding: gzip" "$URL" | wc -c | xargs)
echo "   $COMPRESSED bytes"

if [ "$UNCOMPRESSED" -gt 0 ] && [ "$COMPRESSED" -gt 0 ]; then
  REDUCTION=$(awk "BEGIN {printf \"%.1f\", (1 - $COMPRESSED / $UNCOMPRESSED) * 100}")
  echo ""
  echo "   Compression savings: ${REDUCTION}% 🚀"
else
  echo ""
  echo "   Could not calculate compression ratio"
fi

echo ""
echo "========================================"
echo "Note: Compression should show ~70% reduction for HTML pages"
echo "Brotli typically achieves better compression than Gzip"
