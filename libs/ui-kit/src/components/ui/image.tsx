import React from 'react';

import { useTheme } from '@eurekabox/theme';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    darkSrc?: string;
}

// TODO: 사전 로딩 추가
export const Image = ({ src, darkSrc = src, alt, ...imgProps }: ImageProps) => {
    const { isDarkTheme } = useTheme();

    return <img src={isDarkTheme ? darkSrc : src} alt={alt} {...imgProps} />;
};
