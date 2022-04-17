import CardWithIcon from "./base/CardWithIcon"
import ListAltIcon from '@mui/icons-material/ListAlt';
import { IProject } from "src/util/types";
import { Box, Button, Divider, List, ListItem, ListItemText, Typography } from "@mui/material";
import { LinearProgress, useCreatePath, useGetList, useIsDataLoaded, useTranslate } from "react-admin";
import { Link } from "react-router-dom";
import { dateFormatToString } from "src/util/dateFormatter";
import { getProgressStatusColor } from 'src/util/getProgressStatus';

type ProjectListItemProps = {
    record: IProject
}

const ProjectListItem = ({ record }: ProjectListItemProps) => (
    <Box display="flex" alignItems="center" gap="10px">
        <Box borderRadius="50%" width="12px" height="12px" sx={{
            backgroundColor: (getProgressStatusColor(record.suspense))
        }}></Box>
        <Box display="flex" flexDirection="column">
            <Typography>{record.title}</Typography>
            <Box>
                <Typography variant="caption">({dateFormatToString(record.start)} - {dateFormatToString(record.suspense)})</Typography>
                <Typography variant="caption"> - {record.status}</Typography>
            </Box>
            {/* Add this once value is cached on Backend and sent <LinearProgress variant="determinate" value={calculateProjectProgress()} /> */}
        </Box>
    </Box>
)

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