import { Hidden } from "@mui/material";
import { useEffect, useState } from "react";
import { TextInput } from "react-admin";
import { generateBase64UUID } from "src/util/uuidProvider";

const IDField = ({source, id}: {source: string, id?: string}) => {
     const [nid, setID] = useState(id);

     useEffect(()=>{
          if (!id) {
               setID(generateBase64UUID());
          }
     }, [])
     return (
          <Hidden xlDown implementation="css">
               <TextInput source={source} disabled defaultValue={nid} />
          </Hidden>
     )
}

export default IDField;