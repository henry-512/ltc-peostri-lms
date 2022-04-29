/**
* @file Toolbar used on the Admin Users Edit and Create
* @module UserToolbar
* @category UserToolbar
* @author Braden Cariaga
*/

import { Box } from "@mui/material"
import { DeleteButton, SaveButton, Toolbar, ToolbarProps } from "react-admin"
import { useFormState } from "react-hook-form";

export interface UserToolbarProps extends ToolbarProps {
    create: boolean;
}

/**
 * Toolbar used on the Admin Users Edit and Create
 * @param {UserToolbarProps} props - UserToolbarProps
 */
export default function UserToolbar(props: UserToolbarProps) {
    const { isValid, isDirty } = useFormState();

    return (
        <Toolbar {...props}>
            {(!props.create) ? (
                <DeleteButton
                    label={"layout.button.delete"}
                    redirect="list"
                    variant="outlined"
                    style={{
                        borderColor: '#f44336',
                        padding: '6px 16px',
                        marginRight: '8px'
                    }}
                />
            ) : (
                <></>
            )}
            <Box sx={{ flex: '1 1 auto' }} />
            <SaveButton
                label={(props.create) ? "layout.button.create" : "layout.button.save"}
                disabled={(!isValid || !isDirty) ? true : false}
            />
        </Toolbar>
    )
}