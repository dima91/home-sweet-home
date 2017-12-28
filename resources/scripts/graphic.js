// Riferimento al div contenente il canvas
var planContainer= null;
// Riferimento al canvas principale
var mainCanvas= null;
// Contesto del canvas principale
var mainContext= null;
// Matrice di trasformazione del canvas --> è la matrice w2v!
var mainMatrix= null;
// Variabile per indicare che il contenuto del canvas è stato aggiornato
var invalidated= false;
// Dimensioni della piantina
var planSize= {width:0, height:0, maxWidth:0, maxHeight:0};
// Posizione corrente del mouse
var currMousePos= {x:0, y:0};
// Posizione precedente del mouse
var prevMousePos= {x:0, y:0};
// Variabili per la scalatura
var scaleOffsetLower= 1.001;
var scaleOffsetHigher= 1.05;
var minScale= 1.5;
var maxScale= 6;
// Lunghezza dela lato di una cella della griglia (in pixel)
var cellLen= 20;
// Variabile per dire che devo disegnare la griglia
var toDrawGrid= true;

// Valore massimo per l'area della piantina (in m²)
var maxPlanArea= 3600;





function setupGraphic() {
	var i=0, w=0, h=0;
	
	planContainer= document.getElementById("planContainer");
	mainCanvas= document.getElementById("mainCanvas");
	mainContext= mainCanvas.getContext("2d"); 
	mainMatrix= document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
	
	// Setto le dimensioni del canvas e (massime) della piantina
	mainCanvas.width= planContainer.offsetWidth;
	mainCanvas.height= planContainer.offsetHeight;
	
	w= mainCanvas.width;
	w= w-(w%cellLen)+1;
	planSize.maxWidth= w;
	
	h= mainCanvas.height;
	h= h-(h%10)+1;
	planSize.maxHeight= h;
	
	invalidated= true;
	
	setupComponents();
	
	/*console.log ("planSize.width: "+ planSize.width +"\tplanSize.height: "+ planSize.height
			+"\nplanSize.maxWidth: "+ planSize.maxWidth +"\tplanSize.maxHeight: "+ planSize.maxHeight
			+"\nmainCanvas.width: "+ mainCanvas.width +"\tmainCanvas.height: "+ mainCanvas.height
			+"\nmainCanvas.clientLeft: "+ mainCanvas.clientLeft +"\tmainCanvas.clientTop: "+ mainCanvas.clientTop);*/
};





/* Funzione per creare una nuova piantina
 */
function newPlan(w, h) {
	var w=Number(Number(w).toFixed(0));
	var h=Number(Number(h).toFixed(0));
	var l=cellLen;
	
	w= w-(w%cellLen)+1;
	h= h-(h%cellLen)+1;
	planSize.height= h;
	planSize.width= w;
	
	mainMatrix= document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
	
	invalidated= true;
	
	setupComponents();
	resetPlanView();
	
	console.log ("newPlan  --> w: "+ w +"\th: "+ h);
}





/* Funzione per trasformare un punto nelle coordinate rispetto all'origine del canvas
 */
function viewCoord(p) {
	var pv= {x:0, y:0};
	
	pv.x= p.x- mainCanvas.offsetLeft;
	pv.y= p.y- mainCanvas.offsetTop;
	
	//console.log ("viewCoord  -->  p.x:"+ p.x +"\tp.y: "+ p.y +"\tpv.x: "+ pv.x +"\tpv.y: "+ pv.y);
	
	return pv;
};





/* Funzione per trasformare un punto da coordinate della finestra a coordinate mondo
 */
function v2w(p) {
	var pw= transformPoint(p, mainMatrix.inverse());
	// console.log ("v2w  -->  pw.x: "+ pw.x +"\tpw.y: "+ pw.y);
	return pw;
};




		
/* Funzione per memorizzare la nuova posizione del mouse
 */
