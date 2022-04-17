import React from 'react';
import EventItem from './EventItem';

const styles = {
    root: {
        width: 600,
    },
};

const EventListView = ({ events = [], classes }) => (
    <Card className={classes.root}>
        <List>
            {events.map(event => (
                <EventItem event={event} key={event.id} />
            ))}
        </List>
    </Card>
);

const EventList = withStyles(styles)(EventListView);

export default EventList;
