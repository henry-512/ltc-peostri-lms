/**
* @file Customized layout
* @module Layout
* @category Layout
* @author Braden Cariaga
*/

import { Layout as RALayout, LayoutProps } from 'react-admin';
import AppBar from './AppBar';
import Menu from '../Menu';

/**
 * Layout is a function that takes a LayoutProps object and returns a RALayout component with the props
 * passed in and the appBar and menu props set to the AppBar and Menu components.
 * @param {LayoutProps} props - LayoutProps - this is the props that are passed to the Layout
 * component.
 * @returns A React component that is a wrapper around the RALayout component.
 */
const Layout = (props: LayoutProps) => {
    return <RALayout {...props} appBar={AppBar} menu={Menu} />;
};

export default Layout;