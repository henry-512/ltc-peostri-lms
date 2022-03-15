import { Box, makeStyles, Theme, Typography } from "@material-ui/core";
import { Styles } from "@material-ui/core/styles/withStyles";
import { BooleanInput, Create, CreateProps, DateInput, email, PasswordInput, ReferenceInput, required, SelectInput, SimpleForm, TextInput, useTranslate } from "react-admin";
import { AnyObject } from "react-final-form";
import { AutoFillUserName } from "src/components/users";

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

export const validatePasswords = ({
    password,
    confirm_password,
}: AnyObject) => {
    const errors = {} as any;

    if (password && confirm_password && password !== confirm_password) {
        errors.confirm_password = [
            'resources.customers.errors.password_mismatch',
        ];
    }

    return errors;
};

const UserCreate = (props: CreateProps) => {
    const classes = useStyles(props);
    const date = new Date();
    return (
        <Create {...props}>
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
                                validate={requiredValidate}
                            />
                            <TextInput
                                source="lastName"
                                style={{
                                    width: "calc(50% - 16px)"
                                }}
                                formClassName={classes.last_name}
                                validate={requiredValidate}
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
                                validate={requiredValidate}
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
                            validate={requiredValidate}
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
        </Create>
    );
};

const requiredValidate = [required()];

const SectionTitle = ({ label }: { label: string }) => {
    const translate = useTranslate();

    return (
        <Typography variant="h6" gutterBottom>
            {translate(label)}
        </Typography>
    );
};

const Separator = () => <Box pt="1em" />;

export default UserCreate