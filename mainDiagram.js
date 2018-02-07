// Neuron type dropdown
for (var st in SUPERTYPES){
    $('#neuron-dd-pre').append("<h6 class='dropdown-header'>"+st+'</a>');
    $('#neuron-dd-post').append("<h6 class='dropdown-header'>"+st+'</a>');
    for (var nr of SUPERTYPES[st]){
	$('#neuron-dd-pre').append("<a class='dropdown-item'>"+nr+'</a>');
	$('#neuron-dd-post').append("<a class='dropdown-item'>"+nr+'</a>');
    };
    $('#neuron-dd-pre').append('<div class="dropdown-divider"></div>');
    $('#neuron-dd-post').append('<div class="dropdown-divider"></div>');
};
    
$(function () {
    $('[data-toggle="popover"]').popover()
})

//sT is the full drawing
var sT = Snap("#networkDiagram");
var s = sT.group();

var le = Snap("#legend");
var ne = Snap("#neuron-drawing-pre");
var neP = Snap("#neuron-drawing-post");

s.rect()
    .attr({width: "100%",
	   height: "100%",
	   fill: "white"});

const DIAGRAM_WIDTH = 6350;
const DIAGRAM_HEIGHT = 3000;
const SCALE_LINKS = 30;
sT.attr({viewBox: [0,0,DIAGRAM_WIDTH,DIAGRAM_HEIGHT]});
le.attr({viewBox: [0,0,625,540]});
ne.attr({viewBox: [0,30,850,800]});
neP.attr({viewBox: [0,30,850,800]});

//// DEFINING MARKERS FOR LINKS /////////////////

s.path("M0,0 L0,3 L4.5,1.5 z")
    .marker(0,0,5,5,3.5,1.5)
    .addClass("arrow")
    .attr({"markerUnits": "strokeWidth",
           "id": "arrow-exc",
	   "stroke": "none",
           "fill": EXC_COLOR//Snap.flat.pomegranate
          }).toDefs();

s.path("M0,0 L0,3 L4.5,1.5 z")
    .marker(0,0,5,5,3.5,1.5)
    .addClass("arrow")
    .attr({
           "markerUnits": "strokeWidth",
           "id": "arrow-inh",
           "fill": INH_COLOR//Snap.flat.belizehole
    }).toDefs();

s.path("M0,0 L0,3 L4.5,1.5 z")
    .marker(0,0,5,5,3.5,1.5)
    .addClass("arrow")
    .attr({
           "markerUnits": "strokeWidth",
           "id": "arrow-hidden",
           "fill": "LightGray"
          }).toDefs();

// Scale the legends

let scale_factor = (sT.node.getBoundingClientRect().height/DIAGRAM_HEIGHT)//*(199/strLegend.node.getBoundingClientRect().width);
console.log(scale_factor)

$(".legend-connector.width-connector").map(function(){
	$(this).data("virtualwidth",parseFloat(SCALE_LINKS*Math.sqrt($(this).data("strength")))*scale_factor)
	$(this).css("stroke-width",$(this).data("virtualwidth"));
    })


