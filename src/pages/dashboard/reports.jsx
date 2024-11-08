import React, {useState} from 'react';

const CreateReport = () => {
    const[reports, setReports] = useState([]);
    const[report, setReport] = useState({
        id: '',
        room: '',
        category: '',
        description: ','
    })

    const handleChange = (e) => {
        setReport({
            ...report,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedReports = [...reports, report];
        setReports(updatedReports);
        saveReports(updatedReports);
        setReport({id: '', room: '', category: '', description: ','});
    };

    const saveReports = (reports) => {
        localStorage.setItem('reports', JSON.stringify(reports));
    };

    return(
        <div>
            <h2>Create A Report</h2>
            <form onSubmit={handleSubmit}>
                <input name="id" placeholder="ID" value={report.id} onChange={handleChange} required />
                <input name="room" placeholder="Room Number" value={report.room} onChange={handleChange} required />
                <input name="category" placeholder="Category" value={report.category} onChange={handleChange} required />
                <textarea name="description" placeholder="Description" value={report.description} onChange={handleChange} required />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default CreateReport