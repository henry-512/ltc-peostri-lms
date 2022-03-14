import get from "lodash.get";
import { useEffect } from "react";
import { AutocompleteArrayInput, useReferenceArrayInputContext } from "react-admin";
import { useForm } from "react-final-form";

const AutoAssignArrayInput = (props: any) => {
     const {
          choices, // An array of records matching both the current input value and the filters
          error, // A potential error that may have occured while fetching the data
          warning, // A potential warning regarding missing references 
          loaded, // boolean that is false until the data is available
          loading, // boolean that is true on mount, and false once the data was fetched
          setFilter, // a callback to update the filters, e.g. setFilters({ q: 'query' })
          setPagination, // a callback to change the pagination, e.g. setPagination({ page: 2, perPage: 50 })
          setSort, // a callback to change the sort, e.g. setSort({ field: 'name', order: 'DESC' })
          setSortForList, // a callback to set the sort with the same signature as the one from the ListContext. This is required to avoid breaking backward compatibility and will be removed in v4
     } = useReferenceArrayInputContext(props);

     const form = useForm();
     const formData = form.getState().values;

     const autoAssign = () => {
          if (!formData.auto_assign) return;
          if (!formData.users) return;
          if (!props.source) return;
          const data = get(formData, props.source)
          if (!data) return;

          choices.forEach((user: any, i: number) => {
               console.log(user.rank.id)
               if (user.rank.id != data.rank) return;
               if (!formData.users.includes(user.id)) return;
               if (typeof data.users != 'undefined' && data.users.includes(user.id)) return;

               form.change(`${props.source}.users`, [...(data.users || []), user.id]);
          })
     }

     useEffect(() => {
          autoAssign();
     });

     return (
          <>
               <AutocompleteArrayInput
                    optionText={choice => `${choice.firstName} ${choice.lastName}`}
                    optionValue="id"
                    helperText=" "
                    fullWidth
                    {...props}
               />
          </>
     )
}

export default AutoAssignArrayInput;