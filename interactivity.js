// Event triggered upon clicking neuron (or self activation in the matrix)
let currentConnection = ""

function neuronClicked(neuron_type,position="pre"){//Remove previously highlighted connections and toggle the current neuron
    console.log(neuron_type)
    let current_neuron = $("g[id='Full-"+neuron_type+"']");
    let selected = current_neuron.hasClass("neuron-selected-"+position);
    let positions = ["pre","post"];
    let other_position = positions.filter(function(x){return(x!==position)})[0];
   // current_neuron.removeClass("neuron-selected-"+other_position);
    let other_neuron = $(".neuron-selected-"+other_position);
    let driv = DRIVERS[neuron_type];
    
    if (!selected){
	$('#selected-'+position).text(neuron_type);
	$("#neuron-title-"+position).text(NEURON_TYPES[neuron_type].short_name);
	$("#neuron-full-name-"+position).text("Full name : " + neuron_type);
	$("."+position+"Name").text(NEURON_TYPES[neuron_type].short_name);
	$(".neuron").not(current_neuron).removeClass("neuron-selected-"+position);
    }else{
	$('#selected-'+position).text("Neuron type");
	$("#neuron-title-"+position).text(position);
	$("#neuron-full-name-"+position).text("Full name : ");
	$("."+position+"Name").text(position);
    };
    
    $(".selected_by_neuron").removeClass("selected_by_neuron")
    $(".unselected_by_neuron").removeClass("unselected_by_neuron")
    
    // We have to use the selected attribute because some neurons have connections in common.
    // let neuron_connections = $("g[data-pre='"+neuron_type+"'], g[data-post='"+neuron_type+"']")
    let neuron_connections = $("path[data-"+position+"='"+neuron_type+"']");
    
    if ((other_neuron.length==1) & !selected){
	if (position == "pre"){
	    var current_connection = neuron_type+"-to-"+other_neuron.data("neuron");
	    updateScatterMatrix(other_neuron.data("neuron"),neuron_type);
	}else{
	    var current_connection = other_neuron.data("neuron")+"-to-"+neuron_type;
	    updateScatterMatrix(neuron_type,other_neuron.data("neuron"));
	};
	if (SUMMARY_DATA.hasOwnProperty(current_connection)){
	    connector_select(current_connection)
	}else{
	    $("#rawPlot-panel").addClass("unactive-plot");
	    $(".connector").removeClass("active-connector");
	};
	
    }else if ((other_neuron.length==0) & !selected){
	neuron_connections.toggleClass("selected_by_neuron")
	neuron_connections.removeClass("unselected_by_neuron")
	$(".connector:not(path[data-"+position+"='"+neuron_type+"'])").toggleClass("unselected_by_neuron")
	$("#rawPlot-panel").addClass("unactive-plot");
	$(".connector").removeClass("active-connector");
    }else if ((other_neuron.length==1) & selected){
	let other_connections = $("path[data-"+other_position+"='"+other_neuron.data("neuron")+"']")
	other_connections.toggleClass("selected_by_neuron")
	other_connections.removeClass("unselected_by_neuron")
	$(".connector:not(path[data-"+other_position+"='"+other_neuron.data("neuron")+"'])").toggleClass("unselected_by_neuron")
	$("#rawPlot-panel").addClass("unactive-plot");
	$(".connector").removeClass("active-connector");
	if (position == "pre"){
	    updateScatterMatrix(other_neuron.data("neuron"),neuron_type);
	}else{
	    updateScatterMatrix(neuron_type,other_neuron.data("neuron"));
	};
    }
    current_neuron.toggleClass("neuron-selected-"+position)
    
    $(".single_neuron_drawing-"+position).remove();

    $(".neuropile-neuron-"+position).removeClass("neuropile-diagram-pre neuropile-diagram-post");
    
    if (!selected){
	for (let np of POSSIBLE_NEUROPILES){
	    if (NEURON_TYPES[neuron_type].pre.includes(np)){
		$(".neuropile-neuron-"+position+"[np='"+np+"']").addClass("neuropile-diagram-pre");};
	    if  (NEURON_TYPES[neuron_type].post.includes(np)){
		$(".neuropile-neuron-"+position+"[np='"+np+"']").addClass("neuropile-diagram-post");};
	}
	
	let neuron = s.select("g[id='"+neuron_type+"']");
	let neuronD = neuron.clone().addClass("single_neuron_drawing-"+position+" single_neuron");
	Snap('#neuropiles-neuron-'+position).append(neuronD);
    
	let $driversDiv = $("<div>",{class: "row",id: "drivers-"+position});
    
	for (dr in driv){
	    let lk = FLY_LIGHT+driv[dr];
	    let $driversIn = $("<div>",{class: "col"});
	    let $driverTitle = $("<h6>",{class: "card-title"}).append(driv[dr])
	    let $driverComment = $("<h6>").append();
	    $driversIn.append($driverTitle);
	    // Put the link to the gal4 collection if it's a gen1 gal4
	    if ((driv[dr].includes("SS") | driv[dr].includes("-") | driv[dr].includes("VT")) == false){
		let $linkFly = $("<a>",{class: "card-link",href: lk, target: "_blank"});
		$linkFly.append("Janelia collection link");
		$driversIn.append($linkFly);
	};
	    $driversDiv.append($driversIn)
	};
	$("#drivers-"+position).replaceWith($driversDiv)
    };
}

