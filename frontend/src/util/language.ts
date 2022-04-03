const domainMessages = {
    en: {
        layout: {
            appbar: {
                title: "PEOSTRI LMS",
                notifications: "Notifications"
            },
            menu: {
                administration: "Administration",
                projects: "Projects",
                modules: "Modules",
                templates: "Templates",
                project_templates: "Project Templates",
                module_templates: "Module Templates",
                users: "Users",
                permissions: "Permissions",
                my_tasks: "My Tasks",
                my_projects: "My Projects"
            },
            button: {
                create: "Create",
                next: "Next",
                back: "Back",
                skip: "Skip",
                save: "Save",
                delete: "Delete"
            }
        },
        login: {

        },
        dashboard: {
            widget: {
                project_count: {
                    title: "Awaiting Projects"
                },
                task_count: {
                    title: "Awaiting Tasks"
                }
            }
        },
        project: {
            edit: {
                title: "Editing Project"
            },
            create: {
                title: "Creating Project",
                from_template: "Create From Template"
            },
            steps: {
                general: "General Information",
                modules: "Module Management",
                order: "Module Order",
                review: "Review"
            },
            fields: {
                title: "Title",
                start: "Start Date",
                end: "End Date",
                member: "Assign Members",
                module_title: "Module Title",
                module_status: "Module Status",
                task_title: "Task Title",
                task_type: "Task Type",
                task_status: "Task Status",
                rank: "Rank",
                waiver_file: "Drop a File Here, or Click Here to Browse Files",
                suspense: "Suspense Date"
            },
            layout: {
                general: "Project Information",
                assign: "Assign Members to Project",
                auto_assign: "Auto Assign to Tasks by Rank",
                waive_module: "Waive Module",
                waive_help: "Attach a File or Comment to Waive this Module",
                module_title: "Module Management",
                order_modules_help: "Drag and Drop the Modules in Order",
                order_tasks_help: "Drag and Drop the Tasks in Order",
                create_module: "Add Module",
                create_task: "Add Task",
                add_step: "Add Step",
                save: "Save",
                create: "Create",
                cancel: "Cancel",
                no_modules: "Add a Module to this Project",
                task_title: "Task Management",
                no_tasks: "Add a Task to this Module",
                edit_module: "Editing Module: %{title}",
                edit_task: "Editing Task: %{title}",
                add_module_template: "Add Module Template",
                add_module_template_button: "Add Template",
                select_module_template: "Select a Module Template",
                select_template: "Select a Project Template"
            }
        },
        tasks: {
            types: {
                document_upload: "Upload",
                document_review: "Review",
                document_approve: "Approve",
                module_waiver: "Waiver",
                module_waiver_approval: "Waiver Approval"
            }
        },
        user: {
            info: {
                first_name: "First Name",
                last_name: "Last Name",
                rank: "Rank",
                username: "Username",
                email: "Email",
                first_visited: "First Login",
                last_visited: "Last Login",
                status: "Status"
            },
            layout: {
                identity: "Identity",
                security: "Security",
                permissions: "Permissions",
                use_email: "Use Email?",
                create_title: "Create a User",
                edit_title: "Editing User: %{name}"
            }
        },
        template: {
            module: {
                layout: {
                    general: "General Information",
                    create_title: "Create Module Template",
                    edit_title: "Editing Project Template",
                },
                fields: {
                    ttc: "Est. Time to Completion (in days)",
                    ttc_help: "Calculated Based on Tasks",
                    ttc_short: "TTC",
                    title: "Module Name",
                    status: "Status"
                },
                steps: {
                    general: "General Information",
                    tasks: "Task Management"
                }
            },
            project: {
                layout: {
                    general: "General Information",
                    create_title: "Create Project Template",
                    edit_title: "Editing Project Template",
                },
                fields: {
                    ttc: "Est. Time to Completion (in days)",
                    ttc_help: "Calculated Based on Modules",
                    ttc_short: "TTC",
                    title: "Project Name",
                    status: "Status"
                },
                steps: {
                    general: "General Information",
                    tasks: "Module Management"
                }
            }
        },
        resources: {
            users: {
                name: "Users",
                fields: {
                    first_name: "First Name",
                    last_name: "Last Name",
                    rank: "Rank",
                    username: "Username",
                    email: "Email",
                    status: "Status"
                }
            },
            'template/projects/list': {
                name: "Project Templates"
            },
            'template/modules/list': {
                name: "Module Templates"
            },
            'projects/list': {
                name: "Projects"
            },
            'ranks/list': {
                name: "Ranks"
            },
            'users/list': {
                name: "Users"
            }
        },
        ra: {
            action: {
                add_filter: 'Add filter',
                add: 'Add',
                back: 'Go Back',
                bulk_actions: '1 item selected |||| %{smart_count} items selected',
                cancel: 'Cancel',
                clear_input_value: 'Clear value',
                clone: 'Clone',
                confirm: 'Confirm',
                create: 'Create',
                create_item: 'Create %{item}',
                delete: 'Delete',
                edit: 'Edit',
                export: 'Export',
                list: 'List',
                refresh: 'Refresh',
                remove_filter: 'Remove this filter',
                remove: 'Remove',
                save: 'Save',
                search: 'Search',
                select_all: 'Select all',
                select_row: 'Select this row',
                show: 'View',
                sort: 'Sort',
                undo: 'Undo',
                unselect: 'Unselect',
                expand: 'Expand',
                close: 'Close',
                open_menu: 'Open menu',
                close_menu: 'Close menu',
                update: 'Update',
                move_up: 'Move up',
                move_down: 'Move down',
            },
            boolean: {
                true: 'Yes',
                false: 'No',
                null: ' ',
            },
            page: {
                create: 'Create %{name}',
                dashboard: 'Dashboard',
                edit: '%{name} #%{id}',
                error: 'Something went wrong',
                list: '%{name}',
                loading: 'Loading',
                not_found: 'Not Found',
                show: '%{name} #%{id}',
                empty: 'No %{name} yet.',
                invite: 'Do you want to add one?',
            },
            input: {
                file: {
                    upload_several:
                        'Drop some files to upload, or click to select one.',
                    upload_single: 'Drop a file to upload, or click to select it.',
                },
                image: {
                    upload_several:
                        'Drop some pictures to upload, or click to select one.',
                    upload_single:
                        'Drop a picture to upload, or click to select it.',
                },
                references: {
                    all_missing: 'Unable to find references data.',
                    many_missing:
                        'At least one of the associated references no longer appears to be available.',
                    single_missing:
                        'Associated reference no longer appears to be available.',
                },
                password: {
                    toggle_visible: 'Hide password',
                    toggle_hidden: 'Show password',
                },
            },
            message: {
                about: 'About',
                are_you_sure: 'Are you sure?',
                bulk_delete_content:
                    'Are you sure you want to delete this %{name}? |||| Are you sure you want to delete these %{smart_count} items?',
                bulk_delete_title:
                    'Delete %{name} |||| Delete %{smart_count} %{name}',
                bulk_update_content:
                    'Are you sure you want to update this %{name}? |||| Are you sure you want to update these %{smart_count} items?',
                bulk_update_title:
                    'Update %{name} |||| Update %{smart_count} %{name}',
                delete_content: 'Are you sure you want to delete this item?',
                delete_title: 'Delete %{name} #%{id}',
                details: 'Details',
                error:
                    "A client error occurred and your request couldn't be completed.",
                invalid_form: 'The form is not valid. Please check for errors',
                loading: 'The page is loading, just a moment please',
                no: 'No',
                not_found:
                    'Either you typed a wrong URL, or you followed a bad link.',
                yes: 'Yes',
                unsaved_changes:
                    "Some of your changes weren't saved. Are you sure you want to ignore them?",
            },
            navigation: {
                no_results: 'No results found',
                no_more_results:
                    'The page number %{page} is out of boundaries. Try the previous page.',
                page_out_of_boundaries: 'Page number %{page} out of boundaries',
                page_out_from_end: 'Cannot go after last page',
                page_out_from_begin: 'Cannot go before page 1',
                page_range_info: '%{offsetBegin}-%{offsetEnd} of %{total}',
                page_rows_per_page: 'Rows per page:',
                next: 'Next',
                prev: 'Prev',
                skip_nav: 'Skip to content',
            },
            sort: {
                sort_by: 'Sort by %{field} %{order}',
                ASC: 'ascending',
                DESC: 'descending',
            },
            auth: {
                auth_check_error: 'Please login to continue',
                user_menu: 'Profile',
                username: 'Username',
                password: 'Password',
                sign_in: 'Sign in',
                sign_in_error: 'Authentication failed, please retry',
                logout: 'Logout',
            },
            notification: {
                updated: 'Element updated |||| %{smart_count} elements updated',
                created: 'Element created',
                deleted: 'Element deleted |||| %{smart_count} elements deleted',
                bad_item: 'Incorrect element',
                item_doesnt_exist: 'Element does not exist',
                http_error: 'Server communication error',
                data_provider_error:
                    'dataProvider error. Check the console for details.',
                i18n_error:
                    'Cannot load the translations for the specified language',
                canceled: 'Action cancelled',
                logged_out: 'Your session has ended, please reconnect.',
                not_authorized: "You're not authorized to access this resource.",
            },
            validation: {
                required: 'Required',
                minLength: 'Must be %{min} characters at least',
                maxLength: 'Must be %{max} characters or less',
                minValue: 'Must be at least %{min}',
                maxValue: 'Must be %{max} or less',
                number: 'Must be a number',
                email: 'Must be a valid email',
                oneOf: 'Must be one of: %{options}',
                regex: 'Must match a specific format (regexp): %{pattern}',
            },
        }
    }
}

export default domainMessages;