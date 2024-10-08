/**
* @file Dashboard CardWithIcon Base Widget
* @module CardWithIcon
* @category Dashboard
* @author Braden Cariaga
*/

import { FC, createElement } from 'react';
import { Card, Box, Typography, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
import cartouche from './cartouche.png';
import { useTranslate } from 'react-admin';

export type CardWithIconProps = {
    icon: FC<any>;
    to: string;
    title?: string;
    subtitle?: string | number | JSX.Element;
    replace?: boolean
    children?: ReactNode;
}

const CardWithIcon = (props: CardWithIconProps) => {
    const { icon, title, subtitle, to, children } = props;

    const translate = useTranslate();
    return (
        // @ts-ignore
        <Card
            sx={{
                minHeight: 52,
                display: 'flex',
                flexDirection: 'column',
                flex: '1',
                '& a': {
                    textDecoration: 'none',
                    color: 'inherit',
                },
            }}
        >
            <Link to={to} replace={props.replace}>
                <Box
                    sx={{
                        overflow: 'inherit',
                        padding: '16px',
                        background: theme =>
                            `url(${cartouche}) no-repeat`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        '& .icon': {
                            color: theme =>
                                theme.palette.mode === 'dark'
                                    ? 'inherit'
                                    : '#dc2440',
                        },
                    }}
                >
                    <Box width="3em" className="icon">
                        {createElement(icon, { fontSize: 'large' })}
                    </Box>
                    <Box textAlign="right">
                        <Typography color="textSecondary">{title && (translate(title) || title)}</Typography>
                        <Typography variant="h5" component="h2">
                            {subtitle || ' '}
                        </Typography>
                    </Box>
                </Box>
            </Link>
            {children && <Divider />}
            {children}
        </Card>
    );
};

export default CardWithIcon;