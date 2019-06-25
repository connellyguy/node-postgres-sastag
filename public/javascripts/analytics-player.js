function updateAllData() {
    getPlayerLineData();
    updateTimeframeHeader();
}

$(document.getElementById('timeframeFilter').addEventListener('change', function() {
    updateAllData();
}));

$(document).ready(function() {
	updateAllData();
});

function updateTimeframeHeader() {
	tfValue = getTimeFrame();
	tfValue = tfValue === 'all' ? 'All Time' : tfValue;
	tfValue = getTitleCase(tfValue);
	$('#timeframeHeader').html(tfValue);
}

function getPlayerLineData() {
    var dates = [];
    var totals = [];
    var total = 0;
    var tags = 0
    var avg = [];
    $.ajax({
    url: "/db/player/" + PLAYERID + "/" + getTimeFrame(),
    beforeSend: function(){
        $("#playerlineDiv").html(getLoadSVG());
    },
    success: function (result) {
            result.forEach((tag, index) => {
            	if (tag.prev_tag_time) {
	            	total += tag.tag_diff;
	            	tags += 1;
	            	dates.push(moment(tag.tag_time).format('MMM DD'));
	            	totals.push(tag.tag_diff);
	            	avg.push(total/tags);
            	}
            });
        },
    error: function (err) {
        console.log('Error on ajax request');
    }
    }).done(function() {
        $("#playerlineDiv").empty();
        $("div#playerlineDiv").append('<canvas id="playerLineChart"></canvas>');
        var ctx = document.getElementById('playerLineChart').getContext('2d'); 
        drawPlayerLineGraph(dates, totals, avg, 'rgba(74, 109, 144, 1)', 'rgba(74, 109, 144, 0.2)', 'rgba(87, 167, 115, 1)', 'rgba(87, 167, 115, 0.2)', "IT Duration", "Avg Time as IT", ctx);
    });
}

function drawPlayerLineGraph(dates, dataTotal, dataAvg, lineColorTotal, fillColorTotal, lineColorAvg, fillColorAvg, labelTotal, labelAvg, ctx) {
    var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
    	labels: dates,
        datasets: [{
			label: labelTotal,
			showLine: true,
			data: dataTotal,
			lineTension: 0,
			borderColor: lineColorTotal,
			backgroundColor: fillColorTotal,
			borderWidth: 1,
			barPercentage: 0.6,
      	}, {
      		type: 'line',
			label: labelAvg,
			showLine: true,
			data: dataAvg,
			lineTension: 0,
			borderColor: lineColorAvg,
			backgroundColor: fillColorAvg,
			borderDash: [15,5],
      	}]
    },
	options: {
		scales: {
			xAxes: [{
				categoryPercentage: 0.6,
				gridLines: {
					display: true,
					drawBorder: true,
					drawOnChartArea: false,
				},
			}],
			yAxes: [{
				id: 'A',
				type: 'linear',
				position: 'left',
				ticks: {
                    beginAtZero: true,
                    callback: function(value, index, values) {
                        return index % 2 === 0 ? formatSecAsDur(value) : '';
                	},
                },
            	gridLines: {
					display: true,
					drawBorder: true,
					drawOnChartArea: false,
				},
			}],	
		},
		tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label || '';

                    if (label) {
                        label += ': ';
                    }
                    label += formatSecAsDur(tooltipItem.yLabel);
                    return label;
                },
            },
            mode: 'index',
        },
	},
});
}