import { Typography } from "@mui/material";
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