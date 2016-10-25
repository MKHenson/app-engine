import { IProject } from 'hatchery-editor';

/**
 * Describes each of the project action types
 */
export type ProjectActionType =
    'PROJECT_REQUEST_PENDING' |
    'PROJECT_REQUEST_REJECTED' |
    'PROJECT_CREATED' |
    'PROJECT_OPENED';

/**
 * A base interface for describing project related actions
 */
export interface IProjectAction extends Redux.Action {
    type: ProjectActionType;
    project: IProject;
};