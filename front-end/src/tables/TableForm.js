import React from "react";
import { useHistory } from "react-router-dom";

export default function TableForm({ formData, handleSubmit, handleChange, error }) {
    let history = useHistory();
    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="table_name">Table Name</label>
                <input required name="table_name" type="text" className="form-control" value={formData.table_name} placeholder="Table Name" onChange={handleChange} />
                <label htmlFor="capacity">Table Capacity</label>
                <input required name="capacity" type="text" className="form-control" value={formData.capacity} placeholder="Table Capacity" onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary mr-2">Submit</button>
            <button className="btn btn-secondary" type="button" onClick={() => history.goBack()}>Cancel</button>
        </form>
    )
}