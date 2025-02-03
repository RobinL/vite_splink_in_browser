import { useState, useEffect } from 'react';
import FormRecord from './FormRecord.jsx'
import './App.css'
import recordDataText from './data/recordData.json'
import DuckDBQueryRunner from './DuckDBQueryRunner.jsx';
import DisplayDuckDBResults from './components/DisplayDuckDBResults';

function App() {
  // Use the imported JSON record data (assume it's an array)
  const recordData = recordDataText;

  // Initialize record index
  const [recordIndex, setRecordIndex] = useState(0);
  // Initialize enriched record states as null - FormRecord will populate them
  const [leftRecord, setLeftRecord] = useState(null);
  const [rightRecord, setRightRecord] = useState(null);

  // NEW: State to force remounting the DuckDBQueryRunner
  const [queryKey, setQueryKey] = useState(0);

  // Update when record index changes
  useEffect(() => {
    setQueryKey(prev => prev + 1); // Update key to force remount of query runner
  }, [recordIndex, recordData]);

  // Compute combined records from leftRecord and rightRecord.
  const combinedRecords =
    leftRecord && rightRecord ? { record_left: leftRecord, record_right: rightRecord } : null;
  const haveRecords = combinedRecords;

  // Navigation to change the current record index
  const goPrevious = () => {
    if (recordIndex > 0) setRecordIndex(recordIndex - 1);
  };
  const goNext = () => {
    if (recordIndex < recordData.length - 1) setRecordIndex(recordIndex + 1);
  };

  return (
    <div className="App">
      <div className="nav-buttons">
        <div className="button-group">
          <button onClick={goPrevious} disabled={recordIndex === 0}>
            Previous Record
          </button>
          <button onClick={goNext} disabled={recordIndex === recordData.length - 1}>
            Next Record
          </button>
        </div>
        <div className="record-info">{`Record ${recordIndex + 1} of ${recordData.length}`}</div>
        <small className="nav-hint">Use these buttons load example records</small>
      </div>

      <div className="forms-wrapper">
        <div className="form-container">
          <div className="form-title">Record Left</div>
          <FormRecord
            key={`left-${recordIndex}`}
            onRecordChange={setLeftRecord}
            initialData={recordData[recordIndex].record_left}
            defaultId={1}
            defaultSource="dataset"
          />
        </div>
        <div className="form-container">
          <div className="form-title">Record Right</div>
          <FormRecord
            key={`right-${recordIndex}`}
            onRecordChange={setRightRecord}
            initialData={recordData[recordIndex].record_right}
            defaultId={2}
            defaultSource="dataset"
          />
        </div>
      </div>

      <div className="query-results-container">
        {haveRecords && (
          <DuckDBQueryRunner
            key={queryKey}
            data={combinedRecords}
          >
            {({ loading, error, result, inputData }) => (
              <DisplayDuckDBResults
                loading={loading}
                error={error}
                result={result}
                inputData={inputData}
              />
            )}
          </DuckDBQueryRunner>
        )}
      </div>
    </div>
  )
}

export default App
