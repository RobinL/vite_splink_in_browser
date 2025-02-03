import PropTypes from 'prop-types';



const TFFieldsSection = ({ formData, onChange }) => {
    const modifyValue = (value, operation) => {
        const numValue = Number(value);
        if (isNaN(numValue)) return value;
        return String(operation === 'multiply' ? numValue * 2 : numValue / 2);
    };

    const renderField = (label, value, onChange) => {
        // Calculate reciprocal if the value is a valid non-zero number, else set to null.
        const numValue = Number(String(value));
        const reciprocal = (!isNaN(numValue) && numValue !== 0)
            ? (1 / numValue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
            : null;
        return (
            <div className="tf-field-row">
                <label style={{ fontFamily: 'monospace' }}>{label}</label>
                <div className="tf-field-input-group">
                    <input
                        type="number"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <button
                        className="tf-modify-btn"
                        onClick={() => onChange(modifyValue(value, 'multiply'))}
                        title="Multiply by 2"
                    >
                        ×2
                    </button>
                    <button
                        className="tf-modify-btn"
                        onClick={() => onChange(modifyValue(value, 'divide'))}
                        title="Divide by 2"
                    >
                        ÷2
                    </button>
                    {reciprocal && <span className="tf-reciprocal-text">1 in {reciprocal}</span>}
                </div>
            </div>
        );
    };

    const inlineStyles = `
    .tf-fields-section {
      margin-top: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 0.5rem;
    }
    .tf-fields-section summary {
      cursor: pointer;
      padding: 0.5rem;
      text-align: left;
    }
    .tf-fields-container {
      padding: 0.5rem;
    }
    .tf-field-row {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .tf-field-row label {
      width: 130px;
      text-align: right;
      margin-right: 8px;
      flex: 0 0 auto;
    }
    .tf-field-input-group {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .tf-field-input-group input {
      width: 100px;
      flex: 0 0 auto;
    }
    .tf-modify-btn {
      padding: 0.25rem 0.5rem;
      border: 1px solid #ccc;
      border-radius: 3px;
      background: #f5f5f5;
      cursor: pointer;
      font-size: 0.9em;
      flex: 0 0 auto;
    }
    .tf-modify-btn:hover {
      background: #e5e5e5;
    }
    .tf-reciprocal-text {
      margin-left: 10px;
      font-size: 0.9em;
    }
  `;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
            <details className="tf-fields-section">
                <summary>Term Frequency adjustments</summary>
                <div className="tf-fields-container">
                    {renderField("tf_first_name_surname_concat", formData.tf_first_name_surname_concat,
                        (value) => onChange('tf_first_name_surname_concat', value)
                    )}
                    {renderField("tf_surname", formData.tf_surname,
                        (value) => onChange('tf_surname', value)
                    )}
                    {renderField("tf_first_name", formData.tf_first_name,
                        (value) => onChange('tf_first_name', value)
                    )}
                    {renderField("tf_birth_place", formData.tf_birth_place,
                        (value) => onChange('tf_birth_place', value)
                    )}
                    {renderField("tf_occupation", formData.tf_occupation,
                        (value) => onChange('tf_occupation', value)
                    )}
                </div>
            </details>
        </>
    );
};

TFFieldsSection.propTypes = {
    formData: PropTypes.shape({
        tf_first_name_surname_concat: PropTypes.string,
        tf_surname: PropTypes.string,
        tf_first_name: PropTypes.string,
        tf_birth_place: PropTypes.string,
        tf_occupation: PropTypes.string
    }).isRequired,
    onChange: PropTypes.func.isRequired
};

export default TFFieldsSection;