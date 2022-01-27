import * as React from 'react';
import { useTranslate } from 'react-admin';

const Logo = (props: any) => {
    const translate = useTranslate();
    return (
        <h1 style={{margin: 0}}>{translate('layout.appbar.title')} {/* TODO: Replace with an Image */}</h1>
    );
};

export default Logo;
