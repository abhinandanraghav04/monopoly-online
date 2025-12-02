#!/bin/bash

# Monopoly Online - Deployment Verification Script
# This script helps verify that the deployment is working correctly

set -e

BACKEND_URL="${1:-http://localhost:4000}"
FRONTEND_URL="${2:-http://localhost:5173}"

echo "============================================================"
echo "MONOPOLY ONLINE - DEPLOYMENT VERIFICATION"
echo "============================================================"
echo "Backend URL:  $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "============================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Counter for tests
PASSED=0
FAILED=0

# Test 1: Check backend is accessible
echo "Testing backend connectivity..."
if curl -s -f -o /dev/null "$BACKEND_URL/api/rooms"; then
    print_success "Backend is accessible"
    ((PASSED++))
else
    print_error "Backend is not accessible"
    ((FAILED++))
fi

# Test 2: Check if we can create a user
echo ""
echo "Testing user creation..."
USER_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/user" \
    -H "Content-Type: application/json" \
    -d '{"username":"TestUser"}')

if echo "$USER_RESPONSE" | grep -q "id"; then
    print_success "User creation works"
    USER_ID=$(echo "$USER_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "  Created user ID: $USER_ID"
    ((PASSED++))
else
    print_error "User creation failed"
    ((FAILED++))
fi

# Test 3: Check leaderboard endpoint
echo ""
echo "Testing leaderboard endpoint..."
if curl -s -f -o /dev/null "$BACKEND_URL/api/leaderboard"; then
    print_success "Leaderboard endpoint works"
    ((PASSED++))
else
    print_error "Leaderboard endpoint failed"
    ((FAILED++))
fi

# Test 4: Check rooms endpoint
echo ""
echo "Testing rooms endpoint..."
ROOMS_RESPONSE=$(curl -s "$BACKEND_URL/api/rooms")
if echo "$ROOMS_RESPONSE" | grep -q "\["; then
    print_success "Rooms endpoint works"
    ((PASSED++))
else
    print_error "Rooms endpoint failed"
    ((FAILED++))
fi

# Test 5: Check frontend (if running)
echo ""
echo "Testing frontend accessibility..."
if curl -s -f -o /dev/null "$FRONTEND_URL"; then
    print_success "Frontend is accessible"
    ((PASSED++))
else
    print_warning "Frontend is not accessible (may not be running locally)"
    echo "  Note: This is expected if testing backend only"
fi

# Print summary
echo ""
echo "============================================================"
echo "VERIFICATION SUMMARY"
echo "============================================================"
echo "Tests Passed: $PASSED"
echo "Tests Failed: $FAILED"
echo "============================================================"

if [ $FAILED -eq 0 ]; then
    print_success "All critical tests passed!"
    echo ""
    echo "Next steps:"
    echo "  1. Run load test: npm run load-test $BACKEND_URL"
    echo "  2. Test frontend in browser: $FRONTEND_URL"
    echo "  3. Create a game room and invite 8 players"
    echo ""
    exit 0
else
    print_error "Some tests failed. Please check the deployment."
    echo ""
    echo "Troubleshooting:"
    echo "  - Check backend logs for errors"
    echo "  - Verify environment variables are set correctly"
    echo "  - Ensure the backend is fully started"
    echo ""
    exit 1
fi