// Load the svg diagram
Snap.load("images/CXSchematicAnnotatedWithNeurons.svg",function(f){
    // This is the neuropile drawing, which has some attributes we'll need
    const CX = f.select("g[id='central complex']");
    const CX_TRANS = CX.attr("transform");
    let neuropile_fragments = new Map;
    for (let np in NEUROPILES_FULL_NAMES){
        let myNp = s.append(CX.select("g[id='"+NEUROPILES_FULL_NAMES[np]+"']"));
        neuropile_fragments[NEUROPILES_FULL_NAMES[np]]=
            Snap("g[id='"+NEUROPILES_FULL_NAMES[np]+"']").toDefs();
    };

    //////////////// DRAW THE DIAGRAM ///////////////////////////
    
    
    const XCOLU = 800;
    const YCOLU = 1000;

    drawNeuronClass(f,"EB columnar",neuropile_fragments,CX_TRANS,[XCOLU,YCOLU],[550,100]);
    
    drawNeuronClass(f,"FB columnar",neuropile_fragments,CX_TRANS,[XCOLU+550*4+100,YCOLU],[550,100]);
    
    drawNeuronClass(f,"Ring neuron",neuropile_fragments,CX_TRANS,[XCOLU-850,YCOLU+700],[0,-300]);

    drawNeuronClass(f,"EB input",neuropile_fragments,CX_TRANS,[XCOLU-800,YCOLU-700],[550,100]);
    
    drawNeuronClass(f,"PB input",neuropile_fragments,CX_TRANS,[XCOLU+550*4,YCOLU-900],[1000,0]);
    
    drawNeuronClass(f,"PB interneuron",neuropile_fragments,CX_TRANS,[XCOLU+500,YCOLU-700],[600,0]);

    drawNeuronClass(f,"LAL-NO",neuropile_fragments,CX_TRANS,[XCOLU+550*2,YCOLU+900],[750,80]);

    drawNeuronClass(f,"LAL-IN",neuropile_fragments,CX_TRANS,[XCOLU+550*8+350,YCOLU+600],[-600,500]);
    
    drawNeuronClass(f,"FB input",neuropile_fragments,CX_TRANS,[XCOLU+550*8,YCOLU-500],[100,500]);

    // Draw the template in the neuron description box
    var neuronDraw = ne.attr({id: "neuropiles-neuron-pre"});

    var neuronDrawPost = neP.attr({id: "neuropiles-neuron-post"});
    
    drawNeuropiles(POSSIBLE_NEUROPILES,neuronDraw,"neuropile-neuron-pre","","_inDiagram",CX_TRANS,neuropile_fragments)
    drawNeuropiles(POSSIBLE_NEUROPILES,neuronDrawPost,"neuropile-neuron-post","","_inDiagram",CX_TRANS,neuropile_fragments)
   
    // Draw the links
    Object.keys(SUMMARY_DATA).forEach(function(pair){
	let d = SUMMARY_DATA[pair]["20"];
	d.cellPair = pair;
	let summ = SUPER_SUMMARY[pair];
	
        if ((s.select("g[id='"+d.preNeuron+"']") != null) & (s.select("g[id='"+d.postNeuron+"']") != null)){//& (d.preNeuron != d.postNeuron)){
            drawLink(d,summ);
	};	
    });

   
    
    //// DRAWING THE NEUROPILE REFERENCE
    let g = le.group()
        .attr({id: "Neuropiles_template"});

    drawNeuropiles(POSSIBLE_NEUROPILES,g,"neuropile","","_template","",neuropile_fragments,true);
 
    ////////END DRAWING/////////////////////////
    $(function () {
	$('[data-toggle="tooltip"]').tooltip()
    })
});


/// FUNCTIONS DEFINITIONS //////
function drawNeuron(drawing,parent,neuron_type,frags,CX_TRANS,position){
    // Draw the neuron :
    g = s.group().attr({transform: "translate("+position[0]+","+position[1]+")",
                        id: "Full-"+neuron_type,
		        "data-neuron": neuron_type//,
			//"data-selected": false
		        });   

    g.addClass("neuron")
    // First the neuropiles
    drawNeuropiles(NEURON_TYPES[neuron_type].innervates,g,"neuropile-diagram",neuron_type+"-","",CX_TRANS,frags,false,NEURON_TYPES[neuron_type].pre,NEURON_TYPES[neuron_type].post)
   
    // Then the neuron itself
    neuron = drawing.select("g[id='"+neuron_type+"']");
    neuron.addClass("single_neuron");
    g.add(neuron);
    
    let neuronBox = g.getBBox();
    let neuronTrans = g.transform().localMatrix.invert();
    let neuronBoxRect=s.rect(neuronTrans.x(neuronBox.x,neuronBox.y),neuronTrans.y(neuronBox.x,neuronBox.y),neuronBox.w,neuronBox.h,30,30);

    g.prepend(neuronBoxRect);

    var title = Snap.parse('<title>'+NEURON_TYPES[neuron_type].short_name+
			   "&#13"+neuron_type+'</title>');
    g.append(title);
        
    return g
}

function drawNeuropiles(neuropiles,
			parent,
			class_name,
			id_pre,
			id_post,
			transfo,
			frags,
			add_title=false,
			preRegions=[],
			postRegions=[]){
    for (let np of neuropiles){
	//let npile_templ = drawing.group();
	let npile = frags[NEUROPILES_FULL_NAMES[np]].use().addClass(class_name).attr({
										      transform: transfo,
										      id: id_pre+NEUROPILES_FULL_NAMES[np]+id_post,
										      np: np
										     });
	//npile_templ.append(npile)
	if (preRegions.includes(np)){
	    npile.addClass("neuropile-diagram-pre")
	}
	if (postRegions.includes(np)){
	    npile.addClass("neuropile-diagram-post")
	}
	if (add_title == true){
	    let  title = Snap.parse('<title>'+NEUROPILES_FULL_NAMES[np]+'</title>');
	    npile.append(title);
	}
	parent.append(npile);
    };
}

