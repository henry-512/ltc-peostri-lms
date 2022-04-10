import { Typography } from "@material-ui/core";
import { useTranslate } from "react-admin";

const SectionTitle = ({ label, disableGutter }: { label: string, disableGutter?: boolean }) => {
    const translate = useTranslate();

    return (
        <Typography variant="h6" gutterBottom={disableGutter ? false : true}>
            {translate(label)}
        </Typography>
    );
};

export default SectionTitle;