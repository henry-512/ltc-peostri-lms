import { Typography } from "@material-ui/core";
import { useTranslate } from "react-admin";

const SectionTitle = ({ label }: { label: string }) => {
    const translate = useTranslate();

    return (
        <Typography variant="h6" gutterBottom>
            {translate(label)}
        </Typography>
    );
};

export default SectionTitle;