function drawNeuronClass(drawing,supertype,frags,CX_TRANS,start_position,position_offset){
    let class_g = s.group().attr({id: supertype});
    for (let nr of SUPERTYPES[supertype]){
	if (drawing.select("g[id='"+nr+"']") != null){
            var neuro = drawNeuron(drawing,class_g,nr,frags,CX_TRANS,start_position);
            class_g.append(neuro);
            s.append(class_g);
         for (j in [0,1]){start_position[j]=start_position[j]+position_offset[j]};
       };
    };
}

function guessConnectionLocation(preNeuron,postNeuron){
    let res = $(preNeuron.pre).filter(postNeuron.post);
    if (res.length == 0){
	res = $(preNeuron.innervates).filter(postNeuron.innervates);
    };
    return(res[0])  /// We'll go with the first answer.
}

//function drawLink(preNeuron,postNeuron,strength,reliability){
function drawLink(table_line,summary_line){
   
    let connection_loc = guessConnectionLocation(NEURON_TYPES[table_line.preNeuron],
						 NEURON_TYPES[table_line.postNeuron]);

    let start_neuron = s.select("g[id='Full-"+table_line.preNeuron+"']");
    let end_neuron = s.select("g[id='Full-"+table_line.postNeuron+"']");
    
    
    // Firefox doesn't return anything with the Snap getBBox function... Apparently Firefox is respecting the svg specifications better
    // so we change to this "safe version"
    let start_box = s.select("use[id='"+table_line.preNeuron+"-"+ NEUROPILES_FULL_NAMES[connection_loc]+"']").node.getBBox();
    let end_box = s.select("use[id='"+table_line.preNeuron+"-"+ NEUROPILES_FULL_NAMES[connection_loc]+"']").node.getBBox();
    let start_points=[
	{x: start_box.x+start_box.width, y:start_box.y+start_box.height/2},
	{x: start_box.x, y:start_box.y+start_box.height/2}
	];
    let end_points=[
        {x: end_box.x+end_box.width, y:end_box.y+end_box.height/2},
	{x: end_box.x, y:end_box.y+end_box.height/2}
    ];
    
    // less start/end points for Gall and LAL as they have this bilateral innervation
    if ((connection_loc != "GA") & (connection_loc != "LAL")){
	start_points.push({x: start_box.x+start_box.width/2, y:start_box.y},
			  {x: start_box.x+start_box.width/2, y:start_box.y+start_box.height});
	end_points.push({x: end_box.x+end_box.width/2, y:end_box.y},
			{x: end_box.x+end_box.width/2, y:end_box.y+end_box.height});
    };
    let start_transfo = start_neuron.transform()
        .localMatrix.add(s.select("use[id='"+table_line.preNeuron+"-"+ NEUROPILES_FULL_NAMES[connection_loc]+"']").transform().localMatrix);
    let end_transfo = end_neuron.transform()
        .localMatrix.add(s.select("use[id='"+table_line.preNeuron+"-"+ NEUROPILES_FULL_NAMES[connection_loc]+"']").transform().localMatrix);
    
    
    start_points = start_points.map(st => ({x: start_transfo.x(st.x,st.y),
                                            y: start_transfo.y(st.x,st.y)}));
    
    end_points = end_points.map(st => ({x: end_transfo.x(st.x,st.y),
					y: end_transfo.y(st.x,st.y)}));
    
    
    let linkLength = 500000;
    for (st of start_points){
	for (ed of end_points){
            linkLengthNew = Snap.len(st.x,st.y,ed.x,ed.y);
            if (linkLengthNew < linkLength){
		linkLength = linkLengthNew;
		start_loc = st;
		end_loc = ed;
            };
	};
    };
    
    let linkStr = "M"+start_loc.x+" "+start_loc.y
        +"R "+((end_loc.x+start_loc.x)/2-(end_loc.y-start_loc.y)/7)+" "+((end_loc.y+start_loc.y+40)/2-(end_loc.x-start_loc.x)/7)+" "+
    end_loc.x+" "+ end_loc.y;
    
    let link_alpha = Math.log(Number(table_line.between_runs_corr)+1.1);
    
    let g = s.group().attr({
	"data-link": table_line.cellPair,
	"data-pre": table_line.preNeuron,
	"data-post": table_line.postNeuron
    });

    let link = s.path(linkStr).attr({
	id: table_line.cellPair,
	"connection_location": connection_loc,
	"data-pre": table_line.preNeuron,
	"data-post": table_line.postNeuron
    });
    
    if (start_neuron == end_neuron){
	g.attr({"visibility": "hidden"})
    };
 
    if (!summary_line.signif1){
        g.addClass("virtual-connector")
    };
    
    let link_outline = s.path(linkStr)
        .attr({id: table_line.cellPair+"_outline",
	       stroke: "transparent",    
               "stroke-width": 50
              });
        
    if (table_line.integNorm < 0){
	strength = -summary_line.distanceNorm + 0.08//- table_line.integNorm * 4;
	link.addClass("inhibitory-connector")
    } else {
	strength = summary_line.distanceNorm + 0.08//table_line.integNorm;
	link.addClass("excitatory-connector")
    }
    link.attr({"stroke-width": SCALE_LINKS*Math.sqrt(strength)});
    
    if (summary_line.expType !== "Overlapping"){
	link.attr({"stroke-dasharray": "30,20"});
    };
    
    link.addClass("connector");
    g.addClass("connector-clickable");
  
    link.node.setAttribute("stroke-opacity",link_alpha)
    //.node.setAttribute("fill-opacity",link_alpha)
          let title = Snap.parse('<title>'+table_line.cellPair+
			    '&#13Normalized distance : '+Number(table_line.distanceNorm).toFixed(3)+
                           '&#13Scaled normalized integral : '+Number(table_line.integNormScaled).toFixed(3)+
                           '&#13Within-flies correlations : '+Number(table_line.repeats_corr).toFixed(3)+
    			   '&#13Between-flies correlations : '+Number(table_line.between_runs_corr).toFixed(3)+'</title>')  ;
  
    
    g.append(link_outline);  
    g.append(link);
    g.append(title);
}

