## What is this?

A React app that uses DuckDB WASM to run a Splink data linking model live in a browser.

It uses the model produced by the [50k historical persons demo](https://moj-analytical-services.github.io/splink/demos/examples/duckdb/deduplicate_50k_synthetic.html)

## Getting Started

To run the app locally:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
   The built app will output a single HTML file in the `dist` folder, so hosting it is as simple as double-clicking the file.

## Notes:

I use [`vite-plugin-singlefile`](https://www.npmjs.com/package/vite-plugin-singlefile) to bundle the entire app into a single `.html` file.

Note that it is not possible to bundle the actual WASM build, so the only external dependency is the DuckDB WASM file, which is loaded from a CDN see [here](https://github.com/RobinL/vite_splink_in_browser/blob/1f07993f6895c965186da51b48c4ef14ac6ad818/src/DuckDBQueryRunner.jsx#L31).

### Vega lite 5 issue

For some reason, using vega-lite 5 works `npm run dev` but not when `npm run build`, the waterfall chart is ordered incorrectly in the built app, but not in `dev`.  The solution was to pin `npm install vega-lite@4`

## How to modify this app to work with your SPlink model:


To update to new model:
1. update [query.sql](src/data/query.sql) with the sql output of `linker.inference.compare_two_records`
2. update [recordData](src/data/recordData.json) to align to schema
3. update [FormRecord](src/FormRecord.jsx) to align to schema.  An LLM can prob do this automatically
4. update [DuckDBQueryRunner](src/DuckDBQueryRunner.jsx) to align to new schema


For (1) obtain the SQL like:

```python
comparison = linker.inference.compare_two_records(df.iloc[0:1], df.iloc[1:2])
print(comparison.sql_used_to_create)
```

