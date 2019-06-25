google.charts.load('current', {packages: ['corechart','timeline']});
google.charts.setOnLoadCallback(updateAllData);

function genTooltip(startDate, endDate, tagged_by, tagged, it) {
        var diff = Math.round((endDate-startDate)/1000);
        
        var days = Math.floor(diff/(24*60*60));
        diff = diff-(days*24*60*60);
        var hours = Math.floor(diff/(60*60));
        diff = diff-(hours*60*60);
        var minutes = Math.floor(diff/(60));

        return '<div style="padding:5px 5px 5px 5px; width: 220px;"><div style="font-size:120%">' + (days > 0 ? days + ' Day' + (days !== 1 ? 's, ':', ') : '') + (hours > 0 ? hours + ' Hour' + (hours !== 1 ? 's, ':', ') : '') + minutes + ' Minute' + (minutes !== 1 ? 's':'') + '</div><b>IT:</b> ' + it + '<br><b>Tagged By:</b> ' + tagged_by + ' <br><b>Tagged:</b> ' + tagged + '<br></div>';
}

function updateAllData() {
    Promise.resolve()
        .then(()=> {initializeDetailTable()})
        .then(() => {
            getChartData();
            getLongTimeData();
            getShortAvgData();
            getMostTagData();
        });
}

function initializeDetailTable() {
    $.ajax({
    url: "/db/players/",
    success: function (result) {
            $("#detailTable").find("tr:gt(0)").remove();
            result.forEach((player, index) => {
                let full_name = player.first_name + ' ' + player.last_name;
                $("#detailTable").append(
                    '<tr id=player' + player.id + 'Row>' +
                        '<td>' + player.id + '</td>' +
                        '<td>' + full_name + '</td>' +
                        '<td id=player' + player.id + 'TotTime class="text-right">' + '-' + '</td>' +
                        '<td id=player' + player.id + 'AvgTime class="text-right">' + '-' + '</td>' +
                        '<td id=player' + player.id + 'Tags class="text-right">' + '-' + '</td>' +
                    '</tr>'
                );
            });
        },
    error: function (err) {
        console.log('Error on ajax request');
    }
    }).done(function() { 

    });
}

function getChartData() {
    var dataRows = [];
    $.ajax({
    url: "/db/timeline/" + getTimeFrame(),
    beforeSend: function(){
        $("#timeline").html(getLoadSVG());
    },
    success: function (result) {
            dataRows = []
            let prev_time = new Date(); 
            result.forEach((tag, index) => {
                let tag_time = new Date(tag.tag_time);
                tag_time.setHours(tag_time.getHours() - 4)
                if (index > 0) {
                    var dataRow = [];
                    tagger_full_name = tag.tagger_first_name + ' ' + tag.tagger_last_name;
                    tagee_full_name = tag.tagee_first_name + ' ' + tag.tagee_last_name;
                    if (tag.tagee_id == tag.tagger_id) {
                        tagee_full_name = '';
                    };
                    prev_tagger_full_name = tag.prev_tagger_first_name + ' ' + tag.prev_tagger_last_name;
                    dataRow.push(tagger_full_name);
                    dataRow.push(' ');
                    dataRow.push(genTooltip(prev_time, tag_time, prev_tagger_full_name, tagee_full_name, tagger_full_name));
                    dataRow.push(prev_time);
                    dataRow.push(tag_time);
                    dataRows.push(dataRow);
                };
                prev_time = tag_time;
            });
        },
    error: function (err) {
        var dataRows = [];
        console.log('Error on ajax request');
    }
    }).done(function() { 
        drawChart(dataRows);
    });
}



