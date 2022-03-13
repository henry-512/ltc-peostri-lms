import { List, ListProps } from 'react-admin';
import UserListGrid from './UserListGrid';

const UserList = (props: ListProps) => {
     return (
          <>
               <List {...props}
                    perPage={25}
               >
                    <UserListGrid />
               </List>
          </>
     );
}

export default UserList;
