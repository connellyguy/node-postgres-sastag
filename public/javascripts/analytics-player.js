Chart.defaults.global.plugins.datalabels.display = false;

function updateAllData() {
    getPlayerLineData();
    getPlayerTagsData();
    getPlayerTimeData();
    getPlayerAvgData();
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
        var allTimeAvg = [];
        $.ajax({
        url: "/db/shortavg/all",
        success: function(result){
            var playerRow = result.find(r => {
                return r.it_id == PLAYERID;
            });
            dates.forEach((tagDay, index) => {
                allTimeAvg.push(playerRow.avg_time_as_it);
            });
        },
        error: function(err) {
            console.log('Error on ajax request');
        }
        }).done(function() {
            $("#playerlineDiv").empty();
            $("div#playerlineDiv").append('<canvas id="playerLineChart"></canvas>');
            var ctx = document.getElementById('playerLineChart').getContext('2d'); 
            drawPlayerLineGraph(dates, totals, avg, allTimeAvg, 'rgba(74, 109, 144, 1)', 'rgba(74, 109, 144, 0.2)', 'rgba(87, 167, 115, 1)', 'rgba(87, 167, 115, 0.2)', 'rgba(54, 162, 235, 1)', 'rgba(0,0,0,0)', "IT Duration", "Avg Time as IT", "Avg Time as IT (All Time)", ctx);
        });

    });
}

function getPlayerTagsData() {
    var player_count;
    var player_total;
    var player_rank;
    $.ajax({
    url: "/db/mosttag/" + getTimeFrame(),
    beforeSend: function(){
        $("#playerTagsDiv").html(getLoadSVG());
    },
    success: function (result) {
            player_count = result.length;
            result.forEach((player, index) => {
                if (player.it_id == PLAYERID) {
                    player_total = player.number_of_its;
                    player_rank = player.rank;
                };
            });
        },
    error: function (err) {
        console.log('Error on ajax request');
    }
    }).done(function() { 
        $("#playerTagsDiv").empty();
        $("div#playerTagsDiv").append('<canvas id="playerTagsGauge"></canvas>');
        var ctx = document.getElementById('playerTagsGauge').getContext('2d');
        drawPlayerTagGauge(['Player Tags','Difference from Max'], [player_rank, (player_count - player_rank)], player_total, ctx);
    });
}

function getPlayerTimeData() {
    var player_count;
    var player_total;
    var player_rank;
    $.ajax({
    url: "/db/longtime/" + getTimeFrame(),
    beforeSend: function(){
        $("#playerTimeDiv").html(getLoadSVG());
    },
    success: function (result) {
            player_count = result.length;
            result.forEach((player, index) => {
                if (player.it_id == PLAYERID) {
                    player_total = player.time_as_it;
                    player_rank = player.rank;
                };
            });
        },
    error: function (err) {
        console.log('Error on ajax request');
    }
    }).done(function() { 
        $("#playerTimeDiv").empty();
        $("div#playerTimeDiv").append('<canvas id="playerTimeGauge"></canvas>');
        var ctx = document.getElementById('playerTimeGauge').getContext('2d');
        drawPlayerTimeGauge(['Player Time','Difference from Max'], [player_rank, (player_count - player_rank)], player_total, "Total Time as IT", ctx);
    });
}

function getPlayerAvgData() {
    var player_count;
    var player_total;
    var player_rank;
    $.ajax({
    url: "/db/shortavg/" + getTimeFrame(),
    beforeSend: function(){
        $("#playerAvgDiv").html(getLoadSVG());
    },
    success: function (result) {
            player_count = result.length;
            result.forEach((player, index) => {
                if (player.it_id == PLAYERID) {
                    player_total = player.avg_time_as_it;
                    player_rank = player.rank;
                };
            });
        },
    error: function (err) {
        console.log('Error on ajax request');
    }
    }).done(function() { 
        $("#playerAvgDiv").empty();
        $("div#playerAvgDiv").append('<canvas id="playerAvgGauge"></canvas>');
        var ctx = document.getElementById('playerAvgGauge').getContext('2d');
        drawPlayerTimeGauge(['Player Time','Difference from Max'], [player_rank, (player_count - player_rank)], player_total, "Average Time as IT", ctx);
    });
}

function drawPlayerTimeGauge(labels, data, realValue, title, ctx) {
    var chart = new Chart(ctx, {
        type:"doughnut",
        data: {
            labels : labels,
            datasets: [{
                label: "Gauge",
                data : data,
                backgroundColor: [
                    "rgb(255, 99, 132)",
                    "rgb(54, 162, 235)",
                ]
            }]
        },
        options: {
            title: {
                display: true,
                text: title,
                fontSize: 20,
            },
            circumference: Math.PI,
            rotation : Math.PI,
            cutoutPercentage : 80, // precent
            plugins: {
                datalabels: {
                    display: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderColor: '#ffffff',
                    color: function(context) {
                        return context.dataset.backgroundColor;
                    },
                    font: function(context) {
                        var w = context.chart.width;
                        return {
                          size: w < 512 ? 18 : 20
                        }
                    },
                    align: 'start',
                    anchor: 'start',
                    offset: 10,
                    borderRadius: 4,
                    borderWidth: 1,
                    formatter: function(value, context) {
                        var i = context.dataIndex;
                        var len = context.dataset.data.length - 1;
                        if(i == len){
                            return null;
                        }
                        return formatSecAsDur(realValue);
                    },
                },
            },
            legend: {
                display: false
            },
            tooltips: {
                enabled: false
            },
            layout: {
                padding: {
                    bottom: 10,
                }
            }
        }
    });
}

function drawPlayerTagGauge(labels, data, realValue, ctx) {
    var chart = new Chart(ctx, {
        type:"doughnut",
        data: {
            labels : labels,
            datasets: [{
                label: "Gauge",
                data : data,
                backgroundColor: [
                    "rgb(255, 99, 132)",
                    "rgb(54, 162, 235)",
                ]
            }]
        },
        options: {
            title: {
                display: true,
                text: "Times IT",
                fontSize: 20,
            },
            circumference: Math.PI,
            rotation : Math.PI,
            cutoutPercentage : 80, // precent
            plugins: {
                datalabels: {
                    display: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderColor: '#ffffff',
                    color: function(context) {
                        return context.dataset.backgroundColor;
                    },
                    font: function(context) {
                        var w = context.chart.width;
                        return {
                          size: w < 512 ? 18 : 20
                        }
                    },
                    align: 'start',
                    anchor: 'start',
                    offset: 10,
                    borderRadius: 4,
                    borderWidth: 1,
                    formatter: function(value, context) {
                        var i = context.dataIndex;
                        var len = context.dataset.data.length - 1;
                        if(i == len){
                            return null;
                        }
                        return realValue + (realValue == 1 ? ' Tag' : ' Tags');
                    },
                },
            },
            legend: {
                display: false
            },
            tooltips: {
                enabled: false
            },
            layout: {
                padding: {
                    bottom: 10,
                }
            }
        }
    });
}


function drawPlayerLineGraph(dates, dataTotal, dataAvg, dataATA, lineColorTotal, fillColorTotal, lineColorAvg, fillColorAvg, lineColorATA, fillColorATA, labelTotal, labelAvg, labelATA, ctx) {
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
      	}, {
            type: 'line',
            label: labelATA,
            showLine: true,
            data: dataATA,
            lineTension: 0,
            borderColor: lineColorATA,
            backgroundColor: fillColorATA,
        }],
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