function getLongTimeData() {
    
    var player_names = [];
    var player_times = [];
    var player_bg_colors = [];
    var player_border_colors = [];
    $.ajax({
    url: "/db/longtime/" + getTimeFrame(),
    beforeSend: function(){
        $("#longtimeDiv").html(getLoadSVG());
    },
    success: function (result) {
            $("#longtimeTable").find("tr:gt(0)").remove();
            result.forEach((player, index) => {
                let rank = index + 1;
                let full_name = player.first_name + ' ' + player.last_name;
                player_names.push(full_name);
                if (player.time_as_it == 0) {
                    player_times.push(0.1);
                } else {
                    player_times.push(player.time_as_it);
                }
                player_bg_colors.push(getPlayerColor(player.it_id, 0.4));
                player_border_colors.push(getPlayerColor(player.it_id, 1));
                var time_it_str = formatSecAsDur(player.time_as_it);
                $('#player' + player.it_id + 'TotTime').html(time_it_str);
                /*$("#longtimeTable tbody").append(
                    "<tr>" +
                        "<td>" + rank + "</td>" +
                        "<td>" + full_name + "</td>" +
                        "<td class='text-right'>" + time_it_str + "</td>" +
                    "</tr>"
                );*/
            });
        },
    error: function (err) {
        console.log('Error on ajax request');
    }
    }).done(function() {
        $("#longtimeDiv").empty();
        $("div#longtimeDiv").append('<canvas id="longtimeChart" style="height: 20px;"></canvas>');
        var ctx = document.getElementById('longtimeChart').getContext('2d'); 
        drawBarGraph(player_names, player_times, player_bg_colors, player_border_colors, 'Total Time Tagged', ctx);
    });
}

function getShortAvgData() {

    var player_names = [];
    var player_times = [];
    var player_bg_colors = [];
    var player_border_colors = [];
    $.ajax({
    url: "/db/shortavg/" + getTimeFrame(),
    beforeSend: function(){
        $("#shortavgDiv").html(getLoadSVG());
    },
    success: function (result) {
            $("#shortavgTable").find("tr:gt(0)").remove();
            result.forEach((player, index) => {
                let rank = index + 1;
                let full_name = player.first_name + ' ' + player.last_name;
                player_names.push(full_name);
                if (player.avg_time_as_it == 0) {
                    player_times.push(0.1);
                } else {
                    player_times.push(player.avg_time_as_it);
                }
                player_bg_colors.push(getPlayerColor(player.it_id, 0.4));
                player_border_colors.push(getPlayerColor(player.it_id, 1));
                var time_it_str = formatSecAsDur(player.avg_time_as_it);
                $('#player' + player.it_id + 'AvgTime').html(time_it_str);
                /*$("#shortavgTable tbody").append(
                    "<tr>" +
                        "<td>" + rank + "</td>" +
                        "<td>" + full_name + "</td>" +
                        "<td class='text-right'>" + time_it_str + "</td>" +
                    "</tr>"
                );*/
            });
                },
    error: function (err) {
        console.log('Error on ajax request');
    }
    }).done(function() { 
        $("#shortavgDiv").empty();
        $("div#shortavgDiv").append('<canvas id="shortavgChart" style="height: 20px;"></canvas>');
        var ctx = document.getElementById('shortavgChart').getContext('2d');
        drawBarGraph(player_names, player_times, player_bg_colors, player_border_colors, 'Average Time as IT', ctx);
    });
}

function getMostTagData() {

    var player_names = [];
    var player_totals = [];
    var player_colors = [];
    $.ajax({
    url: "/db/mosttag/" + getTimeFrame(),
    beforeSend: function(){
        $("#mosttagDiv").html(getLoadSVG());
    },
    success: function (result) {
            $("#mosttagTable").find("tr:gt(0)").remove();
            result.forEach((player, index) => {
                let rank = index + 1;
                let full_name = player.first_name + ' ' + player.last_name;
                player_names.push(full_name);
                player_totals.push(Math.round(player.number_of_its));
                player_colors.push(getPlayerColor(player.it_id, 1));
                $('#player' + player.it_id + 'Tags').html(Math.round(player.number_of_its));
                /*$("#mosttagTable tbody").append(
                      "<tr>" +
                        "<td>" + rank + "</td>" +
                        "<td>" + full_name + "</td>" +
                        "<td class='text-right'>" + Math.round(player.number_of_its) + "</td>" +
                      "</tr>"
                );*/
            });
        },
    error: function (err) {
        console.log('Error on ajax request');
    }
    }).done(function() { 
        $("#mosttagDiv").empty();
        $("div#mosttagDiv").append('<canvas id="mosttagChart" style="height: 20px;"></canvas>');
        var ctx = document.getElementById('mosttagChart').getContext('2d');
        drawDoughnutChart(player_names, player_totals, player_colors, 'Number of Times Tagged', ctx)
    });
}

$(document.getElementById('timeframeFilter').addEventListener('change', function() {
    updateAllData();
}));

var window_width = $(window).width();

$(window).resize(function(){
    if(window_width != $(window).width()){
        getChartData();
        window_width = $(window).width();
    }
});