import * as React from 'react';
import { styled } from '@mui/material/styles';
import { FC, createElement } from 'react';
import { Card, Box, Typography, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

import cartouche from './cartouche.png';
import { useTranslate } from 'react-admin';

const PREFIX = 'CardWithIcon';

const classes = {
    card: `${PREFIX}-card`,
    main: `${PREFIX}-main`,
    title: `${PREFIX}-title`
};

const StyledCard = styled(Card)(({ theme }) => ({
    [`&.${classes.card}`]: {
        minHeight: 52,
        display: 'flex',
        flexDirection: 'column',
        flex: '1',
        '& a': {
            textDecoration: 'none',
            color: 'inherit',
        },
    },

    [`& .${classes.main}`]: (props: CardWithIconProps) => ({
        overflow: 'inherit',
        padding: 16,
        background: `url(${cartouche
            }) no-repeat`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        '& .icon': {
            color: theme.palette.mode === 'dark' ? 'inherit' : '#dc2440',
        },
    }),

    [`& .${classes.title}`]: {}
}));

export type CardWithIconProps = {
    icon: FC<any>;
    to: string;
    title?: string;
    subtitle?: string | number;
    children?: ReactNode;
}

const CardWithIcon = (props: CardWithIconProps) => {
    const { icon, title, subtitle, to, children } = props;

    const translate = useTranslate();
    return (
        <StyledCard className={classes.card}>
            <Link to={to} replace>
                <div className={classes.main}>
                    <Box width="3em" className="icon">
                        {createElement(icon, { fontSize: 'large' })}
                    </Box>
                    <Box textAlign="right">
                        <Typography
                            className={classes.title}
                            color="textSecondary"
                        >
                            {title && translate(title) || title}
                        </Typography>
                        <Typography variant="h5" component="h2">
                            {subtitle || ' '}
                        </Typography>
                    </Box>
                </div>
            </Link>
            {children && <Divider />}
            {children}
        </StyledCard>
    );
};

export default CardWithIcon;