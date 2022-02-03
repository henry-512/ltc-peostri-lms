import { Edit, SimpleForm, TextInput } from "react-admin";
import { useTranslate } from 'react-admin';

const ProjectEdit = (props: any) => {
     const translate = useTranslate();

     return (
          <Edit {...props}>
               <SimpleForm>
                    <TextInput source="start" />
                    <TextInput source="end" />
               </SimpleForm>
          </Edit>
     )
}

export default ProjectEdit;