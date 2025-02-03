import PropTypes from 'prop-types';
import VegaChart from './VegaChart';
import { predictionRowToWaterfallFormat, generateDiffHtml, bayes_factor_to_prob } from '../utils/splinkVisUtils';
import styles from './DisplayDuckDBResults.module.css';
import waterfall_spec from '../data/waterfall_spec.json?raw';

// Helper functions for nice number formatting
function formatMatchWeight(weight) {
    return weight.toFixed(4);
}

function formatMatchProbability(prob) {
    return (prob * 100).toFixed(2) + '%';
}

function formatErrorRate(prob) {
    if (prob >= 0.5) {
        // For high match probability, display error rate as "1 in X" using the formula: 1/(1-p)
        const errorRate = 1 / (1 - prob);
        return `error rate: 1 in ${errorRate < 2 ? errorRate.toFixed(2) : Math.round(errorRate).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    } else {
        // For low match probabilities, the 1/(1-P) value is near 1 so show the actual error percentage.
        return ((1 - prob) * 100).toFixed(2) + '% chance of error';
    }
}

// New DisplayDuckDBResults as a JSX functional component
const DisplayDuckDBResults = ({ loading, error, result, inputData }) => {
    if (loading) return <div>Loading DuckDB query...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (result === "") return <></>;

    let predictionData;
    let finalMatchWeight = null;
    let matchProbability = null;
    debugger;
    try {
        const parsedResult = JSON.parse(result);
        const row = parsedResult[0];
        finalMatchWeight = row.match_weight;
        const bayesFactor = 2 ** finalMatchWeight;
        matchProbability = bayes_factor_to_prob(bayesFactor);

        predictionData = predictionRowToWaterfallFormat(row);
    } catch (e) {
        console.error("Error parsing DuckDB result:", e);
    }

    const clonedSpec = JSON.parse(waterfall_spec);
    clonedSpec.datasets["data-1"] = predictionData;

    // Helper to format values
    const formatValue = (value) => {
        if (value == null || value === "") return "";
        return String(value);
    };

    // Extract records and define the new fields order
    const leftRec = inputData?.record_left || {};
    const rightRec = inputData?.record_right || {};
    const fields = [
        "first_name",
        "surname",
        "dob",
        "birth_place",
        "postcode_fake",
        "occupation"
    ];

    const sortedTableData = fields.map(key => ({
        field: key,
        left_value: leftRec[key] != null ? leftRec[key] : "",
        right_value: rightRec[key] != null ? rightRec[key] : ""
    }));

    // Dump the current left and right records into formatted JSON
    const dumpedJSON = JSON.stringify(
        { record_left: leftRec, record_right: rightRec },
        null,
        2
    );

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(dumpedJSON);
        } catch (err) {
            console.error("Failed to copy data: ", err);
        }
    };

    return (
        <div>
            {/* Headline message displayed above the chart if finalMatchWeight is available */}
            {finalMatchWeight !== null && (
                <p style={{ marginBottom: '10px' }}>
                    {`Match weight ${formatMatchWeight(finalMatchWeight)} corresponding to match probability ${formatMatchProbability(matchProbability)} i.e. ${formatErrorRate(matchProbability)}`}
                </p>
            )}
            <VegaChart spec={clonedSpec} />
            <div style={{ marginTop: '10px' }}>
                <table className={styles['record-table']}>
                    <thead>
                        <tr>
                            <th></th>
                            {sortedTableData.map(d => (
                                <th key={d.field}>{d.field}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Left Record</td>
                            {sortedTableData.map(d => (
                                <td key={d.field}>{formatValue(d.left_value)}</td>
                            ))}
                        </tr>
                        <tr>
                            <td>Right Record</td>
                            {sortedTableData.map(d => (
                                <td key={d.field}>{formatValue(d.right_value)}</td>
                            ))}
                        </tr>
                        <tr className={styles['diff-row']}>
                            <td>Diff</td>
                            {sortedTableData.map(d => {
                                const diffContent = d.left_value === d.right_value
                                    ? ""
                                    : generateDiffHtml(d.left_value, d.right_value);
                                return (
                                    <td key={d.field} dangerouslySetInnerHTML={{ __html: diffContent }} />
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '20px' }}>
                <details style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '0.5rem', marginTop: '1rem' }}>
                    <summary style={{ cursor: 'pointer', padding: '0.5rem', textAlign: 'left' }}>
                        Records as JSON
                        <button onClick={handleCopy} style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', fontSize: '0.9em' }}>Copy to Clipboard</button>
                    </summary>
                    <textarea
                        readOnly
                        value={dumpedJSON}
                        style={{ width: '100%', height: '150px', marginTop: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                </details>
            </div>
        </div>
    );
};

DisplayDuckDBResults.propTypes = {
    loading: PropTypes.bool,
    error: PropTypes.string,
    result: PropTypes.string,
    inputData: PropTypes.shape({
        record_left: PropTypes.object,
        record_right: PropTypes.object
    })
};

export default DisplayDuckDBResults;