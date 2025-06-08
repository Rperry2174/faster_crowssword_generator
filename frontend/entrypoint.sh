#!/bin/sh

# Set default backend host if not provided
export BACKEND_HOST=${BACKEND_HOST:-backend}

# Substitute environment variables in nginx config template
envsubst '${BACKEND_HOST}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g "daemon off;"