function saveMousePos(p) {
	var pw= viewCoord(p);
	//console.log("saveMousePos  -->  scaleLevel: "+ scaleLevel);
	prevMousePos.x= currMousePos.x;
	prevMousePos.y= currMousePos.y;
	currMousePos.x= pw.x;
	currMousePos.y= pw.y;
};





/* Funzione per stabilire se il punto passato come parametro sta nella piantina
 */
function hitPlan(p) {
	var pw= v2w(p);
	//console.log ("hitPlan  -->  pp.x: "+ pPlan.x +"\tpp.y: "+ pPlan.y +"\tps.W: "+ planSize.width*scaleLevel +"\tps.H: "+ planSize.height*scaleLevel);
	return (pw.x>0 && pw.y>0 && pw.x<(planSize.width) && pw.y<(planSize.height));
};





/* Funzione per posizionare il centro della piantina al centro del div, annullando ogni traslazione e ogni scalatura.
 */
function resetPlanView() {
	//console.log("resetPlanView  -->  mainContext: "+ mainContext);
	mainMatrix= document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
	mainContext.setTransform (1, 0, 0, 1, 0, 0);
	//document.getElementById("scaleLevel").innerHTML= "Scale level: " + scaleLevel;

	centerFocus();
};





/* Funzione per pulire il canvas
 */
function cleanCanvas() {
	//console.log("cleanCanvas  -->  mainContext: "+ mainContext);
	/*var nCW=Number((mainCanvas.width/cellLen).toFixed(0));
	var nCH=Number((mainCanvas.height/cellLen).toFixed(0));
	console.log("cleanCanvas  -->  nCW: "+ nCW +"\tnCH: "+ nCH);*/
	mainContext.setTransform(1,0,0,1,0,0);
	//mainContext.clearRect(0,0,mainCanvas.width, mainCanvas.height);
	mainContext.fillStyle="#F0F4C3";
	mainContext.fillRect(0,0,mainCanvas.width, mainCanvas.height);
	invalidated= true;
	/*var el= document.getElementsByClassName("accordionPanel")[0];
	var style= window.getComputedStyle(el).getPropertyValue("background-color");
	mainContext.fillStyle=style;
	mainContext.fillRect(0,0,mainCanvas.width, mainCanvas.height);*/
};





/* Funzione per disegnare la griglia
 */
function drawGrid() {
	//console.log ("Drawing grid");
	var i=0, j=0, w=planSize.width, h=planSize.height, l=cellLen;
	var sl= mainMatrix.a, op=1;

	mainContext.save();

	mainContext.fillStyle="#FFFFFF";
	mainContext.fillRect(0,0,w-1,h-1);

	if (toDrawGrid) {
		// Disegno la griglia "in mezzo" in funzione del livello di scala
		if (sl>3) {
			mainContext.save();

			mainContext.setLineDash([2,3]);
			mainContext.beginPath();
			op= (sl - 3).toFixed(5);

			mainContext.lineWidth= 0.5;
			mainContext.strokeStyle= "rgba(210, 210, 210, "+ op +")";

			for (i=l/2;i<w;i+=l) {
				mainContext.moveTo(i,0);
				mainContext.lineTo(i,h-1);
			}
			for (i=l/2;i<h;i+=l) {
				mainContext.moveTo(0,i);
				mainContext.lineTo(w-1,i);
			}

			mainContext.stroke();

			mainContext.restore();
		}

		mainContext.beginPath();
		mainContext.strokeStyle= "#c9c9c9";
		mainContext.lineWidth= 0.5;
		mainContext.font= "5px Raleway";
		mainContext.fillStyle= "black";

		// Disegno la griglia
		for (i=0;i<w;i+=l) {
			mainContext.moveTo(i,0);
			mainContext.lineTo(i,h-1);
			mainContext.fillText(i/cellLen, i-(mainContext.measureText(i).width/4), -2);
		}
		for (i=0;i<h;i+=l) {
			mainContext.moveTo(0,i);
			mainContext.lineTo(w-1,i);
			if(i!=0) {
				mainContext.fillText(i/cellLen, -(mainContext.measureText(i).width/2)-1, i);
			}
		}

		mainContext.stroke();
	}

	mainContext.restore();
};





