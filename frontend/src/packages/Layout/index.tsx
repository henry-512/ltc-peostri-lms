import { Layout as RALayout, LayoutProps } from 'react-admin';
import AppBar from './AppBar';
import Menu from '../Menu';

const Layout = (props: LayoutProps) => {
    return <RALayout {...props} appBar={AppBar} menu={Menu} />;
};

export default Layout;