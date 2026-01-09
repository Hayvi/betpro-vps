#!/bin/bash
# Run this script to initialize the database

# Generate a proper bcrypt hash for the initial admin password
ADMIN_PASSWORD="changeme123"
HASH=$(node -e "console.log(require('bcrypt').hashSync('$ADMIN_PASSWORD', 10))")

# Create database and run schema
psql -U postgres << EOF
CREATE DATABASE betpro;
\c betpro
EOF

# Run schema
psql -U postgres -d betpro -f schema.sql

# Update the admin password with proper hash
psql -U postgres -d betpro << EOF
UPDATE profiles 
SET password_hash = '$HASH'
WHERE username = 'root_admin';
EOF

echo "Database initialized!"
echo "Admin credentials:"
echo "  Username: root_admin"
echo "  Password: $ADMIN_PASSWORD"
echo ""
echo "IMPORTANT: Change the admin password after first login!"
