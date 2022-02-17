import { useEffect } from "react";
import { AutocompleteArrayInput, useReferenceArrayInputContext } from "react-admin";
import { useForm } from "react-final-form";

const AutoAssignArrayInput = (props: any): JSX.Element => {
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
          if (!formData[props.mName][props.mID][props.tName][props.tID]) return;
          if (!formData[props.mName][props.mID][props.tName][props.tID].userGroup) return;

          choices.forEach((user: any, i: number) => {
               if (user.userGroup.id != formData[props.mName][props.mID][props.tName][props.tID].userGroup) return;
               if (!formData.users.includes(user.id)) return;
               if (typeof formData[props.mName][props.mID][props.tName][props.tID].users != 'undefined' && formData[props.mName][props.mID][props.tName][props.tID].users.includes(user.id)) return;

               form.change(`${props.mName}[${props.mID}].${props.tName}[${props.tID}].users`, [...(formData[props.mName][props.mID][props.tName][props.tID].users || []), user.id]);
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