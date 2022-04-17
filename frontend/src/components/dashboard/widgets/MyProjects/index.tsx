import CardWithIcon from "../base/CardWithIcon"
import ListAltIcon from '@mui/icons-material/ListAlt';
import { IProject } from "src/util/types";
import { Box, Button, Divider, List, ListItem, ListItemText } from "@mui/material";
import { LinearProgress, useCreatePath, useGetList, useIsDataLoaded, useTranslate } from "react-admin";
import { Link } from "react-router-dom";
import ProjectListItem from "./ProjectListItem";

export type ProjectCountProps = {
    title?: string
}

const MyProjects = (props: ProjectCountProps) => {
    const translate = useTranslate();
    const createPath = useCreatePath();

    const { data: projects, total, isLoading } = useGetList<IProject>('projects', {
        filter: {},
        sort: { field: 'status', order: 'DESC' },
        pagination: { page: 1, perPage: 8 },
    });

    const display = isLoading ? 'none' : 'block';
    
    return (
        <CardWithIcon icon={ListAltIcon} to={createPath({ resource: `projects`, type: 'list' })} replace={true} title={props.title || "dashboard.widget.my_projects.title"} subtitle={total}>
            {(projects) ?
                <List sx={{ display }}>
                    {projects?.map((record: IProject) => (
                        <ListItem
                            key={record.id}
                            button
                            component={Link}
                            to={createPath({ resource: `projects`, id: record.id, type: 'show' })}
                            replace={true}
                            alignItems="flex-start"
                        >
                            <ListItemText
                                primary={<ProjectListItem record={record} />}
                                sx={{
                                    overflowY: 'hidden',
                                    height: 'auto',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    paddingRight: 0,
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            : (isLoading) ? 
                <Box display="flex" justifyContent="center"><LinearProgress /></Box> 
            : null }
            <Divider />
            <Button
                sx={{ borderRadius: 0 }}
                component={Link}
                to={createPath({ resource: `projects`, type: 'list' })}
                replace={true}
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