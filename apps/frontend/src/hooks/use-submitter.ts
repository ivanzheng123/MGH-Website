import { useSubmit } from "react-router";
import { FieldValues } from "react-hook-form";

/**
 * Returns a submission handler that calls an action to submit data to.
 */
export const useSubmitter = <T extends FieldValues>() => {
    const submit = useSubmit();
    return (data: T) => {
        submit(data, {
            method: "POST",
            encType: "application/json",
        });
    };
};
