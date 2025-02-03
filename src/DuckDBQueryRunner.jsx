import { useState, useEffect, useRef } from 'react';
import sql_query from './data/query.sql?raw';

const DuckDBQueryRunner = ({ data, children }) => {
    const [db, setDb] = useState(null);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Used to track component mounted state.
    const isMountedRef = useRef(true);
    // To store the DuckDB instance.
    const dbRef = useRef(null);

    // Cleanup effect: mark unmounted and terminate DB if exists.
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            if (dbRef.current) {
                dbRef.current.terminate();
                dbRef.current = null;
            }
        };
    }, []);

    // Effect for initializing DuckDB.
    useEffect(() => {
        (async function initialize() {
            try {
                // Dynamically import DuckDB-Wasm from the CDN.
                const duckdb = await import('https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/+esm');
                const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
                const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

                // Create a Worker via Blob using the bundle's mainWorker.
                const workerBlobUrl = URL.createObjectURL(
                    new Blob([`importScripts("${bundle.mainWorker}");`], { type: "text/javascript" })
                );
                const worker = new Worker(workerBlobUrl);
                const logger = new duckdb.ConsoleLogger();
                const duckdbInstance = new duckdb.AsyncDuckDB(logger, worker);
                await duckdbInstance.instantiate(bundle.mainModule, bundle.pthreadWorker);
                URL.revokeObjectURL(workerBlobUrl);
                if (isMountedRef.current) {
                    dbRef.current = duckdbInstance;
                    setDb(duckdbInstance);
                    console.log("DuckDB-Wasm initialized successfully.");
                }
            } catch (err) {
                if (isMountedRef.current) {
                    setError("Error initializing DuckDB: " + err.message);
                }
            }
        })();
    }, []);

    // Effect for running the query when both DB is ready and data is available.
    useEffect(() => {
        if (!db || !data?.record_left || !data?.record_right) return;
        (async function runQuery() {
            try {
                setLoading(true);
                setError("");
                const conn = await db.connect();
                try {
                    // Drop any existing tables.
                    await conn.query("DROP TABLE IF EXISTS tbl_left;");
                    await conn.query("DROP TABLE IF EXISTS tbl_right;");

                    // Register JSON data files.
                    await db.registerFileText('left.json', JSON.stringify([data.record_left]));
                    await db.registerFileText('right.json', JSON.stringify([data.record_right]));

                    // Insert JSON data as tables.
                    await conn.insertJSONFromPath('left.json', { name: 'tbl_left' });
                    await conn.insertJSONFromPath('right.json', { name: 'tbl_right' });

                    // Define transformation queries.
                    const transformQueryLeft = `
            CREATE OR REPLACE TABLE __splink__compare_two_records_left AS
            SELECT
              try_cast(unique_id as VARCHAR) as unique_id,

              try_cast(first_name as VARCHAR) as first_name,
              try_cast(surname as VARCHAR) as surname,
              try_cast(try_cast(dob as DATE) as VARCHAR) as dob,
              try_cast(birth_place as VARCHAR) as birth_place,
              try_cast(postcode_fake as VARCHAR) as postcode_fake,
              try_cast(occupation as VARCHAR) as occupation,
              try_cast(first_name_surname_concat as VARCHAR) as first_name_surname_concat,
              try_cast(tf_first_name_surname_concat as FLOAT) as tf_first_name_surname_concat,
              try_cast(tf_surname as FLOAT) as tf_surname,
              try_cast(tf_first_name as FLOAT) as tf_first_name,
              try_cast(tf_birth_place as FLOAT) as tf_birth_place,
              try_cast(tf_occupation as FLOAT) as tf_occupation
            FROM tbl_left;
          `;
                    const transformQueryRight = `
            CREATE OR REPLACE TABLE __splink__compare_two_records_right AS
            SELECT
              try_cast(unique_id as VARCHAR) as unique_id,

              try_cast(first_name as VARCHAR) as first_name,
              try_cast(surname as VARCHAR) as surname,
              try_cast(try_cast(dob as DATE) as VARCHAR) as dob,
              try_cast(birth_place as VARCHAR) as birth_place,
              try_cast(postcode_fake as VARCHAR) as postcode_fake,
              try_cast(occupation as VARCHAR) as occupation,
              try_cast(first_name_surname_concat as VARCHAR) as first_name_surname_concat,
              try_cast(tf_first_name_surname_concat as FLOAT) as tf_first_name_surname_concat,
              try_cast(tf_surname as FLOAT) as tf_surname,
              try_cast(tf_first_name as FLOAT) as tf_first_name,
              try_cast(tf_birth_place as FLOAT) as tf_birth_place,
              try_cast(tf_occupation as FLOAT) as tf_occupation
            FROM tbl_right;
          `;
                    // Run transformation queries.
                    await conn.query(transformQueryLeft);
                    await conn.query(transformQueryRight);

                    // Run the imported SQL query.
                    if (sql_query) {
                        const res = await conn.query(sql_query);
                        if (isMountedRef.current) {
                            setResult(JSON.stringify(res.toArray(), null, 2));
                        }
                    } else {
                        if (isMountedRef.current) {
                            setError("No SQL query found in the imported file.");
                        }
                    }
                } finally {
                    conn.close();
                }
            } catch (err) {
                if (isMountedRef.current) {
                    setError("Error running DuckDB query: " + err.message);
                }
            } finally {
                if (isMountedRef.current) {
                    setLoading(false);
                }
            }
        })();
    }, [db, data]);

    // Use render-props to pass along query status and results.
    return children({ loading, error, result, inputData: data });
};

export default DuckDBQueryRunner;