import { List, ListProps } from 'react-admin';
import ProjectListGrid from './ProjectListGrid';

const ProjectList = (props: ListProps) => {
     return (
          <>
               <List {...props}
                    perPage={25}
               >
                    <ProjectListGrid />
               </List>
          </>
     );
}

export default ProjectList;
