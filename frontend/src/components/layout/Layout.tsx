import { useSelector } from 'react-redux';
import { Layout, LayoutProps } from 'react-admin';
import AppBar from './AppBar';
import Menu from './Menu';
import { darkTheme, lightTheme } from '../../util/themes';
import { AppState } from '../../util/types';

export default (props: LayoutProps) => {
    const theme = useSelector((state: AppState) =>
        state.theme === 'dark' ? darkTheme : lightTheme
    );
    return <Layout {...props} appBar={AppBar} menu={Menu} theme={theme} />;
};
