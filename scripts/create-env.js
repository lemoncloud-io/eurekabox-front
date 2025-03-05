const fs = require('fs');
const path = require('path');

const [env, project = 'web'] = process.argv.slice(2);
if (!env) {
    console.error('Please specify environment (dev/prod)');
    console.error('Usage: node create-env.js <env> [project]');
    process.exit(1);
}

const envPath = path.join(__dirname, `../apps/${project}/.env.${env}`);
let existingVars = {};

// Read existing env file if it exists
if (fs.existsSync(envPath)) {
    const existingContent = fs.readFileSync(envPath, 'utf8');
    existingVars = existingContent
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .reduce((acc, line) => {
            const [key, value] = line.split('=');
            acc[key.trim()] = value.trim();
            return acc;
        }, {});
}

const envVars = {
    VITE_ENV: env.toUpperCase(),
    VITE_PROJECT: process.env.VITE_PROJECT,
    VITE_OAUTH_ENDPOINT: process.env.VITE_OAUTH_ENDPOINT,
    VITE_BACKEND_ENDPOINT: process.env.VITE_BACKEND_ENDPOINT,
    VITE_TRANSLATE_ENDPOINT: process.env.VITE_TRANSLATE_ENDPOINT,
    VITE_HOST: process.env.VITE_HOST,
    VITE_SOCIAL_OAUTH_ENDPOINT: process.env.VITE_SOCIAL_OAUTH_ENDPOINT,
    VITE_IMAGE_API_ENDPOINT: process.env.VITE_IMAGE_API_ENDPOINT,
    VITE_CONTENT_ENDPOINT: process.env.VITE_CONTENT_ENDPOINT,
    VITE_CODES_HOST: process.env.VITE_CODES_HOST,
};

const mergedVars = {
    ...envVars,
    ...existingVars,
};

const envContent = Object.entries(mergedVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

fs.writeFileSync(envPath, envContent);

console.log(`Created/Updated ${env} environment file at ${envPath}`);
