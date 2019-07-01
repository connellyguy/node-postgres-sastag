function getTimeFrame() {
    var timeframeFilter = document.getElementById('timeframeFilter');
    return timeframeFilter.options[timeframeFilter.selectedIndex].value;
}

function getLoadSVG() {
    return '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" width="64px" height="64px" viewBox="0 0 128 128" xml:space="preserve"><g><path d="M78.75 16.18V1.56a64.1 64.1 0 0 1 47.7 47.7H111.8a49.98 49.98 0 0 0-33.07-33.08zM16.43 49.25H1.8a64.1 64.1 0 0 1 47.7-47.7V16.2a49.98 49.98 0 0 0-33.07 33.07zm33.07 62.32v14.62A64.1 64.1 0 0 1 1.8 78.5h14.63a49.98 49.98 0 0 0 33.07 33.07zm62.32-33.07h14.62a64.1 64.1 0 0 1-47.7 47.7v-14.63a49.98 49.98 0 0 0 33.08-33.07z" fill="#5c7fbc" fill-opacity="1"/><animateTransform attributeName="transform" type="rotate" from="0 64 64" to="-90 64 64" dur="600ms" repeatCount="indefinite"></animateTransform></g></svg>';
}

function getTitleCase(value) {
    return value.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function drawChart(chartData) {
	var container = document.getElementById('timeline');
    var chart = new google.visualization.Timeline(container);
    var dataTable = new google.visualization.DataTable();

    dataTable.addColumn({ type: 'string', id: 'IT' });
    dataTable.addColumn({ type: 'string', id: 'dummy bar label' });
    dataTable.addColumn({ type: 'string', role: 'tooltip', 'p': {'html': true} });
    dataTable.addColumn({ type: 'string', id: 'style', role: 'style' });
    dataTable.addColumn({ type: 'date', id: 'Start' });
    dataTable.addColumn({ type: 'date', id: 'End' });
    dataTable.addRows(chartData);

    var options = {
    	timeline: {singleColor: '#5B69FD'},
        tooltip: { isHtml: true },
    };

    chart.draw(dataTable, options);
}

function formatSecAsDur(secondsIn) {
    let duration = moment.duration(secondsIn, 'seconds');
    outstr = '';
    if (duration.days() >= 2) {
        outstr += duration.days() + ' Days, '
    } else if (duration.days()) {
        outstr += duration.days() + ' Day, '
    }
    duration.subtract(duration.days(),'d');
    outstr += moment().startOf('day').seconds(duration.asSeconds()).format('HH:mm:ss');
    return outstr;
}

function formatSecAsDays(secondsIn) {
    let duration = moment.duration(secondsIn, 'seconds');
    outstr = '';
    if (duration.days() >= 2) {
        outstr += duration.days() + ' Days'
    } else if (duration.days()) {
        outstr += duration.days() + ' Day'
    } else {
        outstr += '0'
    }
    if (duration.days() < 1 && duration.hours() > 0) {
        duration.subtract(duration.days(),'d');
        outstr = duration.hours() + ' Hrs';
    }
    return outstr;
}

function getPlayerColor(player_id, opacity) {
    switch (player_id) {
        case 1:
            return 'rgba(255,171,132,' + opacity + ')';
        break; 

        case 2:
            return 'rgba(39,40,56,' + opacity + ')';
        break; 

        case 3:
            return 'rgba(220,117,143,' + opacity + ')';
        break;

        case 6:
            return 'rgba(129,94,91,' + opacity + ')';
        break;

        case 7:
            return 'rgba(70,18,32,' + opacity + ')';
        break;

        case 8:
            return 'rgba(232,214,118,' + opacity + ')';
        break;

        case 9:
            return 'rgba(141,181,128,' + opacity + ')';
        break;

        case 10:
            return 'rgba(117,185,190,' + opacity + ')';
        break;

        case 11:
            return 'rgba(4,42,43,' + opacity + ')';
        break;

        case 13:
            return 'rgba(236,145,146,' + opacity + ')';
        break;

        case 42:
            return 'rgba(181,189,137,' + opacity + ')';
        break;

        default:
            return 'rgba(92,128,188,' + opacity + ')';
    }
}

function rgb2hex(rgb){
 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ? "#" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

function drawBarGraph(data_labels, data, bar_color, border_color, data_label, ctx) {
    var myChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: data_labels,
            datasets: [{
                label: data_label,
                data: data,
                backgroundColor: bar_color,
                borderColor: border_color,
                borderWidth: 1,
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function(value, index, values) {
                            return formatSecAsDays(value);
                        },
                    },
                }],
                yAxes: [{
                    gridLines: {
                        display: true,
                        drawBorder: true,
                        drawOnChartArea: false,
                    },
                }]
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        var label = data.datasets[tooltipItem.datasetIndex].label || '';

                        if (label) {
                            label += ': ';
                        }
                        label += formatSecAsDur(tooltipItem.xLabel);
                        return label;
                    },
                },
            },
            title: {
                display: true,
                text: data_label,
                fontSize: 20,
            },
            legend: {
                display: false,
            },
        },
    });
}

function drawDoughnutChart(data_labels, data, segment_color, data_label, ctx) {
    var myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data_labels,
            datasets: [{
                label: data_label,
                data: data,
                backgroundColor: segment_color,
            }]
        },
        options: {
            plugins: {
                datalabels: {
                    display: true,
                    anchor: 'center',
                    align: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderColor: '#fff',
                    color: '#fff',
                    borderRadius: 4,
                    borderWidth: 1,
                },
            },
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: data_label,
                fontSize: 20,
            }
        },
    });
}

// Initialize moment.js
moment().format();

$(document).ready(function() {
    $("#timeframeFilter").removeClass('d-none');
})