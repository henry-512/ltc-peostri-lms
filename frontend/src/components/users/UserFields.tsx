import { Box, Theme } from "@mui/material";
import { styled } from '@mui/material/styles';
import { AutocompleteArrayInput, BooleanInput, email, PasswordInput, ReferenceArrayInput, ReferenceInput, required, SelectInput, TextInput } from "react-admin";
import { SectionTitle } from "src/components/misc";
import AutoFillUserName from "./AutoFillUserName";

const PREFIX = 'UserFields';

const classes = {
    username: `${PREFIX}-username`,
    use_email: `${PREFIX}-use_email`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')({
    [`& .${classes.username}`]: {
        width: "75%",
        flexShrink: 3
    },
    [`& .${classes.use_email}`]: {
        width: "25%",
        flexGrow: 3
    }
});

export default function UserFields(props: any) {
    
    return (
        <Root>
            <Box display="flex" justifyContent="flex-start" width="100%" style={{
                    gap: "32px"
                }}>
                <Box display="flex" width="calc(50% - 16px)" flexDirection="column">
                    <SectionTitle label="user.layout.identity" />
                    <Box display="flex" style={{
                        gap: "32px"
                    }}>
                        <TextInput
                            autoFocus
                            source="firstName"
                            style={{
                                width: "calc(50% - 16px)"
                            }}
                            validate={[required()]}
                            helperText=" "
                        />
                        <TextInput
                            source="lastName"
                            style={{
                                width: "calc(50% - 16px)"
                            }}
                            validate={[required()]}
                            helperText=" "
                        />
                    </Box>
                    <Box>
                        <TextInput
                            type="email"
                            source="email"
                            validate={[required(), email()]}
                            helperText=" "
                            fullWidth
                        />
                        <TextInput
                            type="avatar"
                            source="avatar"
                            validate={[required()]}
                            helperText=" "
                            fullWidth
                        />
                    </Box>
                </Box>
                <Box width="calc(50% - 16px)" display="flex" flexDirection="column">
                    <SectionTitle label="user.layout.permissions" />
                    <ReferenceInput
                        label="project.fields.rank"
                        reference="ranks"
                        source="rank"
                        style={{
                            width: '50%'
                        }}
                    >
                        <SelectInput
                            optionText={choice => `${choice.name}`}
                            optionValue="id"
                            helperText=" "
                        />
                    </ReferenceInput>
                    <SelectInput
                        source="status"
                        choices={[
                            { id: 'ACTIVE', name: 'ACTIVE' },
                            { id: 'LOCKED', name: 'LOCKED' },
                            { id: 'INACTIVE', name: 'INACTIVE' },
                            { id: 'SUSPENDED', name: 'SUSPENDED' }
                        ]}
                        optionText={choice => `${choice.name}`}
                        optionValue="id"
                        disabled={false}
                        defaultValue="ACTIVE"
                        validate={[required()]}
                        helperText=" "
                        style={{
                            width: '50%'
                        }}
                    />
                    <ReferenceArrayInput reference="admin/teams" source="teams">
                        <AutocompleteArrayInput 
                            optionText={choice => `${choice.name}`} 
                            optionValue="id" 
                            source="teams"
                            fullWidth
                        />
                    </ReferenceArrayInput>
                </Box>
            </Box>
            <SectionTitle label="user.layout.security" />
            <Box display="flex" width="50%" flexDirection="column">
                <Box display="flex" alignItems="center" style={{
                    gap: "32px"
                }}>
                    <AutoFillUserName
                        className={classes.username}
                        validate={[required()]}
                    />
                    <BooleanInput label="user.layout.use_email" source="useEmail" className={classes.use_email} helperText=" " />
                </Box>
                <Box display="flex" style={{
                    gap: "32px"
                }}>
                    <PasswordInput
                        source="password"
                        style={{
                            width: "calc(50% - 16px)"
                        }}
                        helperText=" "
                    />
                    <PasswordInput
                        source="confirm_password"
                        style={{
                            width: "calc(50% - 16px)"
                        }}
                        helperText=" "
                    />
                </Box>
            </Box>
        </Root>
    );
}