// A convenience function that adds/remove a marker in the matrix plot at given location
function updateScatterMatrix(x,y){
    let matdata = document.getElementById("matrixPlot").data
    if ((matdata[3].x[0] == x) & (matdata[3].y[0] == y)){
	matdata[3].x = [];
	matdata[3].y = [];
    }else{
	matdata[3].x = [x];
	matdata[3].y = [y];
    };
    Plotly.update('matrixPlot',matdata,matlayout)
}

function updateTable(connection,npulses){
    $("#statsTable tbody").remove()
    $("#statsTable").append("<tbody></tbody>")
    for(expe of PAIRS_TO_EXP[connection]){
	let runs_data = PER_RUN_DATA[expe]
	if (npulses in runs_data){
	    $("#statsTable tbody").append("<tr><td>"+runs_data[npulses].genotype+"</td><td>"+Number(runs_data[npulses].integral_to_peak_median[0]).toFixed(3)+"</td><td>"+Number(runs_data[npulses].repeats_correlation_median[0]).toFixed(3)+"</td><td>"+Number(runs_data[npulses].baseline_median[0]).toFixed(3)+"</td><td>"+Number(runs_data[npulses].half_decay_median[0]).toFixed(3)+"</td></tr>")
	}   
    }
    let perPairData = SUMMARY_DATA[connection][npulses]
    $("#statsTable > tbody").append("<tr><th> Median statistics</th><th></th><th></th><th></th><th></th></tr><tr><td></td><td>"+Number(perPairData.integ).toFixed(3)+"</td><td>"+Number(perPairData.repeats_corr).toFixed(3)+"</td><td>"+Number(perPairData.baseline).toFixed(3)+"</td><td>"+Number(perPairData.decay_time).toFixed(3)+"</td></tr>")
};


function neuronClickedFromDiagram(event){
    let neuron_type = $(this).data("neuron")
    if (event.ctrlKey || event.metaKey) {
	neuronClicked(neuron_type,"post")
    }else{
	neuronClicked(neuron_type,"pre")
    };
}

function connector_select(connection_name){
    let connection = SUMMARY_DATA[connection_name]
    let connector = $("path[id='"+connection_name+"']")
    $(".connector").not(connector).removeClass("active-connector");
    
    connector.addClass("active-connector");
     
    $("#rawPlot-panel").toggleClass("unactive-plot",!connector.hasClass("active-connector"));
    $("#stats-panel").toggleClass("unactive-plot",!connector.hasClass("active-connector"));
    
    makeRawPlot(connection["20"],"rawPlot");
    makeDosePlot(connection);
    makeBaselinePlot(connection_name);
    updateTable(connection_name,20);
    currentConnection = connection_name;
}

