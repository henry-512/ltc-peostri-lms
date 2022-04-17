import { ListController, Title } from 'react-admin';
import Timeline from '.';

export default props => (
    <ListController {...props}>
        {controllerProps => (
            <>
                <Title title="Events" />
                <Timeline {...controllerProps} />
            </>
        )}
    </ListController>
);
