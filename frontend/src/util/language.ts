const domainMessages = {
     en: {
          layout: {
               appbar: {
                    title: "PEOSTRI LMS"
               },
               menu: {
                    administration: "Administration",
                    projects: "Projects",
                    templates: "Templates"
               },
               button: {
                    create: "Create",
                    next: "Next",
                    back: "Back",
                    skip: "Skip"
               }
          },
          project: {
               create: {
                    title: "Create a Project",
                    steps: {
                         general: "General Information",
                         modules: "Module Selection",
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
                         usergroup: "User Group",
                         waiver_file: "Drop a File Here, or Click Here to Browse Files"
                    },
                    layout: {
                         general: "Project Information",
                         assign: "Assign Members to Project",
                         auto_assign: "Auto Assign to Tasks by Rank",
                         add_modules: "Add Modules",
                         add_tasks: "Add Tasks",
                         waive_module: "Waive Module",
                         waive_help: "Attach a File or Comment to Waive this Module",
                         order_modules: "Order Modules",
                         order_modules_help: "Drag and Drop the Modules in Order",
                         order_tasks: "Order Tasks",
                         order_tasks_help: "Drag and Drop the Tasks in Order"
                    },
                    warnings: {
                         order_back: "(Returning to the previous page will undo all of your changes)"
                    }
               }
          }
     }
}

export default domainMessages;