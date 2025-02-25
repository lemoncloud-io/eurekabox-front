#!/bin/bash

APP_NAME=web

# Load environment variables
if [ -f ".env.deploy" ]; then
    source .env.deploy
else
    echo 'ERROR: .env.deploy file not found'
    exit 1
fi

PROFILE="--profile lemon"

if [[ "$1" != "" ]]; then
    DEPLOY="$1"
else
    echo 'ERROR: Failed to supply environment name'
    exit 1
fi

if [ "$GITHUB_ACTIONS" = "true" ]; then
    echo "This script is running in GitHub Actions."
    PROFILE=""
fi

# sync data to AWS S3
echo 'deploy to' $DEPLOY
aws s3 ${PROFILE} sync dist/apps/${APP_NAME} s3://${BUCKET_NAME}/${DEPLOY} --metadata-directive REPLACE --acl public-read --exclude "index.html" --exclude "*.css" --exclude "*.js" || { echo 'ERROR: s3 sync failed' ; exit 1; }
aws s3 ${PROFILE} sync dist/apps/${APP_NAME} s3://${BUCKET_NAME}/${DEPLOY} --metadata-directive REPLACE --acl public-read --exclude "*" --include "*.css" --include "*.js" --exclude 'assets/*' || { echo 'ERROR: s3 js/css sync failed' ; exit 1; }
aws s3 ${PROFILE} sync dist/apps/${APP_NAME} s3://${BUCKET_NAME}/${DEPLOY} --metadata-directive REPLACE --acl public-read --exclude "*" --include "assets/*" || { echo 'ERROR: s3 sync failed' ; exit 1; }
aws s3 ${PROFILE} cp dist/apps/${APP_NAME}/index.html s3://${BUCKET_NAME}/${DEPLOY}/index.html --metadata-directive REPLACE --cache-control max-age=0,no-cache,no-store,must-revalidate --content-type text/html --acl public-read || { echo 'ERROR: s3 cp index failed' ; exit 1; }

if [ "$DEPLOY" = "dev" ] ; then
    aws cloudfront ${PROFILE} create-invalidation --distribution-id ${DEV_DISTRIBUTION_ID} --paths '/*'
else
    aws cloudfront ${PROFILE} create-invalidation --distribution-id ${PROD_DISTRIBUTION_ID} --paths '/*'
fi