// Funzione per disegnare i componenti (muri e mobilio) della piantina
function drawComponents() {
	var walls= planComponents.walls;
	var wlen= walls.length;
	var fornitures= planComponents.fornitures;
	var flen= fornitures.length;
	var i=0;
	//console.log("drawComponents  -->  walls.lenht: "+ wlen +"\tfornitures.length: "+ flen);
	
	for (i=0; i<wlen; i++) {
		walls[i].fDraw(mainContext, mainMatrix);
	}
	
	for (i=0;i<flen; i++) {
		fornitures[i].fDraw(mainContext, mainMatrix);
	}
};





/* Funzione per disegnare TUTTO il contenuto del canvas
 * Pulisco prima il canvas, disegno la griglia e disegno i componenti della piantina
 */
function drawPlan() {
	// console.log ("drawPlan  -->  mainMatrix.a: "+ mainMatrix.a +"\tmainMatrix.d: "+ mainMatrix.d);
	if (invalidated) {
		cleanCanvas();

		//mainContext.setTransform(mainMatrix.a, mainMatrix.b, mainMatrix.c, mainMatrix.d, mainMatrix.e, mainMatrix.f);
		setTransformMatrix(mainContext, mainMatrix);

		drawGrid();

		drawComponents();
		
		invalidated= false;
	}
};





/* FIXME Funzione per traslare l'intera piantina di un dato offset
 */
function translatePlan(o) {
	//console.log ("translatePlan-->  dx: "+ o.dx +"\tdy: "+ o.dy);
	//console.log ("translatePlan-->  mainContext: "+ mainContext);
	mainMatrix= mainMatrix.translate(o.dx, o.dy);
	
	invalidated=true;
};





/* Funzione per posizionare la piantina all'origine del sistema di coordinate del canvas
 */
function planToOrigin() {
	var mm= mainMatrix;
	var d= {dx:-(mm.e/mm.a), dy:-((mm.f)/mm.d)};
	//console.log ("planToOrigin  -->  mainMatrix.e: "+ mainMatrix.e +"\t.mainMatrix.f: "+ mainMatrix.f +"\tscaleLevel: "+ scaleLevel);
	translatePlan(d);
	
	return d;
};





/* FIXME Funzione per centrare la piantina all'interno del canvas a prescindere dal livello di scalatura
 * Traslo la griglia nell'origine del canvas, calcolo qua 
 */
