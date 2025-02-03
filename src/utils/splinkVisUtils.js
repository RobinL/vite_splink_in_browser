// Utility functions for splink visualization

import DiffMatchPatch from 'diff-match-patch';

export const log2 = Math.log2;

// Derives the adjusted prior match weight using bayes factors.
export function derivePriorMatchWeight(match_data) {
    let product = 1;
    Object.keys(match_data)
        .filter(key => key.startsWith('bf_'))
        .forEach(key => {
            product *= match_data[key] || 1;
        });
    const log_product = log2(product);
    return match_data.match_weight - log_product;
}

export function bayes_factor_to_prob(b) {
    return b / (b + 1);
}

export function prob_to_bayes_factor(p) {
    return p / (1 - p);
}

export function prob_to_log2_bayes_factor(p) {
    return log2(prob_to_bayes_factor(p));
}

export function log2_bayes_factor_to_prob(log2_b) {
    return bayes_factor_to_prob(2 ** log2_b);
}

// Converts a prediction row into a format suitable for a waterfall chart.
export function predictionRowToWaterfallFormat(match_data) {
    const outputData = [];
    let barSortOrder = 0;

    const prior_match_weight = derivePriorMatchWeight(match_data);

    // Prior row
    outputData.push({
        column_name: "Prior",
        label_for_charts: "Starting match weight (prior)",
        log2_bayes_factor: prior_match_weight,
        bayes_factor: 2 ** prior_match_weight,
        comparison_vector_value: null,
        term_frequency_adjustment: null,
        bar_sort_order: barSortOrder++
    });

    // Process each gamma value
    Object.keys(match_data)
        .filter(key => key.startsWith("gamma_"))
        .sort()
        .forEach(key => {
            const colName = key.substring(6);
            const bfKey = `bf_${colName}`;
            const tfAdjKey = `bf_tf_adj_${colName}`;

            const bayesFactorStandard = match_data[bfKey] || 1;
            const bayesFactorTF = match_data[tfAdjKey] || 1;

            // Row for standard tf adjustment
            outputData.push({
                column_name: colName,
                label_for_charts: "Gamma value for " + colName,
                log2_bayes_factor: log2(bayesFactorStandard),
                bayes_factor: bayesFactorStandard,
                comparison_vector_value: match_data[key],
                term_frequency_adjustment: false,
                bar_sort_order: barSortOrder++
            });

            // Row for tf adjustment on
            outputData.push({
                column_name: "tf adj on " + colName,
                label_for_charts: "Gamma value for " + colName,
                log2_bayes_factor: log2(bayesFactorTF),
                bayes_factor: bayesFactorTF,
                comparison_vector_value: match_data[key],
                term_frequency_adjustment: true,
                bar_sort_order: barSortOrder++
            });
        });

    // Final row
    const finalScore = match_data.match_weight;
    outputData.push({
        column_name: "Final score",
        label_for_charts: "Final score",
        log2_bayes_factor: finalScore,
        bayes_factor: 2 ** finalScore,
        comparison_vector_value: null,
        term_frequency_adjustment: null,
        bar_sort_order: barSortOrder++
    });

    return outputData;
}



// Helper to generate diff-highlighted HTML between two values.
export function generateDiffHtml(leftVal, rightVal) {
    // If either value is an array, compute set differences.
    if (Array.isArray(leftVal) || Array.isArray(rightVal)) {
        const leftArray = Array.isArray(leftVal) ? leftVal : [];
        const rightArray = Array.isArray(rightVal) ? rightVal : [];
        if (JSON.stringify(leftArray) === JSON.stringify(rightArray)) return '';
        const leftOnly = leftArray.filter(x => !rightArray.includes(x));
        const rightOnly = rightArray.filter(x => !leftArray.includes(x));
        const common = leftArray.filter(x => rightArray.includes(x));
        let result = '';
        if (leftOnly.length) result += `<span class="diff-removed">${leftOnly.join(', ')}</span>`;
        if (leftOnly.length && (common.length || rightOnly.length)) result += ', ';
        if (common.length) result += `<span class="diff-unchanged">${common.join(', ')}</span>`;
        if (common.length && rightOnly.length) result += ', ';
        if (rightOnly.length) result += `<span class="diff-added">${rightOnly.join(', ')}</span>`;
        return result;
    }
    // For non-array values: if equal, just return the string.
    if (leftVal === rightVal) return String(leftVal);
    // Use diff_match_patch to compute and highlight differences.
    const dmp = new DiffMatchPatch();
    const diffs = dmp.diff_main(String(leftVal), String(rightVal));
    dmp.diff_cleanupSemantic(diffs);
    return diffs
        .map(([op, text]) =>
            op === 1 ? `<span class="diff-added">${text}</span>` :
                op === -1 ? `<span class="diff-removed">${text}</span>` :
                    `<span class="diff-unchanged">${text}</span>`
        )
        .join('');
}