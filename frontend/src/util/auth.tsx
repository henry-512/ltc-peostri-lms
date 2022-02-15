import { LoginInformation } from 'src/util/types'
import { AuthProvider } from "react-admin";

// TODO: Setup Auth Provider

export default {
     login: (info: LoginInformation) => {
          return Promise.resolve([info.username, info.password]);
     },
     logout: (error: any) => {
          return Promise.resolve();
     },
     checkError: () => {
          return Promise.resolve();
     },
     checkAuth: () => {
          return Promise.resolve();
     },
     getPermissions: () => {
          return Promise.resolve();
     }
} as AuthProvider;