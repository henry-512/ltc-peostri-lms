
/**
* @file Administration Team List file.
* @module AdministrationTeamList
* @category AdministrationTeamPage
* @author Braden Cariaga
*/

import { Datagrid, FieldProps, List, ListProps, ReferenceArrayField, SingleFieldList, TextField } from 'react-admin';
import UserChip from 'src/components/UserChip';
import { ITeam } from 'src/util/types';

export interface TeamListProps extends FieldProps<ITeam>, ListProps {
    
}

const TeamList = (props: TeamListProps) => {
    return (
        <List {...props}
            perPage={25}
        >
            <Datagrid
                sx={{
                    [`& .RaDatagrid-headerRow`]: {
                        borderLeftColor: 'transparent',
                        borderLeftWidth: 5,
                        borderLeftStyle: 'solid',
                    }
                }}
                rowClick="edit"
            >
                <TextField source="name" label="team.info.name" />
                <ReferenceArrayField source="users" reference="admin/users" label="team.info.users" >
                    <SingleFieldList linkType="show">
                        <UserChip />
                    </SingleFieldList>
                </ReferenceArrayField>
            </Datagrid>
        </List>
    );
}

export default TeamList;