function centerFocus() {
	var zoom= false;
	var offH= (Number((mainCanvas.height*9/100).toFixed(0)));
	var offW= 15;
	var dx=0, dy=0;


	while (((planSize.width * mainMatrix.a < mainCanvas.width-(offW+50)) || (planSize.height * mainMatrix.a < mainCanvas.height-(offH+50))) && (zoomInCenterView())) {
		/*zoom= true;
		console.log("centerFocus  -->  zoom in");*/
	}
	
	
	zoom= false;
	while (((planSize.width * mainMatrix.a > mainCanvas.width-(offW+50)) || (planSize.height * mainMatrix.a > mainCanvas.height-(offH+50))) && (zoomOutCenterView())) {
		/*zoom= true;
		console.log("centerFocus  -->  zoom out");*/
	}
	
	
	planToOrigin();
	offH= offH/mainMatrix.a;
	offW= offW/mainMatrix.a;
	translatePlan({dx:offW, dy:offH});
	
	/*console.log("centerFocus --> typeof offH: "+ typeof offH +"\ttypeof offW: "+ typeof offW +"offH: "+ offH +"\toffW: "+ offW);
	console.log("centerFocus --> typeof mC.h: "+ typeof mainCanvas.height +"\ttypeof mC.w: "+ typeof mainCanvas.width);*/
	//console.log("centerFocus --> remW: "+ (mainCanvas.width-offW-(planSize.width*mainMatrix.a)) +"remH: "+ (mainCanvas.height-offH-(planSize.height*mainMatrix.a)));
	
	/*console.log("centerFocus  -->  w: "+ planSize.width*mainMatrix.a +"\th: "+ planSize.height*mainMatrix.a +"\tps.w: "+ planSize.width +"\tps.h: "+ planSize.height +"\tmC.w: "+ mainCanvas.width +"\tmC.h: "+ mainCanvas.height +"\toffW: "+ offW +"\toffH: "+ offH);*/
	
	//translatePlan({dx:(offW/mainMatrix.a)*2/3, dy:(offH/mainMatrix.a)*2/3});
	
	/*dx= Number(((mainCanvas.width - (mainMatrix.e/2) - (planSize.width*mainMatrix.a))/2).toFixed(0));
	dy= Number(((mainCanvas.height - (mainMatrix.f/2) - (planSize.height*mainMatrix.a))/2).toFixed(0));*/
	
	dx= (mainCanvas.width-offW-(planSize.width*mainMatrix.a))/2;
	dy= (mainCanvas.height-offH-(planSize.height*mainMatrix.a))/2;
	
	
	//console.log("centerFocus  -->  dx: "+ dx +"\tdy: "+ dy);
	
	translatePlan({dx:dx/mainMatrix.a, dy:dy/mainMatrix.a});
};





/* Incrementa il valore di "scaleOffset" se non supera "maxScale" e ridisegna la piantina
 * Restituisce "true" se è stato modificato "scaleLevel", false altrimenti
 */
function increaseScale(s) {
	if (mainMatrix.scale(s).a<=maxScale) {
		mainMatrix= mainMatrix.scale(s);
		document.getElementById("scaleLevel").innerHTML= "Scale level: " + mainMatrix.a;
		
		invalidated= true;
		
		return true;
	}
	
	return false;
};





/* Decrementa il valore di "scaleOffset" se non è inferiore a "minScale" e ridisegna la piantina
 * Restituisce "true" se è stato modificato "scaleLevel", false altrimenti
 */
function decreaseScale(s) {
	if (mainMatrix.scale(1/s).a>=minScale) {
		mainMatrix= mainMatrix.scale(1/s);
		document.getElementById("scaleLevel").innerHTML= "Scale level: " + scaleLevel;
		
		invalidated= true;
		
		return true;
	}

	return false;
};





/* Funzione per fare zoom in della piantina rispetto a un punto p (in coordinate della finestra) di un valore basso
 */
function zoomInLow(p) {
	var pw= v2w(p);
	var toRet= false;
	
	translatePlan({dx:pw.x, dy:pw.y});
	toRet= increaseScale(scaleOffsetLower);
	translatePlan({dx:-pw.x, dy:-pw.y});
	
	invalidated= true;
	
	return toRet;
};





/* Funzione per fare zoom out della piantina rispetto a un punto p (in coordinate della finestra) di un valore basso
 */
function zoomOutLow(p) {
	var pw= v2w(p);
	var toRet= false;
	
	translatePlan({dx:pw.x, dy:pw.y});
	toRet= decreaseScale(scaleOffsetLower);
	translatePlan({dx:-pw.x, dy:-pw.y});
	
	invalidated= true;
	
	return toRet;
};





/* Funzione per fare zoom in della piantina rispetto a un punto p (in coordinate della finestra) di un valore alto
 */
function zoomInHigh(p) {
	var pw= v2w(p);
	var toRet= false;
	
	translatePlan({dx:pw.x, dy:pw.y});
	toRet= increaseScale(scaleOffsetHigher);
	translatePlan({dx:-pw.x, dy:-pw.y});
	
	invalidated= true;
	
	
	return toRet;
};





/* Funzione per fare zoom out della piantina rispetto a un punto p (in coordinate della finestra) di un valore alto
 */
