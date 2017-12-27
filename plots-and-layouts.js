///////////////// LAYOUTS //////////////////////////////////////
/// Raw plot layout
let raw_layout = { xaxis:  {title: 'Time (s)',
			    zeroline: false,
			    range: [-2,8]},
	                    yaxis: {title: 'Fluorescence (\u0394F/F)',
		                zeroline: false},
		            showlegend: false,
		            hovermode: 'closest',
		   autosize: true,
		   margin: {l: 60,
			    t: 10,
			    r: 20},
                   shapes: [
                       {
			   type: 'rect',
                           // x-reference is assigned to the x-values
			   xref: 'x',
                           // y-reference is assigned to the plot paper [0,1]
			   yref: 'paper',
			   x0: 0,
			   y0: 0,
			   x1: 20*0.0333,
			   y1: 1,
	               	   fillcolor: 'gray',
			   opacity: 0.2,
                           line: {
                               width: 0
                           }
                       }]
		 };

/// Dose plot layout
let dose_layout = { xaxis:  {title: 'Number of pulses',
			     zeroline: false},
	            yaxis: {title: 'Interpolated response',
		            zeroline: false},
		    showlegend: false,
		    hovermode: 'closest',
		    autosize: true,
		    margin: {
			l: 60,
			t: 10,
			r: 20}
		  };

/// Baseline plot layout
let baseline_layout = { xaxis:  {title: 'Fluorescence baseline (\u0394F/F)',
			     zeroline: false},
			yaxis: {title: 'Fluorescence integral',
		            zeroline: false},
			showlegend: false,
			hovermode: 'closest',
			autosize: true,
			margin: {
			    l: 60,
			    t: 10,
			    r: 20}
		      };

/// Matrix plot layout
let matlayout = {
   // width: 800,
    // height: 800,
    autosize: true,
    xaxis: {
	title: "Post-synaptic candidate",
	autorange: true,
	tickvals: Object.keys(NEURON_TYPES),
	ticktext: Object.keys(NEURON_TYPES).map(function(n){return(NEURON_TYPES[n]["short_name"])})
    },
    yaxis: {
	title: "Pre-synaptic candidate",
	autorange: true,
	tickvals: Object.keys(NEURON_TYPES),
	ticktext: Object.keys(NEURON_TYPES).map(function(n){return(NEURON_TYPES[n]["short_name"])})
    },
    margin: {
	b:150,
	t:20,
	l: 120},
    hovermode: 'closest',
    legend: {orientation: "h",
	     x: 0,
	     y: -0.13
	    }
    
};

///// Histogram //////
let histLayout = {barmode: "overlay"};

////////////////////// PLOTTING FUNCTIONS ////////////////////////////////////////

/// Raw plots
function makeRawTraces(nP,table_line){
    let series = [];
    let i = 0;
    
    let nPulses = $('input[name=pulses]:checked').val();
    let avg = $('input[name=trace]:checked').attr("id") == "avg";
    
    for(expe of PAIRS_TO_EXP[table_line.cellPair]){
	let exper = FULL_DATA[expe];
	let avg_exper = AVG_DATA[expe];
	if (nP in exper){
	    avg_exper = avg_exper[nP];
	    exper = exper[nP];
	    for (y in exper.y){
		series.push({x: exper.x,
			     y: exper.y[y],
			     name: expe,
			     opacity: 0.8,
			     text: expe,
			     hoverinfo: "x+y+text",
			     line: {
				 width: 1,
				 color: PLOT_COLORS[i]},
			     visible: (nP == nPulses) && (avg == false),
			     pulse_selector: nP,  // Argument I will use to toggle on/off the averages
			     is_avg: false
			    });
	    };
	    series.push({x: avg_exper.x,
			 y: avg_exper.y,
			 name: expe,
			 opacity: 0.8,
			 text: expe+"average",
			 hoverinfo: "x+y+text",
			 line: {
				 width: 2,
				 color: PLOT_COLORS[i]},
			 visible: (nP == nPulses) && (avg == true),
			 pulse_selector: nP,
			 is_avg: true		
	    });
	};
	i+=1;
    }
    return(series)
}

function makeRawPlot(table_line,loc){
    let full_series = [];
    let pulse_labels = [];
    
    for (np of PULSE_N){
	let traces = makeRawTraces(np,table_line);
	pulse_labels.push(traces.length);
        full_series = full_series.concat(traces);
    };
    let average_tag = $.map(full_series,x => x.text.includes("average"))
        
    Plotly.newPlot(loc,full_series,raw_layout,{displaylogo: false});
}

