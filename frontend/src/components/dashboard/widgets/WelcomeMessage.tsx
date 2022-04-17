import { Box, Card, CardActions, Button, Typography } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import { useTranslate } from 'react-admin';

import welcomeImage from './welcome.png'

const WelcomeMessage = () => {
    const translate = useTranslate();

    return (
        <Card
            sx={{
                background: theme =>
                    theme.palette.mode === 'dark'
                        ? '#535353'
                        : `linear-gradient(to right, #8975fb 0%, #746be7 35%), linear-gradient(to bottom, #8975fb 0%, #6f4ceb 50%), #6f4ceb`,
                color: '#fff',
                padding: '20px',
                marginTop: 2,
                marginBottom: '1em',
            }}
        >
            <Box display="flex">
                <Box flex="1">
                    <Typography variant="h5" component="h2" gutterBottom>
                        {translate('dashboard.welcome.title')}
                    </Typography>
                    <Box maxWidth="40em">
                        <Typography variant="body1" component="p" gutterBottom>
                            {translate('dashboard.welcome.subtitle')}
                        </Typography>
                    </Box>
                    <CardActions
                        sx={{
                            padding: { xs: 0, xl: null },
                            flexWrap: { xs: 'wrap', xl: null },
                            '& a': {
                                marginTop: { xs: '1em', xl: null },
                                marginLeft: { xs: '0!important', xl: null },
                                marginRight: { xs: '1em', xl: null },
                            },
                        }}
                    >
                        <Button
                            variant="contained"
                            href="/help-guide.pdf"
                            target="_blank"
                            startIcon={<HelpIcon />}
                        >
                            {translate('dashboard.welcome.help_button')}
                        </Button>
                    </CardActions>
                </Box>
                <Box
                    display={{ xs: 'none', sm: 'none', md: 'block' }}
                    sx={{
                        background: `url(${welcomeImage})`,
                        backgroundSize: 'cover',
                        marginLeft: 'auto'
                    }}
                    width="17.5em"
                    height="10em"
                    overflow="hidden"
                />
            </Box>
        </Card>
    );
};

export default WelcomeMessage;