function zoomOutHigh(p) {
	var pw= v2w(p);
	var toRet= false;
	
	translatePlan({dx:pw.x, dy:pw.y});
	toRet= decreaseScale(scaleOffsetHigher);
	translatePlan({dx:-pw.x, dy:-pw.y});
	
	invalidated= true;
	
	return toRet;
};





/* Funzione per fare zoom in della piantina rispetto al centro corrente della vista
 */
function zoomInCenterView() {
	invalidated= true;
	return zoomInLow({x:mainCanvas.width/2, y:mainCanvas.height/2});
}





/* Funzione per fare zoom out della piantina rispetto al centro corrente della vista
 */
function zoomOutCenterView() {
	invalidated= true;
	return zoomOutLow({x:mainCanvas.width/2, y:mainCanvas.height/2});
}





/* Funzione per disabilitare l'elemento con uno speciico id
 */
function disableElement(id) {
	document.getElementById(id).classList.remove("enabledMenuItem");
	document.getElementById(id).classList.add("disabledMenuItem");
	var e = document.getElementById(id);
	e= e.childNodes[1];
	
	//console.log("disableElement  -->  id: "+ id);
	
	
	switch (id) {
		case "delete" :
			e.src="./resources/imgs/icons/delete_grey.svg";
			break ;
		case "copy" :
			e.src="./resources/imgs/icons/content_copy_grey.svg";
			break ;
		case "cut" :
			e.src="./resources/imgs/icons/content_cut_grey.svg";
			break ;
		case "paste" :
			e.src="./resources/imgs/icons/content_paste_grey.svg";
			break ;
		case "zoomincomp" :
			e.src="./resources/imgs/icons/zoom_in_grey.svg";
			break ;
		case "zoomoutcomp" :
			e.src="./resources/imgs/icons/zoom_out_grey.svg";
			break ;
		case "rotateleftcomp" :
			e.src="./resources/imgs/icons/rotate_left_grey.svg";
			break ;
		case "rotaterightcomp" :
			e.src="./resources/imgs/icons/rotate_right_grey.svg";
			break ;
		case "rotateleft45comp" :
			e.src="./resources/imgs/icons/rotate_left_45_grey.svg";
			break;
		case "rotateright45comp" :
			e.src="./resources/imgs/icons/rotate_right_45_grey.svg";
			break;
	}
}





/* Funzione perabilitare l'elemento con uno specifico id
 */
function enableElement(id) {
	document.getElementById(id).classList.remove("disabledMenuItem");
	document.getElementById(id).classList.add("enabledMenuItem");
	var e = document.getElementById(id);
	e= e.childNodes[1];
	
	//console.log("enableElement  -->  id: "+ id);

	switch (id) {
		case "delete" :
			e.src="./resources/imgs/icons/delete_white.svg";
			break ;
		case "cut" :
			e.src="./resources/imgs/icons/content_cut_white.svg";
			break ;
		case "copy" :
			e.src="./resources/imgs/icons/content_copy_white.svg";
			console.log("hi!!! -->  e.src: "+ e.src +"\te: "+ e);
			break ;
		case "paste" :
			e.src="./resources/imgs/icons/content_paste_white.svg";
			break ;
		case "zoomincomp" :
			e.src="./resources/imgs/icons/zoom_in_white.svg";
			break ;
		case "zoomoutcomp" :
			e.src="./resources/imgs/icons/zoom_out_white.svg";
			break ;
		case "rotateleftcomp" :
			e.src="./resources/imgs/icons/rotate_left_white.svg";
			break ;
		case "rotaterightcomp" :
			e.src="./resources/imgs/icons/rotate_right_white.svg";
			break ;
		case "rotateleft45comp" :
			e.src="./resources/imgs/icons/rotate_left_45_white.svg";
			break;
		case "rotateright45comp" :
			e.src="./resources/imgs/icons/rotate_right_45_white.svg";
			break;
	}
}