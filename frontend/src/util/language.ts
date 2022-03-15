const domainMessages = {
    en: {
        layout: {
            appbar: {
                title: "PEOSTRI LMS"
            },
            menu: {
                administration: "Administration",
                projects: "Projects",
                templates: "Templates",
                users: "Users",
                permissions: "Permissions"
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
        project: {
            edit: {
                title: "Editing Project"
            },
            create: {
                title: "Creating Project",
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
                waiver_file: "Drop a File Here, or Click Here to Browse Files"
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
                edit_task: "Editing Task: %{title}"
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
                username: "Username"
            },
            layout: {
                identity: "Identity",
                security: "Security",
                permissions: "Permissions",
                use_email: "Use Email?"
            }
        }
    }
}

export default domainMessages;