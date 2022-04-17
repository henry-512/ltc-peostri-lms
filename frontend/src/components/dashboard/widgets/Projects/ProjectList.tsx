import CardWithIcon from "../base/CardWithIcon"
import ListAltIcon from '@mui/icons-material/ListAlt';
import { IProject } from "src/util/types";
import { Box, Button, Divider, List, ListItem, ListItemText, CircularProgress } from "@mui/material";
import { LinearProgress, SortPayload, useCreatePath, useGetList, useTranslate } from "react-admin";
import { Link } from "react-router-dom";
import ProjectListItem from "./ProjectListItem";

export type ProjectListProps = {
    title?: string
    resource?: string
    filter?: any
    sort?: SortPayload
    showCount?: number
}

const ProjectList = (props: ProjectListProps) => {
    const translate = useTranslate();
    const createPath = useCreatePath();

    const { data: projects, total, isLoading, isError } = useGetList<IProject>(props.resource || 'projects', {
        filter: props.filter || {},
        sort: props.sort || { field: 'suspense', order: 'ASC' },
        pagination: { page: 1, perPage: props.showCount || 8 },
    });

    const display = isLoading ? 'none' : 'block';

    if (isError) return null;
    
    return (
        <CardWithIcon icon={ListAltIcon} to={createPath({ resource: `projects`, type: 'list' })} replace={true} title={props.title || "dashboard.widget.projects.my_title"} subtitle={(isLoading) ? <Box display="flex" justifyContent="center"><LinearProgress /></Box> : (total || "0")}>
            {(projects && projects.length > 0) ? (
                <>
                    <List sx={{ display }}>
                        {projects?.map((record: IProject) => (
                            <ListItem
                                key={record.id}
                                button
                                component={Link}
                                to={createPath({ resource: `projects`, id: record.id, type: 'show' })}
                                replace={true}
                                alignItems="flex-start"
                                sx={{
                                    transition: 'all .2s',
                                    color: (theme) => theme.palette.primary.main,
                                    '&:hover': {
                                        backgroundColor: (theme) => theme.palette?.borderColor?.main,
                                        transition: 'all .2s'
                                    }
                                }}
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
                    <Divider />
                    <Button
                        sx={{ borderRadius: 0 }}
                        component={Link}
                        to={createPath({ resource: props.resource || `projects`, type: 'list' })}
                        replace={true}
                        size="small"
                        color="primary"
                    >
                        <Box p={1} sx={{ color: 'primary.main' }}>
                            {translate('dashboard.widget.projects.all')}
                        </Box>
                    </Button>
                </>
            ) : null }
        </CardWithIcon>
    )
}

export default ProjectList;