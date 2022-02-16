import { List, ListProps } from 'react-admin';
import ProjectListGrid from './ProjectListGrid';

const ProjectList = (props: ListProps) => {
     return (
          <div>
               <List {...props}
                    perPage={25}
               >
                    <ProjectListGrid />
               </List>
          </div>
     );
}

export default ProjectList;
