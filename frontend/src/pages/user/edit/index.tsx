import { Box, makeStyles, Theme } from "@material-ui/core";
import { Styles } from "@material-ui/core/styles/withStyles";
import { BooleanInput, Edit, EditActionsProps, email, PasswordInput, ReferenceInput, required, SelectInput, ShowButton, SimpleForm, TextInput, TopToolbar, useTranslate } from "react-admin";
import { AutoFillUserName, SectionTitle, Separator } from "src/components/users";
import transformer from "../transformer";
import { validatePasswords } from "../validation";

export const styles: Styles<Theme, any> = {
    username: {
        width: "75%",
        flexShrink: 3
    },
    use_email: {
        width: "25%",
        flexGrow: 3
    }
};

const useStyles = makeStyles(styles);

const UserEditToolbar = ({ basePath, data, resource }: EditActionsProps) => (
    <TopToolbar>
        <ShowButton basePath={basePath} record={data} />
    </TopToolbar>
)

const UserEdit = (props: any) => {
    const translate = useTranslate();
    const classes = useStyles(props);

    return (
        <Edit title={translate('user.edit.title')} {...props} transform={transformer} actions={<UserEditToolbar />}>
            <SimpleForm
                validate={validatePasswords}
            >
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
                            />
                            <TextInput
                                source="lastName"
                                style={{
                                    width: "calc(50% - 16px)"
                                }}
                                formClassName={classes.last_name}
                                validate={[required()]}
                            />
                        </Box>
                        <Box>
                            <TextInput
                                type="email"
                                source="email"
                                validation={{ email: true }}
                                formClassName={classes.email}
                                validate={[required(), email()]}
                                fullWidth
                            />
                            <TextInput
                                type="avatar"
                                source="avatar"
                                validate={[required()]}
                                fullWidth
                            />
                        </Box>
                    </Box>
                    <Box width="calc(50% - 16px)">
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
                    </Box>
                </Box>
                <Separator />
                <SectionTitle label="user.layout.security" />
                <Box display="flex" width="50%" flexDirection="column">
                    <Box display="flex" alignItems="center" style={{
                        gap: "32px"
                    }}>
                        <AutoFillUserName
                            className={classes.username}
                            validate={[required()]}
                        />
                        <BooleanInput label="user.layout.use_email" source="useEmail" className={classes.use_email} />
                    </Box>
                    <Box display="flex" style={{
                        gap: "32px"
                    }}>
                        <PasswordInput
                            source="password"
                            formClassName={classes.password}
                            style={{
                                width: "calc(50% - 16px)"
                            }}
                        />
                        <PasswordInput
                            source="confirm_password"
                            formClassName={classes.confirm_password}
                            style={{
                                width: "calc(50% - 16px)"
                            }}
                        />
                    </Box>
                </Box>
            </SimpleForm>
        </Edit>
    )
}

export default UserEdit;