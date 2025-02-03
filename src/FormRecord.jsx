import { useState, useEffect, useRef } from 'react';
import TFFieldsSection from './TFFieldsSection';
import PropTypes from 'prop-types';


const FormRecord = ({ onRecordChange, initialData = {}, defaultId = "_left" }) => {
    // Define default TF string values for UI display.
    const defaultTfValues = {
        tf_first_name_surname_concat: "0.00018837",
        tf_surname: "0.0003449",
        tf_first_name: "0.00018837",
        tf_birth_place: "0.00504",
        tf_occupation: "0.038905"
    };

    // Merge initialData with default TF values if not provided.
    const mergedData = {
        ...initialData,
        tf_first_name_surname_concat: String(initialData.tf_first_name_surname_concat ?? defaultTfValues.tf_first_name_surname_concat),
        tf_surname: String(initialData.tf_surname ?? defaultTfValues.tf_surname),
        tf_first_name: String(initialData.tf_first_name ?? defaultTfValues.tf_first_name),
        tf_birth_place: String(initialData.tf_birth_place ?? defaultTfValues.tf_birth_place),
        tf_occupation: String(initialData.tf_occupation ?? defaultTfValues.tf_occupation),
    };

    // Initialize state with merged data
    const [formData, setFormData] = useState(mergedData);

    // When a field changes, update the formData and ensure tf_ keys remain present.
    const handleFieldChange = (field, value) => {
        // Convert empty strings to null to represent default.
        const updatedValue = value === '' ? null : value;
        const newData = { ...formData, [field]: updatedValue };
        setFormData(newData);
    };

    // Basic fields
    const [firstName, setFirstName] = useState(formData?.first_name || '');
    const [surname, setSurname] = useState(formData?.surname || '');
    const [dob, setDob] = useState(formData?.dob || '');
    const [birthPlace, setBirthPlace] = useState(formData?.birth_place || '');
    const [postcodeFake, setPostcodeFake] = useState(formData?.postcode_fake || '');
    const [occupation, setOccupation] = useState(formData?.occupation || '');

    // Single effect to handle all record changes (including initial state)
    const previousRecordRef = useRef(null);
    useEffect(() => {
        const record = {
            unique_id: defaultId,

            first_name: firstName || null,
            surname: surname || null,
            dob: dob || null,
            birth_place: birthPlace || null,
            postcode_fake: postcodeFake || null,
            occupation: occupation || null,
            first_name_surname_concat: `${firstName} ${surname}`.trim() || null,
            // Include TF fields with their current values from formData.
            // If the field equals the default string or is blank, output null;
            // otherwise, convert its value to a number.
            tf_first_name_surname_concat:
                (String(formData.tf_first_name_surname_concat) === defaultTfValues.tf_first_name_surname_concat ||
                    String(formData.tf_first_name_surname_concat).trim() === "")
                    ? null
                    : Number(formData.tf_first_name_surname_concat),
            tf_surname:
                (String(formData.tf_surname) === defaultTfValues.tf_surname ||
                    String(formData.tf_surname).trim() === "")
                    ? null
                    : Number(formData.tf_surname),
            tf_first_name:
                (String(formData.tf_first_name) === defaultTfValues.tf_first_name ||
                    String(formData.tf_first_name).trim() === "")
                    ? null
                    : Number(formData.tf_first_name),
            tf_birth_place:
                (String(formData.tf_birth_place) === defaultTfValues.tf_birth_place ||
                    String(formData.tf_birth_place).trim() === "")
                    ? null
                    : Number(formData.tf_birth_place),
            tf_occupation:
                (String(formData.tf_occupation) === defaultTfValues.tf_occupation ||
                    String(formData.tf_occupation).trim() === "")
                    ? null
                    : Number(formData.tf_occupation)
        };

        // Only update if record has changed
        const recordStr = JSON.stringify(record);
        const previousStr = previousRecordRef.current ? JSON.stringify(previousRecordRef.current) : null;
        if (recordStr !== previousStr) {
            onRecordChange(record);
            previousRecordRef.current = record;
        }
    }, [
        firstName, surname, dob, birthPlace,
        postcodeFake, occupation, formData, onRecordChange,
        defaultId
    ]);

    return (
        <div className="form-record">
            <div className="row">
                <label className="mono-label">first_name</label>
                <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
            </div>
            <div className="row">
                <label className="mono-label">surname</label>
                <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                />
            </div>
            <div className="row">
                <label className="mono-label">dob</label>
                <input
                    type="text"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    placeholder="YYYY-MM-DD"
                />
            </div>
            <div className="row">
                <label className="mono-label">birth_place</label>
                <input
                    type="text"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                />
            </div>
            <div className="row">
                <label className="mono-label">postcode_fake</label>
                <input
                    type="text"
                    value={postcodeFake}
                    onChange={(e) => setPostcodeFake(e.target.value)}
                />
            </div>
            <div className="row">
                <label className="mono-label">occupation</label>
                <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                />
            </div>

            <TFFieldsSection formData={formData} onChange={handleFieldChange} />
        </div>
    );
};

FormRecord.propTypes = {
    onRecordChange: PropTypes.func.isRequired,
    initialData: PropTypes.object,
    defaultId: PropTypes.string
};

export default FormRecord;