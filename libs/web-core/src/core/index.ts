import { WebCoreFactory } from '@lemoncloud/lemon-web-core';

/**
 * Environment configuration variables
 * - Loaded from Vite environment variables
 * - Normalized to lowercase for consistency
 */
export const ENV = import.meta.env.VITE_ENV.toLowerCase();
export const PROJECT = import.meta.env.VITE_PROJECT.toLowerCase();
export const REGION = import.meta.env.VITE_REGION?.toLowerCase() || 'ap-northeast-2';
export const OAUTH_ENDPOINT = import.meta.env.VITE_OAUTH_ENDPOINT.toLowerCase();

/**
 * Key for storing language preference
 */
export const LANGUAGE_KEY = 'i18nextLng';

/**
 * WebCore instance configuration and initialization
 * - Sets up cloud provider and project details
 * - Configures OAuth endpoint and region
 */
export const webCore = WebCoreFactory.create({
    cloud: 'aws',
    project: `${PROJECT}_${ENV}`,
    oAuthEndpoint: OAUTH_ENDPOINT,
    region: REGION,
});
