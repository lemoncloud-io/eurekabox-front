import { WebCoreFactory } from '@lemoncloud/lemon-web-core';

export const ENV = import.meta.env.VITE_ENV.toLowerCase();
export const PROJECT = import.meta.env.VITE_PROJECT.toLowerCase();
export const REGION = import.meta.env.VITE_REGION?.toLowerCase() || 'ap-northeast-2';
export const OAUTH_ENDPOINT = import.meta.env.VITE_OAUTH_ENDPOINT.toLowerCase();

export const webCore = WebCoreFactory.create({
    cloud: 'aws',
    project: `${PROJECT}_${ENV}`,
    oAuthEndpoint: OAUTH_ENDPOINT,
    region: REGION,
});
