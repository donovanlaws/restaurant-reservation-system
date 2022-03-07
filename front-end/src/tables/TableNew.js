import React, { useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory } from "react-router-dom";
import TableForm from "./TableForm";
import { createTable } from "../utils/api";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function NewTable() {
    const initialFormState = {
        table_name: "",
        capacity: 0,
        status: "free"
    }
    const [formData, setFormData] = useState(initialFormState);
    const [error, SetError] = useState([]);
    const history = useHistory();

    // Every time information is changed, update and check for errors or inconsistencies.
    const handleChange = (event) => {
        if (event.target.name === "capacity") setFormData({ ...formData, [event.target.name]: Number(event.target.value)})
        else setFormData({ ...formData, [event.target.name]: event.target.value})
    }

    // Once submitted, create the reservation and return to the dashboard on that reservation's date. Otherwise show an error.
    async function handleSubmit(event) {
        event.preventDefault();
        const errors = [];
        if (!errors.length) {
            try {
                await createTable(formData);
                history.push('/dashboard');
            } catch (err) {
                errors.push(err.message);
                SetError(errors);
            }
        } else SetError(errors);
    }

    return (
        <main>
            <h1>New Table</h1>
            <TableForm formData={formData} handleSubmit={handleSubmit} handleChange={handleChange}/>
            <ErrorAlert error={error} />
        </main>
    );
}

export default NewTable;