/// Baseline plot
function makeBaselinePlot(runs_data){
    let baselinePlotSeries = [];
    
    for (nP of PULSE_N){
	let runD = runs_data[nP]
	baselinePlotSeries.push({x: runs_data[nP]["baseline_median"],
				 y: runs_data[nP]["integral_to_peak_median"],
				 mode: 'markers',
				 type: 'scatter',
				 marker: {size: 12,
					  color: 'cornflowerblue'},
				 visible: (nP == $('input[name=pulses]:checked').val()),
				 pulse_selector: nP
				});
				
    }
    Plotly.newPlot('baselinePlot',baselinePlotSeries,baseline_layout,{displaylogo: false});   
};

//// Dose plot
function makeDosePlot(pair_data){
    let mainData =[];
    let lowCI = [];
    let hightCI = [];
    
    for (np of PULSE_N){
	mainData.push(pair_data[np]["integNorm"])
	lowCI.push(pair_data[np]["integNormCILow"])
	hightCI.push(pair_data[np]["integNormCIUp"])
    }

    let dosePlotSerie = {x: [1,5,10,20,30],
			 y: mainData,
			 mode: 'markers',
			 type: 'scatter',
			 marker: {size: 12,
				  color: 'cornflowerblue'}};

    let dosePlotSerieL = {x: [1,5,10,20,30],
			 y: lowCI,
			 mode: 'markers',
			 type: 'scatter',
			 marker: {size: 8,
				  color: 'lightgray'}};

    let dosePlotSerieU = {x: [1,5,10,20,30],
			 y: hightCI,
			 mode: 'markers',
			 type: 'scatter',
			 marker: {size: 8,
				  color: 'lightgray'}};
    
    Plotly.newPlot("dosePlot",[dosePlotSerie,dosePlotSerieU,dosePlotSerieL],dose_layout,{displaylogo: false});
};

/// WIP Histogram plot
function makeHistogram(metric){
    let controlSeries = [];
    let selfSeries = [];
    let expSeries = [];
    for (let k in SUPER_SUMMARY){
	if (SUPER_SUMMARY)
	if (SUPER_SUMMARY[k]["overlapping"])
	    SUPER_SUMMARY[k][metric]
    };
}

/// Matrix plot
function makeMatrixPlot(metric){
    let matstat= Object.keys(NEURON_TYPES).map(function(pre){
	return(Object.keys(NEURON_TYPES).map(function(post){
	    if(SUPER_SUMMARY[pre+"-to-"+post] === undefined){
		return(NaN)
	    }else{return(SUPER_SUMMARY[pre+"-to-"+post][metric])};
	}));	
    });
    
    let statVals = Object.values(SUPER_SUMMARY).map(function(st){return(st[metric])})
    var midPoint = -Math.min(...statVals)/(Math.max(...statVals)-Math.min(...statVals))

    let overlaps = Object.keys(SUPER_SUMMARY).map(function(k){
	if (SUPER_SUMMARY[k]["expType"]==="Overlapping"){
	    return(k.split("-to-"));
	};
    });
    
    overlaps = overlaps.filter(function(item){
	return typeof item ==='object';  
    });

    let overlapsY = overlaps.map(function(o){return(o[0])});
    let overlapsX = overlaps.map(function(o){return(o[1])});

    var matdata = [
	{
	    z: matstat,    // The heatmap
	    x: Object.keys(NEURON_TYPES),
	    y: Object.keys(NEURON_TYPES),
	    colorscale: [[0,'#2980b9'],[midPoint,'rgb(217,217,217)'],[1,'#c0392b']],
	    type: 'heatmap',
	    hoverinfo: "y+x+z"
	},
	{// The identity line
	    x: Object.keys(NEURON_TYPES),
	    y: Object.keys(NEURON_TYPES),
	    type: "scatter",
	    mode:"lines",
            line: {dash: 'dash',
		   color: 'lightgray'},
	    showlegend: false,
	    hoverinfo: 'skip'
	},
	{// The overlaps marker
	    x: overlapsX,
	    y:overlapsY,
	    type: "scatter",
	    mode: "markers",
	    marker: {
		color: "gray",
	//	size: 14,
		symbol: "square-open"
	    },
	    name: "Anatomical overlap",
	    hoverinfo: 'skip'
	},
	{ x: [],     // The marker for the selected pair
	  y:[],
	  type: "scatter",
	  mode: "markers",
	  marker: {
	      color: "#2ecc71",
          //    size: 10
	  },
	  showlegend: false,
	  hoverinfo: 'skip'
	}
    ];
    
    Plotly.newPlot('matrixPlot',matdata,matlayout)
}

