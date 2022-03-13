import { Box, makeStyles, Theme, Typography } from "@material-ui/core";
import { Styles } from "@material-ui/core/styles/withStyles";
import { Create, CreateProps, DateInput, email, PasswordInput, ReferenceInput, required, SelectInput, SimpleForm, TextInput, useTranslate } from "react-admin";
import { AnyObject } from "react-final-form";

export const styles: Styles<Theme, any> = {
    first_name: { display: 'inline-block' },
    last_name: { display: 'inline-block', marginLeft: 32 },
    email: { width: 544 },
    address: { maxWidth: 544 },
    zipcode: { display: 'inline-block' },
    city: { display: 'inline-block', marginLeft: 32 },
    comment: {
        maxWidth: '20em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    password: { display: 'inline-block' },
    confirm_password: { display: 'inline-block', marginLeft: 32 },
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
                // Here for the GQL provider
                initialValues={{
                    birthday: date,
                    first_seen: date,
                    last_seen: date,
                    has_ordered: false,
                    latest_purchase: date,
                    has_newsletter: false,
                    groups: [],
                    nb_commands: 0,
                    total_spent: 0,
                }}
                validate={validatePasswords}
            >
                <SectionTitle label="resources.customers.fieldGroups.identity" />
                <TextInput
                    autoFocus
                    source="firstName"
                    formClassName={classes.first_name}
                    validate={requiredValidate}
                />
                <TextInput
                    source="lastName"
                    formClassName={classes.last_name}
                    validate={requiredValidate}
                />
                <TextInput
                    source="userName"
                    formClassName={classes.last_name}
                    validate={requiredValidate}
                />
                <TextInput
                    type="email"
                    source="email"
                    validation={{ email: true }}
                    fullWidth
                    formClassName={classes.email}
                    validate={[required(), email()]}
                />
                <Separator />
                <ReferenceInput 
                    label="project.fields.usergroup"
                    reference="userGroups"
                    source="userGroup"
                >
                    <SelectInput
                        optionText={choice => `${choice.name}`}
                        optionValue="id"
                        helperText=" "
                        fullWidth
                    />
                </ReferenceInput>
                <Separator />
                <SectionTitle label="resources.customers.fieldGroups.password" />
                <PasswordInput
                    source="password"
                    formClassName={classes.password}
                />
                <PasswordInput
                    source="confirm_password"
                    formClassName={classes.confirm_password}
                />
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