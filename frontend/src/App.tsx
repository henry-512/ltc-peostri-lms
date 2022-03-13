import { Admin, Resource } from 'react-admin';
import dataProvider from './util/dataProvider';
import { ProjectList, ProjectCreate, ProjectEdit } from './pages/project';
import routes from './util/routes';
import { Layout } from './components/layout';
import DashboardComponent from './pages/dashboard';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';
import domainMessages from './util/language';
import auth from './util/authProvider';
import LoginPage from './pages/login';

const API_URL = process.env.REACT_APP_API_URL + "/" + process.env.REACT_APP_API_VERSION || "";

const messages: any = {
    en: { ...englishMessages, ...domainMessages.en }
};

const i18nProvider = polyglotI18nProvider(locale => messages[locale]);

const App = () => {
    return (
        //Setup for React Admin
        <Admin
            title="PEO STRI LMS"
            dataProvider={dataProvider(API_URL)}
            authProvider={auth}
            loginPage={LoginPage}
            customRoutes={routes}
            layout={Layout}
            dashboard={DashboardComponent}
            locale="en"
            i18nProvider={i18nProvider}
            disableTelemetry
        >
            <Resource name='projects' list={ProjectList} create={ProjectCreate} edit={ProjectEdit} />
            <Resource name="users" />
            <Resource name="userGroups" />
        </Admin>
    );
}

export default App;
