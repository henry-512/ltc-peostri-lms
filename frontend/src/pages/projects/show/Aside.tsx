import * as React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import {
    NumberField,
    TextField,
    DateField,
    useTranslate,
    useGetList,
    Record,
    RecordMap,
    Identifier,
    ReferenceField,
    useLocale,
} from 'react-admin';
import {
    Typography,
    Card,
    CardContent,
    Box,
    Link,
    Stepper,
    Step,
    StepLabel,
    StepContent,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
const PREFIX = 'Aside';

const classes = {
    root: `${PREFIX}-root`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        width: 400,
        [theme.breakpoints.down('lg')]: {
            display: 'none',
        },
    }
}));

const useAsideStyles = makeStyles((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        width: 400,
        [theme.breakpoints.down('lg')]: {
            display: 'none',
        },
    }
}));

interface AsideProps {
    record?: Record;
    basePath?: string;
}

const Aside = ({ record, basePath }: AsideProps) => {
    const classes = useAsideStyles();
    return (
        <div className={classes.root}>
            {record && <EventList record={record} basePath={basePath} />}
        </div>
    );
};

Aside.propTypes = {
    record: PropTypes.any,
    basePath: PropTypes.string,
};

interface EventListProps {
    record?: Record;
    basePath?: string;
}

const useEventStyles = makeStyles({
    stepper: {
        background: 'none',
        border: 'none',
        marginLeft: '0.3em',
    },
});

const EventList = ({ record, basePath }: EventListProps) => {
    const translate = useTranslate();
    const classes = useEventStyles();
    const locale = useLocale();

    return (
        (<Root>
            <Box m="0 0 1em 1em">
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {translate(
                                'resources.customers.fieldGroups.history'
                            )}
                        </Typography>
                        <Box display="flex">
                            <Box flexGrow={1}>
                                <Box display="flex" mb="1em">
                                    <Box mr="1em">
                                        <AccessTimeIcon
                                            fontSize="small"
                                            color="disabled"
                                        />
                                    </Box>
                                    <Box flexGrow={1}>
                                        <Typography>
                                            {translate(
                                                'resources.customers.fields.first_seen'
                                            )}
                                        </Typography>
                                        <DateField
                                            record={record}
                                            source="first_seen"
                                        />
                                    </Box>
                                </Box>
                            </Box>
                            <Box flexGrow={1}>
                                <Box display="flex" mb="1em">
                                    <Box mr="1em">
                                        <AccessTimeIcon
                                            fontSize="small"
                                            color="disabled"
                                        />
                                    </Box>
                                    <Box flexGrow={1}>
                                        <Typography>
                                            {translate(
                                                'resources.customers.fields.last_seen'
                                            )}
                                        </Typography>
                                        <DateField
                                            record={record}
                                            source="last_seen"
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Root>)
    );
};

export default Aside;