// Events triggered when clicking a connector
function connectorClicked(connection_name){
    console.log(connection_name)
    let connector = $("path[id='"+connection_name+"']");
    let preNeuron = $("g[id='Full-"+connector.data("pre")+"']");
    let postNeuron = $("g[id='Full-"+connector.data("post")+"']");
    if (preNeuron.hasClass('neuron-selected-pre') == postNeuron.hasClass('neuron-selected-post')){
	neuronClicked(preNeuron.data("neuron"),"pre");
	neuronClicked(postNeuron.data("neuron"),"post");
    }else{
	if (preNeuron.hasClass('neuron-selected-pre')){
	    neuronClicked(postNeuron.data("neuron"),"post");
	}else{
	    neuronClicked(preNeuron.data("neuron"),"pre");
	};
    };
}


function connectorClickedFromDiagram(event){
    let conn_name =  $(this).data("link");
    let pre = $(this).data("pre");
    let post = $(this).data("post");
    connectorClicked(conn_name);
}

$(document).on("click",".connector-clickable",connectorClickedFromDiagram);

$(document).on("click",".neuron",neuronClickedFromDiagram); // Syntax is because .neurons have been dynamically added

// Both can also be triggered from the matrix plot
$('#matrixPlot').on('plotly_click',function(event,data){
    connectorClicked(data.points[0].y+"-to-"+data.points[0].x);
});

// From the dropdowns
$('#neuron-dd-pre a').click(function(){
    let neuron = $(this).text();
    neuronClicked(neuron,"pre")
});

$('#neuron-dd-post a').click(function(){
    let neuron = $(this).text();
    neuronClicked(neuron,"post")
});

///// Thresholding of the diagram
$('#thresh').click(function(){
    let tr = $("#threshold").prop("checked");
    $(".virtual-connector").toggle(!tr)
});

///// Buttons controls for the plots : 
$('input[name=pulses],input[name=trace]').on('change',function(){
    let currentPlot = document.getElementById("rawPlot")
    let currentBaselinePlot = document.getElementById("baselinePlot")
    let nPulses = $('input[name=pulses]:checked').val();
    let avg = $('input[name=trace]:checked').attr("id") == "avg"
    $(".pulseN").text(nPulses + " pulses");	
    $.each(currentPlot.data,function(i,v){
	v.visible = ((avg == v.is_avg) && (v.pulse_selector == nPulses))
    });
    currentPlot.layout.shapes[0].x1 = 0.0333*nPulses;
    
    $.each(currentBaselinePlot.data,function(i,v){
	v.visible = (v.pulse_selector == nPulses)
    });
    
    updateTable(currentConnection,nPulses);
    Plotly.update("baselinePlot",currentBaselinePlot.data,currentBaselinePlot.layout)    
    Plotly.update("rawPlot",currentPlot.data,currentPlot.layout)    
});

// Neuropile selectors
$("#selectAll").click(function(){
    $(".neuropile,.neuropile-diagram").removeClass("unselected_neuropile");
    $(".connector").removeClass("unselected_connection");
});

$("#unselectAll").click(function(){
    $(".neuropile,.neuropile-diagram").addClass("unselected_neuropile");
    $(".connector").addClass("unselected_connection");
});

/// Toggling a few classes upon clicking the neuropile template
$(document).on("click",".neuropile",function(){
	$(this).toggleClass("unselected_neuropile");
		
	let np_schematics = $(".neuropile-diagram[np='"+$(this).attr("np")+"']");
	np_schematics.toggleClass("unselected_neuropile");
	
	let linksHere = $("path[connection_location='"+$(this).attr("np")+"']");
        linksHere.toggleClass("unselected_connection",np_schematics.hasClass("unselected_neuropile"));

});



