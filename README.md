- For some reason, using vega-lite 5 works `npm run dev` but not when `npm run build`, the waterfall chart is ordered incorrectly in the built app, but not in `dev`.  The solution was to pin `npm install vega-lite@4`


To update to new model:
1. update [query.sql](src/data/query.sql) with the output of
2. update [recordData](src/data/recordData.json) to align to schema
3. update [FormRecord](src/FormRecord.jsx) to align to schema.  An LLM can prob do this automatically
4. update [DuckDBQueryRunner](src/DuckDBQueryRunner.jsx) to align to new schema