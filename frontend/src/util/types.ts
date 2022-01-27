import { ReduxState } from "react-admin";

import * as LMSTypes from '../../../lms/types'

export const LMS = LMSTypes;

export type ThemeName = 'light' | 'dark';

export interface AppState extends ReduxState {
     theme: ThemeName;
}