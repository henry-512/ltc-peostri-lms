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
import { UserCreate, UserEdit, UserList } from './pages/user';
import { TemplateCreate, TemplateEdit, TemplateList } from './pages/template';

const API_URL = process.env.REACT_APP_API_URL + "/" + process.env.REACT_APP_API_VERSION || "http://localhost:5000/api/v1";

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
            <Resource name='templates' list={TemplateList} create={TemplateCreate} edit={TemplateEdit} />
            <Resource name="users" list={UserList} create={UserCreate} edit={UserEdit} />
            <Resource name="userGroups" options={{ label: "layout.menu.permissions" }} />
        </Admin>
    );
}

export default App;
