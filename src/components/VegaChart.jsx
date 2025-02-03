import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import vegaEmbed from 'vega-embed';



const VegaChart = ({ spec }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        // Only embed if spec contains non-empty dataset for "data-1"
        if (
            !spec?.datasets ||
            !spec.datasets["data-1"] ||
            !Array.isArray(spec.datasets["data-1"]) ||
            spec.datasets["data-1"].length === 0
        ) {
            // New spec contains no data: leave the old chart
            return;
        }

        if (chartRef.current) {

            vegaEmbed(chartRef.current, spec).catch(error => {
                console.error("Error embedding Vega chart:", error);
            });
        }
    }, [spec]);

    return <div ref={chartRef} />;
};

export default VegaChart;

VegaChart.propTypes = {
    spec: PropTypes.object.isRequired,
};