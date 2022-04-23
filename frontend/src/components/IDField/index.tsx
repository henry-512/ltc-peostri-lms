/**
* @file It's a React component that takes a source and an id, and if the id is not provided, it generates a
* new one.
* @module IDField
* @category IDField
* @author Braden Cariaga
*/

import { useEffect, useState } from "react";
import { TextInput } from "react-admin";
import { generateBase64UUID } from "src/util/uuidProvider";

export type IDFieldProps = { 
    source: string, 
    id?: string 
}

/**
 * It's a React component that takes a source and an id, and if the id is not provided, it generates a
 * new one.
 * @param {IDFieldProps} props - IDFieldProps
 */
const IDField = ({ source, id }: IDFieldProps) => {
    const [nid, setID] = useState(id);

    /* It's a React hook that runs when the component is mounted. It checks if the id is not provided,
    and if it's not, it generates a new one. */
    useEffect(() => {
        if (!id) {
            setID(generateBase64UUID());
        }
    }, [])

    return (
        <TextInput source={source} disabled defaultValue={nid} sx={{
            display: 'none'
        }} />
    )
}

export default IDField;