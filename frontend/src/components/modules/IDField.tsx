import { Hidden } from "@material-ui/core";
import get from "lodash.get";
import { useEffect, useState } from "react";
import { TextInput } from "react-admin";
import { useForm } from "react-final-form";
import { generateBase64UUID } from "src/util/uuidProvider";

const IDField = ({source}: {source: string}) => {
     const [id, setID] = useState("");
     const form = useForm();
     const formData = form.getState().values

     useEffect(()=>{
          if (get(formData, source)) {
               setID(get(formData, source));
          } else {
               setID(generateBase64UUID());
          }
     }, [])
     return (
          <Hidden xlDown implementation="css">
               <TextInput source={source} disabled defaultValue={id} initialValue={id}/>
          </Hidden>
     )
}

export default IDField;