import CardWithIcon from "./base/CardWithIcon"
import ListAltIcon from '@mui/icons-material/ListAlt';
import { IProject } from "src/util/types";
import { Box, Button, List, ListItem, ListItemText } from "@mui/material";
import { useGetList, useIsDataLoaded, useTranslate } from "react-admin";
import { Link } from "react-router-dom";

export type ProjectCountProps = {
    title?: string
}

const MyProjects = (props: ProjectCountProps) => {
    const translate = useTranslate();
    const { data: projects, total, isLoading } = useGetList<IProject>('projects', {
        filter: {},
        sort: { field: 'status', order: 'DESC' },
        pagination: { page: 1, perPage: 100 },
    });

    const display = isLoading ? 'none' : 'block';
    
    return (
        <CardWithIcon icon={ListAltIcon} to={"/projects"} title={props.title || "dashboard.widget.my_projects.title"} subtitle={total}>
            <List sx={{ display }}>
                {projects?.map((record: IProject) => (
                    <ListItem
                        key={record.id}
                        button
                        component={Link}
                        to={`/reviews/${record.id}`}
                        alignItems="flex-start"
                    >
                        <ListItemText
                            primary={record.title}
                            secondary={record.ttc}
                            sx={{
                                overflowY: 'hidden',
                                height: '4em',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                paddingRight: 0,
                            }}
                        />
                    </ListItem>
                ))}
            </List>
            <Box flexGrow={1}>&nbsp;</Box>
            <Button
                sx={{ borderRadius: 0 }}
                component={Link}
                to="/reviews"
                size="small"
                color="primary"
            >
                <Box p={1} sx={{ color: 'primary.main' }}>
                    {translate('dashboard.widget.my_projects.all')}
                </Box>
            </Button>
        </CardWithIcon>
    )
}

export default MyProjects;