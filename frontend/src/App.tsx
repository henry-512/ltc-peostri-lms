/**
* @file Main App File
* @module App
* @category Global
* @author Braden Cariaga
*/

import { Admin, CustomRoutes, EditGuesser, ListGuesser, Resource, ShowGuesser } from 'react-admin';
import dataProvider from './util/dataProvider';
import { AdminProjectList, AdminProjectCreate, AdminProjectEdit } from './pages/administration/project';
import DashboardPage from './pages/dashboard';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';
import domainMessages from 'src/config/language';
import auth from './util/authProvider';
import LoginPage from './pages/login';
import { UserCreate, UserEdit, UserList } from './pages/administration/users';
import { TeamCreate, TeamEdit, TeamList } from './pages/administration/teams';
import { AdminFilesList } from './pages/administration/files';
import { ProjectTemplateCreate, ProjectTemplateEdit, ProjectTemplateList } from './pages/template/projects';
import { ModuleTemplateCreate, ModuleTemplateEdit, ModuleTemplateList } from './pages/template/modules';
import Layout from 'src/components/Layout';
import { ProjectShow, ProjectList } from './pages/projects';
import { ModuleShow } from './pages/modules';
import { lightTheme } from 'src/config/themes';
import { Navigate, Route } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL + "/" + process.env.REACT_APP_API_VERSION || "http://localhost:5000/api/v1";

const messages: any = {
    en: { ...englishMessages, ...domainMessages.en }
};

const i18nProvider = polyglotI18nProvider(locale => messages[locale], 'en');

const App = () => {
    return (
        //Setup for React Admin
        <Admin
            title="PEO STRI LMS"
            dataProvider={dataProvider(API_URL)}
            authProvider={auth}
            loginPage={LoginPage}
            layout={Layout}
            dashboard={DashboardPage}
            i18nProvider={i18nProvider}
            disableTelemetry
            theme={lightTheme}
            requireAuth
        >
            <Resource name='admin/projects' list={AdminProjectList} create={AdminProjectCreate} edit={AdminProjectEdit} show={ShowGuesser} />

            <Resource name='admin/template/projects' list={ProjectTemplateList} create={ProjectTemplateCreate} edit={ProjectTemplateEdit} show={ShowGuesser} />
            <Resource name='admin/template/modules' list={ModuleTemplateList} create={ModuleTemplateCreate} edit={ModuleTemplateEdit} show={ShowGuesser} />

            <Resource name="admin/users" list={UserList} create={UserCreate} edit={UserEdit} show={ShowGuesser} />
            <Resource name="admin/files" list={AdminFilesList} />

            <Resource name="admin/ranks" options={{ label: "layout.menu.ranks" }} show={ShowGuesser} list={ListGuesser} edit={EditGuesser}  />
            <Resource name="admin/teams" options={{ label: "layout.menu.teams" }} show={ShowGuesser} list={TeamList} create={TeamCreate} edit={TeamEdit}  />

            <Resource name="tasks" options={{ label: "layout.menu.my_tasks" }} show={ShowGuesser} />
            <Resource name="modules" options={{ label: "layout.menu.my_tasks" }} show={ModuleShow}  />
            <Resource name="projects" options={{ label: "layout.menu.my_projects" }} show={ProjectShow} list={ProjectList} />
            <Resource name="projects/all" options={{ label: "layout.menu.my_projects" }} list={ProjectList} />
            <Resource name="projects/team" options={{ label: "layout.menu.my_projects" }} list={ProjectList} />
            <Resource name="notifications" list={ListGuesser} />

            <CustomRoutes>
                <Route path="/modules" element={<Navigate to="/projects" />} />
            </CustomRoutes>
        </Admin>
    );
}

export default App;
