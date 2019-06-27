function updateAllData() {
    updateTimeframeHeader();
    drawNetworkGraph();
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

function getNodeData() {
	return new Promise (function(resolve, reject) {
		var nodes = [];
		$.ajax({
		    url: "/db/numtags/aggregate/" + getTimeFrame(),
		    success: function (result) {
		            result.forEach((player, index) => {
		            	angle = (index / (result.length/2)) * Math.PI;
		            	nodes.push({
		            		id: 'p' + player.id,
		            		label: player.first_name + " " + player.last_name,
		            		x: (0.5 * Math.cos(angle)),
		            		y: (0.5 * Math.sin(angle)),
		            		size: player.num_tags,
		            		color: getPlayerColor(player.id, 1),
		            	});
		            });
		        },
		    error: function (err) {
		        console.log('Error on ajax request');
		    }
	    }).done(function() {
	    	resolve(nodes);
	    });
	});
}

function getEdgeData() {
	return new Promise (function(resolve, reject) {
		var edges = [];
		$.ajax({
		    url: "/db/numtags/" + getTimeFrame(),
		    success: function (result) {
		            result.forEach((player, index) => {
		            	edges.push({
		            		id: 'e' + index,
						    source: 'p' + player.tagger_id,
						    target: 'p' + player.tagee_id,
						    size: player.num_tags,
						    color: getPlayerColor(player.tagger_id, 0.7),
						    type: 'curvedArrow',
		            	});
		            });
		        },
		    error: function (err) {
		        console.log('Error on ajax request');
		    }
	    }).done(function() {
	    	resolve(edges);
	    });
	});
}

sigma.classes.graph.addMethod('neighbors', function(nodeId) {
    var k,
        neighbors = {},
        index = this.allNeighborsIndex[nodeId] || {};

    for (k in index)
      	neighbors[k] = this.nodesIndex[k];

    return neighbors;
  });

s = new sigma({})

function drawNetworkGraph() {
	s.graph.clear();
	s.refresh();
	$('#networkDiv').html(getLoadSVG());
	Promise.all([getNodeData(), getEdgeData()]).then(function(values){
		g = {
			nodes: values[0],
			edges: values[1],
		};
		$('#networkDiv').empty();
		s = new sigma({
		  	graph: g,
		  	container: 'networkDiv',
		  	settings: {
		  		maxNodeSize: 30,
		  		minNodeSize: 10,
		  		maxEdgeSize: 9,
		  		minEdgeSize: .3,
		  		minArrowSize: 4,
		  	},
		  	renderers: [{
		      	container: 'networkDiv',
		      	type: 'canvas',
		    }]
		});
		s.refresh();

		s.graph.nodes().forEach(function(n) {
	        n.originalColor = n.color;
	    });
	    s.graph.edges().forEach(function(e) {
	        e.originalColor = e.color;
	    });

	    s.bind('clickNode', function(c) {
	        var nodeId = c.data.node.id,
	            toKeep = s.graph.neighbors(nodeId);
	        toKeep[nodeId] = c.data.node;

	        s.graph.nodes().forEach(function(n) {
				if (toKeep[n.id])
					n.color = n.originalColor;
				else
					n.color = '#eee';
	        });

	        s.graph.edges().forEach(function(e) {
	          	if ((toKeep[e.source] && e.target == c.data.node.id) || (e.source == c.data.node.id && toKeep[e.target]))
	            	e.color = e.originalColor;
	         	else
	            	e.color = '#eee';
	        });

	        s.refresh();
	      });

	    s.bind('clickStage', function(e) {
	        s.graph.nodes().forEach(function(n) {
	          	n.color = n.originalColor;
	        });

	        s.graph.edges().forEach(function(e) {
	          	e.color = e.originalColor;
	        });

	        s.refresh();
	    });
	});
}