/// DRAG ZOOM THE DIAGRAM ///////////////////////////
function dragStart( x,y,ev ) {
        this.data('ot', this.transform().local );
}

function dragMove(dx, dy){
        let snapInvMatrix = this.transform().diffMatrix.invert();
        snapInvMatrix.e = snapInvMatrix.f = 0;
        let tdx = snapInvMatrix.x( dx,dy );
        let tdy = snapInvMatrix.y( dx,dy );
        this.transform( "t" + [ tdx, tdy ] + this.data('ot')  );
}

var intervalId
$("#zoomIn").mousedown(function(){
    zoomIn();
    intervalId = setInterval(zoomIn,25);
}).mouseup(function(){
    clearInterval(intervalId);
}).mouseout(function(){
    clearInterval(intervalId);
});

$("#zoomOut").mousedown(function(){
    zoomOut();
    intervalId = setInterval(zoomOut,25);
}).mouseup(function(){
    clearInterval(intervalId);
}).mouseout(function(){
    clearInterval(intervalId);
});

$("#zoomReset").click(function(){
    s.transform("1 1 0 0 0 0");
    $(".legend-connector.width-connector").map(function(){
	$(this).data("virtualwidth",parseFloat(SCALE_LINKS*Math.sqrt($(this).data("strength")))*scale_factor)
	$(this).css("stroke-width",$(this).data("virtualwidth"));
    })
})

function zoomIn(){zoomDiagram(1.02,DIAGRAM_WIDTH/2,DIAGRAM_HEIGHT/2);}
function zoomOut(){zoomDiagram(1/1.02,DIAGRAM_WIDTH/2,DIAGRAM_HEIGHT/2);}

s.drag(dragMove,dragStart);
    
function zoomDiagram(delta,x,y){
    s.transform(s.transform().localMatrix.scale(delta,delta,x,y).toTransformString());
    // We need to update the legend
    $(".legend-connector.width-connector").map(function(){
    	$(this).data("virtualwidth",parseFloat($(this).data("virtualwidth"))*delta);
	$(this).css("stroke-width",$(this).data("virtualwidth"));
    })
}

/// END DRAG ZOOM THE DIAGRAM ///////////////////////////////////

/// Get some statistics
let nNeurons = Object.keys(NEURON_TYPES).length;
let nPairs = Object.keys(SUPER_SUMMARY).length;
let nSignif = 0;
for (let k in SUPER_SUMMARY){
    if (SUPER_SUMMARY[k]["signif1"]){nSignif+=1}
}
$("#numbers").text("The current diagram contains " + nNeurons + " neurons and "+nPairs+" pairs have been tested. Of those, " + nSignif + " are considered significant.");

/// Plot the matrix plot
makeMatrixPlot("distanceNorm");
/// The plots don't resize automatically otherwise

window.onresize = function(){
    Plotly.Plots.resize($("#rawPlot").get()[0])
    Plotly.Plots.resize($("#matrixPlot").get()[0])
    Plotly.Plots.resize($("#baselinePlot").get()[0])
    Plotly.Plots.resize($("#dosePlot").get()[0])
    Plotly.relayout("matrixPlot",matlayout)
}



