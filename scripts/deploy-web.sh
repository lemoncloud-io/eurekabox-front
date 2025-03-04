#!/bin/bash

APP_NAME=web

if [ "$GITHUB_ACTIONS" = "true" ]; then
    echo "Running in GitHub Actions environment"
    BUCKET_NAME=$BUCKET_NAME
    DEV_DISTRIBUTION_ID=$DEV_DISTRIBUTION_ID
    PROD_DISTRIBUTION_ID=$PROD_DISTRIBUTION_ID
    PROFILE=""
else
    echo "Running in local environment"
    CONFIG_FILE="$(dirname "$0")/deploy.config.json"
    if [ ! -f "$CONFIG_FILE" ]; then
        echo "Error: deploy.config.json not found. Please copy deploy.config.example.json and update values."
        exit 1
    fi

    BUCKET_NAME=$(jq -r '.bucket' "$CONFIG_FILE")
    DEV_DISTRIBUTION_ID=$(jq -r '.distribution.dev' "$CONFIG_FILE")
    PROD_DISTRIBUTION_ID=$(jq -r '.distribution.prod' "$CONFIG_FILE")
    AWS_PROFILE=$(jq -r '.profile' "$CONFIG_FILE")
    PROFILE="--profile $AWS_PROFILE"
fi

if [[ "$1" != "" ]]; then
    DEPLOY="$1"
else
    echo 'ERROR: Failed to supply environment name'
    exit 1
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
