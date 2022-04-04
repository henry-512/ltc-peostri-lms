import { Admin, EditGuesser, ListGuesser, Resource, ShowGuesser } from 'react-admin';
import dataProvider from './util/dataProvider';
import { ProjectList, ProjectCreate, ProjectEdit } from './pages/administration/project';
import routes from './util/routes';
import { Layout } from './components/layout';
import DashboardPage from './pages/dashboard';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';
import domainMessages from './util/language';
import auth from './util/authProvider';
import LoginPage from './pages/login';
import { UserCreate, UserEdit, UserList } from './pages/administration/user';
import { ProjectTemplateCreate, ProjectTemplateEdit, ProjectTemplateList } from './pages/template/projects';
import { ModuleTemplateCreate, ModuleTemplateEdit, ModuleTemplateList } from './pages/template/modules';

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
            dashboard={DashboardPage}
            locale="en"
            i18nProvider={i18nProvider}
            disableTelemetry
        >
            <Resource name='projects/list' list={ProjectList} create={ProjectCreate} edit={ProjectEdit} show={ShowGuesser} />

            <Resource name='template/projects/list' list={ProjectTemplateList} create={ProjectTemplateCreate} edit={ProjectTemplateEdit} show={ShowGuesser} />
            <Resource name='template/modules/list' list={ModuleTemplateList} create={ModuleTemplateCreate} edit={ModuleTemplateEdit} show={ShowGuesser} />

            <Resource name="users/list" list={UserList} create={UserCreate} edit={UserEdit} show={ShowGuesser} />
            <Resource name="users/tasks/list" options={{ label: "layout.menu.my_tasks" }} show={ShowGuesser} list={ListGuesser} edit={EditGuesser}  />
            <Resource name="users/projects/list" options={{ label: "layout.menu.my_projects" }} show={ShowGuesser} list={ListGuesser} edit={EditGuesser}  />

            <Resource name="ranks/list" options={{ label: "layout.menu.ranks" }} show={ShowGuesser} list={ListGuesser} edit={EditGuesser}  />
            
        </Admin>
    );
}

export default App;
