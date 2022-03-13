import {
    AutocompleteInput,
    DateInput,
    ReferenceArrayInput,
    ReferenceInput,
    SearchInput,
    SelectInput,
    TextInput,
} from 'react-admin';
import { IUser } from 'src/util/types';

const UserListFilters = [
    <SearchInput source="q" alwaysOn />,
    <TextInput source="firstName" />,
    <TextInput source="lastName" />,
    <ReferenceInput source="userGroup" reference="userGroups" >
        <SelectInput optionText={choice => `${choice.name}`} />
    </ReferenceInput>
];

export default UserListFilters;