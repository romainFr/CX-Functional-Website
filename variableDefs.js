// Neuropiles and colors
const EXC_COLOR = getComputedStyle(document.body).getPropertyValue("--excitatory-color");
const INH_COLOR =  getComputedStyle(document.body).getPropertyValue('--inhibitory-color');
const HGH_COLOR =  getComputedStyle(document.body).getPropertyValue('--highlight-color');

const POSSIBLE_NEUROPILES = ["PB","FB","EB","NO","GA","LAL",
                          //"cre",
                          //"rub",
			  //"BU"
			 ];
const NEUROPILES_FULL_NAMES = {PB:"Protocerebral_bridge",
                             FB:"Fan_shaped_body",
                             EB:"EB",
                             NO:"Noduli",
                             GA:"Gall",
                             LAL:"LAL",
                             Gall: "Gall",
                             //cre:"crepine",
                             rub:"Rubus",
                             BU:"bu"
                            };

//http://tools.medialab.sciences-po.fr/iwanthue/index.php
const NEUROPILES_COLORS = {
    PB: "#CAD3FE",//"#94a6fd",
    FB: "#C28FD2",//"#841ea4",
    EB:"#B4DBE2",//"#69b7c5",
    NO: "#84ABC1",//"#085782",
    GA: "#EDB9FC",//"#da73f8",
    Gall:"#EDB9FC",// "#da73f8",
    LAL: "#B8A7CC",//"#714e98",
    //cre:"#21a645",
    rub:"#285d28",
    BU:"#9db46a"
};

const NEUROPILES_COLORS_DARK = {
    PB: "#94a6fd",
    FB: "#841ea4",
    EB:"#69b7c5",
    NO: "#085782",
    GA: "#da73f8",
    Gall: "#da73f8",
    LAL: "#714e98",
    //cre:"#21a645",
    rub:"#285d28",
    BU:"#9db46a"
};

const PULSE_N = ['1','5','10','20','30'];


const PLOT_COLORS = ["#94a6fd",
     "#841ea4",
   "#69b7c5",
    "#085782",
    "#da73f8",
    "#21a645",
    "#285d28",
    "#9db46a"]

const FLY_LIGHT = "https://flweb.janelia.org/cgi-bin/view_flew_imagery.cgi?line=R";
