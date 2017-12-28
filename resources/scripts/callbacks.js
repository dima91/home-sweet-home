// Flag per segnalare che si deve muovere o si sta muovendo la piantina
var movingPlan= false;
// Flag per segnalare che si deve disegnare un muro quando c'è l'onMouseDown
var haveToDrawWall=false;
// Flag per segnalare che si sta disegnando o aggiornando i vertici di un muro
var updatingWall= false;
// Flag per segnalare che si sta aggiornando un mobile
var updatingForn= false;

// Valore standard (in millisecondi) per i timer dei bottoni
var stdShortIntervalMs= 5;
var stdLongIntervalMs= 40;
// ID del timer per lo zoom in della piantina
var zoomInPlanIntervalID=0;
// ID del timer per lo zoom out della piantina
var zoomOutPlanIntervalID=0;
// ID del timer per lo zoom in del componente selezionato
var zoomInComponentIntervalID= 0;
// ID del timer per lo zoom out del componente selezionato
var zoomOutComponentIntervalID= 0;
// ID del timer per la rotazione antioraria del componente selezionato
var leftRotateComponentIntervalID= 0;
// ID del timer per la rotazione oraria del componente selezionato
var rightRotateComponentIntervalID= 0;
// ID del timer per l'incremento dello spessore di un muro
var wallSizeIncrIntervalID= 0;
// ID del timer per il decremento dello spessore di un muro
var wallSizeDecrIntervalID= 0;

// ID del timer per cancellare il muro
var wallInterval= null;
// ID del timer per cancellare il mobile
var fornInterval= null;
// Variabile per ricordarsi a quale iterazione della cancellazione del muro  del mobile sono
var iter= 0;
// Variabile per ricordarsi quale componente sto cancellando
var  dc= null;

// Variabile per sapere che voglio fare sulla piantina
var actionOnPlan= 0;

// Variabile per ricordarsi la cosa tagliata o copiata
var cutOrCopy= null;
// Variabile per memorizzare di quanto è ruoato l'oggetto da spostare
var pasteRotation= 0;
// Variabile per sapere se sto copiando un muro o un mobile
var typeOfPaste= "";

// Variabile per vedere se fare l'animazione iniziale
var seeSatrtAnimation= true;

var ID= null;





/* Funzione per attivare lo snackbar buono per 1,5 secondi
 */
function activeGSB() {
	var f= function() {console.log("Timeout"); document.getElementById("goodSnackbar").classList.remove("active");}
	document.getElementById("goodSnackbar").classList.add("active");
	window.setTimeout(f, 2000);
}





/* Funzione per attivare lo snackbar cattivo per 1,5 secondi
 */
function activeBSB() {
	var f= function() {console.log("Timeout"); document.getElementById("badSnackbar").classList.remove("active");}
	document.getElementById("badSnackbar").classList.add("active");
	window.setTimeout(f, 2000);
}





/* Funzione per attivare un item del menù (e disattivare gli altri item)
 */
function toggleMenuItem(id) {
	console.log("toggleMenuItem  -->  call of me!");
	
	if (id=="newPlan") {
		document.getElementById("savePlan").classList.remove("active");
		document.getElementById("loadPlan").classList.remove("active");
	}
	else if (id=="savePlan") {
		document.getElementById("newPlan").classList.remove("active");
		document.getElementById("loadPlan").classList.remove("active");
	}
	else if (id=="loadPlan") {
		document.getElementById("newPlan").classList.remove("active");
		document.getElementById("savePlan").classList.remove("active");
	}
	
	document.getElementById(id).classList.toggle("active");
}





// Funzione chiamata quando viene caricata la pagina
function onLoad() {
	var fn= "";

	setupGraphic();
	
	// HEADER
	var dc= document.getElementById("dropdown-content");
	var w2= dc.clientWidth/2;
	var ce, e, pad, enter, acc, l;
	var h=0, w=0;
	
	document.getElementById("newPlan").onclick= function() {
		if(!dc.classList.contains("show")) {
			document.getElementById("widthInput").value= "";
			document.getElementById("heightInput").value= "";
			document.getElementById("nameFileInput").value= "";
		}
		
		toggleMenuItem("newPlan");
		
		document.getElementById("nameFileDiv").classList.add("disabled");
		document.getElementById("planSizeDiv").classList.remove("disabled");
		
		if (!dc.classList.contains("show") || actionOnPlan == 0) {
			dc.classList.toggle("show");
		}
		actionOnPlan=0;
	}
	
	document.getElementById("savePlan").onclick= function() {
		if(!dc.classList.contains("show")) {
			document.getElementById("widthInput").value= "";
			document.getElementById("heightInput").value= "";
			document.getElementById("nameFileInput").value= "";
		}
		
		//toggleMenuItem("savePlan");
		
		document.getElementById("nameFileDiv").classList.remove("disabled");
		document.getElementById("planSizeDiv").classList.add("disabled");
		
		if (!dc.classList.contains("show") || actionOnPlan == 1) {
			dc.classList.toggle("show");
		}
		actionOnPlan=1;
	}
	
	document.getElementById("loadPlan").onclick= function() {
		if(!dc.classList.contains("show")) {
			document.getElementById("widthInput").value= "";
			document.getElementById("heightInput").value= "";
			document.getElementById("nameFileInput").value= "";
		}
		
		//toggleMenuItem("loadPlan");
		
		document.getElementById("nameFileDiv").classList.remove("disabled");
		document.getElementById("planSizeDiv").classList.add("disabled");
		
		if (!dc.classList.contains("show") || actionOnPlan == 2) {
			dc.classList.toggle("show");
		}
		actionOnPlan=2;
	}
	
	enter= function(ev) {if (ev.code == "Enter") {applyActionOnPlan()}};
	document.getElementById("widthInput").onkeydown=enter;
	document.getElementById("heightInput").onkeydown= enter;
	
	
	enter= function(ev) {if (ev.code == "Enter") {applyActionOnPlan();}};
	document.getElementById("nameFileInput").onkeydown= enter;
	
	
	
	
	// LEFT_SIDEBAR
	acc = document.getElementsByClassName("accordionButton");
	l= acc.length;
	for (i = 0; i < l; i++) {
		acc[i].onclick= function() {
			this.getElementsByTagName("img")[0].classList.toggle("rotate");
			this.classList.toggle("active");
			this.nextElementSibling.classList.toggle("show");
		}
	}
	
	document.getElementById("wallSize").value= "1";
	
	
	
	
	// SNACKBAR
	var sb= document.getElementById("goodSnackbar");
	sb.style.left= ((screen.width- sb.clientWidth)/2).toFixed(0) + "px";
	
	sb= document.getElementById("badSnackbar");
	sb.style.left= ((screen.width- sb.clientWidth)/2).toFixed(0) + "px";
	
	
	
	
	// CHECKBOX
	if(!document.getElementById("sidebarSwitch").checked) {
		document.getElementById("sidebar_enabler").style.display="some";
		onSidebarEnablerTogglerClick();
	}
	
	/*if (document.getElementById("animationSwitch").checked)
		seeSatrtAnimation= false;
	else
		seeSatrtAnimation= true;*/
	seeSatrtAnimation= !document.getElementById("animationSwitch").checked;
	
	
	
	
	// LOGO
	var l1= document.getElementById("logo1");
	var l2= document.getElementById("logo2");
	var l3= document.getElementById("logo3");
	
	l1.style.left= ((window.innerWidth-l1.clientWidth)/2).toString() + "px";
	l1.style.bottom= ((window.innerHeight/2 + l2.clientHeight/2)).toString() + "px";
	
	l2.style.left= ((window.innerWidth-l2.clientWidth)/2).toString() + "px";
	l2.style.top= ((window.innerHeight/2 - l2.clientHeight/2)).toString() + "px";

	l3.style.left= ((window.innerWidth-l3.clientWidth)/2).toString() + "px";
	l3.style.top= ((window.innerHeight/2 + l2.clientHeight/2)).toString() + "px";
	
	
	// PER IL DEBUG!!!!
	/*newPlan(20*20, 10*20);
	resetPlanView();*/
	
	
	var ls= document.getElementsByClassName("loading-bar");
	
	// Faccio vedere il canvas
	var fi= function() {
		console.log("call of i");
		document.getElementById("wrapper").style.opacity=1;
		l1.style.transition= "1s";
		l2.style.transition= "1s";
		l3.style.transition= "1s";

		l1.style.opacity=0;
		l2.style.opacity=0;
		l3.style.opacity=0;
		l1.style.left="120%";
		l2.style.left="-120%";
		l3.style.left="120%";
		
		document.getElementById("body").style.cursor="auto";
		
		if (document.getElementById("gridSwitch").checked) {
			toDrawGrid= false;
		}
		else {
			toDrawGrid= true;
		}
		
		console.log("End of setup!!");
		window.requestAnimationFrame(onDraw);
	}
	// Faccio tremare il logo
	var h= function() {
		l1.classList.add("animated");
		l2.classList.add("animated");
		l3.classList.add("animated");
		
		window.setTimeout(fi,200);
	}
	// Faccio vedere il logo
	var g= function() {
		l1.style.opacity=1;
		l2.style.opacity=1;
		l3.style.opacity=1;
		
		window.setTimeout(h, 3500);
	}
	// Disattivo il loader e faccio vedere il logo
	var f= function() {
		document.getElementById("loader").style.visibility= "hidden";
		
		window.setTimeout(g, 500);
		console.log("end of f");
	};
	// Disattivo il loader e non faccio vedere il logo
	var f1= function() {
		document.getElementById("loader").style.visibility= "hidden";
		
		window.setTimeout(f, 200);
		console.log("end of f1");
	}
	
	
	/* Aspetto un secondo e avvio tutto quanto!! */
	window.setTimeout(f1, 1000);
}





/* Funzione per eseguire l'azione in base al valore di  actionOnPlan
 */
function applyActionOnPlan() {
	var fn="";
	var w=0, h=0;
	
	disableComponentsButton();
	document.getElementById("dropdown-content").classList.toggle("show");
	
	if (actionOnPlan == 0) {
		// Devo creare una nuova piantina
		console.log("Creating new plan");
		
		w= document.getElementById("widthInput").value;
		h= document.getElementById("heightInput").value;
		
		// TODO Controlla che siano valori accettabili
		onCreateNewPlan(w, h);
	}
	if (actionOnPlan == 1) {
		// Devo salvare la piantina
		console.log("Saving plan");
		fn= document.getElementById("nameFileInput").value;
		
		// TODO Controlla che sia un valore accettabile
		onSavePlan(fn);
	}

	else if (actionOnPlan == 2) {
		// Devo caricare la piantina
		console.log("Loading plan");
		fn= document.getElementById("nameFileInput").value;
		
		// TODO Controlla che sia un valore accettabile
		onLoadPlan(fn);
	}
}





/* Funzione convertitrice
 */
function planStringfier(k, v) {
	//console.log ("planStringfier  -->  k: "+ k +"\tv: "+ v);
	//console.log ("planStringfier  -->  k: "+ k +"\tv: "+ v +"\ttypeof k: "+ typeof k +"\tk.toString(): "+ k.toString());
	var i=0;
	
	switch (k.toString()) {
		case "matrix" :
			v= {a:v.a, b:v.b, c:v.c, d:v.d, e:v.e, f:v.f};
			break;
			
		case "m" :
			v= {a:v.a, b:v.b, c:v.c, d:v.d, e:v.e, f:v.f};
			
	}
	
	return v;
}





/* Funzione convertitrice inversa
 */
function planParser(k, v) {
	//console.log ("planParser  -->  k: "+ k +"\tv: "+ v +"\ttypeof k: "+ typeof k +"\tk.toString(): "+ k.toString());
	
	switch (k.toString()) {
		
		case "planWidth" :
			v= Number(v);
			break;
		
			
		case "planHeight" :
			v= Number(v);
			break;
			
		
		case "walls" :
			break ;
			
			
		case "fornitures" :
			break;
	}
	
	return v;
}






/* Funzione per salvare la piantina su un file nel filesystem
 * Creo l'oggetto da salvare, lo stringhifizzo (JSON.stringfy) e lo salvo nel localStroage
 * Devo salvare:
 	le dimensioni della piantina, i componenti (per OGNUNO devo memorizzare TUTTI i suoi componenti, in modo da poterlo ricreare così come è)
 */
function onSavePlan(fn) {
	console.log ("savePlan -->  fn: "+ fn);
	
	if ((fn == null) || (fn == "")) {
		activeBSB();
		return ;
	}
	
	// Devo salvare tutto!!!  -->  prendo e butto tutto in localStorage
	var plan= {
		planWidth : (planSize.width-1)/cellLen,
		planHeight : (planSize.height-1)/cellLen,
		walls: planComponents.walls,
		nextWallIndex: nextWallIndex,
		fornitures: planComponents.fornitures,
		nextFornIndex: nextFornIndex
	};
	
	localStorage.setItem(fn, JSON.stringify(plan, planStringfier));
	
	activeGSB();
}





/* Funzione per caricare una piantina da un file presente nel filesystem
 * Ottengo l'oggetto dal localStorage, lo parso (JSON.parse) e carico la piantina ottenuta
 */
function onLoadPlan(fn) {
	var w=0, h=0, i=0;
	var c= null;
	console.log ("loadPlan -->  fn: "+ fn);
	
	if ((fn==null) || (fn=="")) {
		activeBSB();
		return ;
	}
	
	var plan= localStorage.getItem(fn);
	if (plan==null) {
		activeBSB();
		return ;
	}
	plan= JSON.parse(plan, planParser);
	
	w= plan.planWidth;
	h= plan.planHeight;
	onCreateNewPlan(w,h);
	//console.log("onLoadPlan  -->  w: "+ w +"\th: "+ h +"\tplan.walls.length: "+ plan.walls.length);
	
	for(i=0;i<plan.walls.length;i++) {
		console.log ("onLoadPlan  -->  walls[i]: "+ plan.walls[i]);
		var w1= plan.walls[i];
		
		var w= {
			// Profondità (spessore) del muro in pixel
			depth: w1.depth,
			// Lunghezza del muro
			length: w1.length,
			// Matrice di trasformazione associata al muro (necessaria per la rotazione)
			matrix: document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix(),
			// Indice del muro all'interno dell'array "walls"
			i: w1.i,
			// Lunghezza del raggio delle maniglie
			rLen: w1.rLen,
			// Vertice correntemente selezionato
			selectedVertex: w1.selectedVertex,
			// Funzione per disegnare ll muro
			fDraw: drawWall,
			// Funzione per vedere se clicko il muro
			hitTest: hitWall,
			// Funzione per vedere se clicko una delle due maniglie
			hitHandle: hitWallHandle,
			// Funzione per clonare il muro
			clone: cloneWall
		}
		w.matrix.a= w1.matrix.a;
		w.matrix.b= w1.matrix.b;
		w.matrix.c= w1.matrix.c;
		w.matrix.d= w1.matrix.d;
		w.matrix.e= w1.matrix.e;
		w.matrix.f= w1.matrix.f;
		
		planComponents.walls.push(w);
	}
	
	nextWallIndex= plan.nextWallIndex;
	
	
	for (i=0; i<plan.fornitures.length;i++) {
		var f1= plan.fornitures[i];
		
		console.log("New forniture!!");
		
		var f= {
			m: document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix(),
			i: f1.i,
			t: f1.t,
			img: new Image(),
			minSize: f1.minSize,
			currSize: f1.currSize,
			selectedVertex: f1.selectedVertex,
			fDraw: drawForniture,
			hitTest: hitForniture,
			hitHandle: hitFornHandle,
			clone: cloneForn
		}
		
		f.img.src= "./resources/imgs/icons/"+ f.t +".svg";
		f.m.a= f1.m.a;
		f.m.b= f1.m.b;
		f.m.c= f1.m.c;
		f.m.d= f1.m.d;
		f.m.e= f1.m.e;
		f.m.f= f1.m.f;
		
		planComponents.fornitures.push(f);
	}
	
	activeGSB();
	
	console.log("End of loading");
}





/* Callback per il bottone "show-settings"
 */
function onShowSettings() {
	var el= document.getElementById("settings-div");
	el.style.left= ((innerWidth-el.clientWidth)/2).toString() + "px";
	el.style.top= ((innerHeight-el.clientHeight)/2).toString() + "px";

	togglePageDisabler();
}





/* Callback per il bottone che chiude la finestra "settings"
 */
function onHideSettings() {
	var el= document.getElementById("settings-div");
	
	if(document.getElementById("page_disabler").classList.contains("active")) {
		el.style.left= "250%";
		togglePageDisabler();
	}
}





/* Callback per l'onclick bottone "leftSidebarButton"
 */
function onLeftSidebarButtonClick(ev) {
	if (!document.getElementById("hamburger-menu").classList.contains("disabled")) {
		document.getElementById("left_sidebar").classList.toggle("active");
		document.getElementsByClassName("ham-container")[0].classList.toggle("active");
	}
}





/* Callback per abilitare/disabilitare la barra laterale sinistra al passaggio del mouse
 */
function onSidebarEnablerTogglerClick() {
	var e= document.getElementById("sidebar_enabler");
	console.log("--> "+ e.style.display);
	if (e.style.display == "") {
		// Abilito il menu e disabilito la barra
		document.getElementById("hamburger-menu").classList.toggle("disabled");
		e.style.display= "none";
	}
	else {
		// Abilito la barra e disabilto il menu
		e.style.display= "";
		document.getElementById("hamburger-menu").classList.toggle("disabled");
	}
}




/* Callback per il div "sidebar_enabler"
 */
function onSidebarEnablerMouseOver(ev) {
	if (ev.buttons == 0) {
		document.getElementById("left_sidebar").classList.toggle("active");
		document.getElementById("sidebar_enabler").classList.toggle("disabled");
		document.getElementsByClassName("ham-container")[0].classList.toggle("active");
	}
}





/* Callback per quando entro nel canvas
 */
function onMainCanvasMouseOver(ev) {
	//console.log("onMainCanvasMouseOver  -->  call of me!!");
	
	hideSidebar();
}





/* Callback per il bottone "newPlan"
 */
function onCreateNewPlan(w, h) {
	// FIXME!!!
	console.log ("onCreateNewPlan  --> w: "+ w +"\th: "+ h);
	
	if (w<=0 || h<=0 || (w*h)>maxPlanArea) {
		activeBSB();
		return ;
	}
	
	newPlan(w*20, h*20);
	
	activeGSB();
}





/* Callback per il bottone "backNewPlan"
 */
function onBackNewPlan() {
	disableComponentsButton();
	document.getElementById("dropdown-content").classList.toggle("show");
}





/* Funzione per nascondere il "dropdown-content"
 */
function hideDropdown() {
	var dc= document.getElementById("dropdown-content");
	
	if (dc.classList.contains("show")) {
		dc.classList.toggle("show");
	}
}





/* Callback per il requestAnimationFrame()
 */
function onDraw() {
	drawPlan();
	
	window.requestAnimationFrame(onDraw);
}





/* Callback per l'evento "onWheel" per l'input "wallSize"
 */
function onWallSizeMouseWheel(ev) {
	console.log("onWallSizeMouseWheel  -->  call of me!");
	var e= document.getElementById("wallSize");
	var v= Number(e.value);
	
	if (ev.deltaY>0 && v>=0.2) {
		decreaseWallSize();
		v -= 0.1;
	}
	
	else if (ev.deltaY<0 && v <= 1.9) {
		increaseWallSize();
		v += 0.1;
	}
	
	e.value= v.toFixed(1);
	
	try {ev.preventDefault();}
	catch(err) {}
	
	invalidated= true;
}





/* Callback per la pressione del bottone wallSizeDecr
 */
function onWallSizeDecrMouseDown(ev) {
	wallSizeDecrIntervalID= window.setInterval(onWallSizeMouseWheel({deltaY:1}), stdLongIntervalMs);
}





/* Callback per il rilascio del bottone wallSizeDecr
 */
function onWallSizeDecrMouseUp(ev) {
	window.clearInterval(wallSizeDecrIntervalID);
}





/* Callback per la pressione del bottone wallSizeIncr
 */
function onWallSizeIncrMouseDown(ev) {
	wallSizeIncrIntervalID= window.setInterval(onWallSizeMouseWheel({deltaY:-1}), stdLongIntervalMs);

}





/* Callback per il rilascio del bottone wallSizeIncr
 */
function onWallSizeIncrMouseUp(ev) {
	window.clearInterval(wallSizeIncrIntervalID);
}





/* Callback per l'evento "onkeydown"
 */
function onKeyDown(ev) {
	console.log ("onKeyDown  -->  ev.code: "+ ev.code +"\ttypedof ev.code: "+ typeof ev.code);
	c= ev.code;
	
	switch (c) {
		case "Delete" :
			onDelete();
			
			ev.preventDefault();
			break;


		case "Escape" :
			var dc= document.getElementById("dropdown-content");
			hitTest({x:-10, y:-10}, mainMatrix);
			onDrawWallClicked();
			movingPlan= false;
			haveToDrawWall= false;
			document.getElementById("wallImg").src="./resources/imgs/icons/wall_black.svg";
			updatingForn= false;
			updatingWall= false;

			if(dc.classList.contains("show")) {
				dc.classList.toggle("show");
			}

			disableComponentsButton();
			onHideSettings();
			document.getElementById("mainCanvas").style.cursor="auto";
			
			ev.preventDefault();
			break ;


		case "ArrowRight" :
			//console.log("onKeyDown  -->  Hi right!");
			if (fornSelected) {
				updateFornVertex({x:0, y:0}, {x:5, y:0});
			}
			else if (wallSelected) {
				updateWallVertex({x:0, y:0}, {x:cellLen, y:0});
			}
			else {
				translatePlan({dx:5, dy:0});
			}
			
			ev.preventDefault();
			break ;
		
		
		case "ArrowLeft" :
			//console.log("onKeyDown  -->  Hi left!");
			if (fornSelected) {
				updateFornVertex({x:0, y:0}, {x:-5, y:0});
			}
			else if (wallSelected) {
				updateWallVertex({x:0, y:0}, {x:-cellLen, y:0});
			}
			else {
				translatePlan({dx:-5, dy:0});
			}
			
			ev.preventDefault();
			break ;
			
			
		case "ArrowUp" :
			//console.log("onKeyDown  -->  Hi up!");
			if (fornSelected) {
				updateFornVertex({x:0, y:0}, {x:0, y:-5});
			}
			else if (wallSelected) {
				updateWallVertex({x:0, y:0}, {x:0, y:-cellLen});
			}
			else {
				translatePlan({dx:0, dy:-5});
			}
			
			ev.preventDefault();
			break ;
			
			
		case "ArrowDown" :
			//console.log("onKeyDown  -->  Hi down!");
			if (fornSelected) {
				updateFornVertex({x:0, y:0}, {x:0, y:5});
			}
			else if (wallSelected) {
				updateWallVertex({x:0, y:0}, {x:0, y:cellLen});
			}
			else {
				translatePlan({dx:0, dy:5});
			}
			
			ev.preventDefault();
			break ;
			
		
		case "BracketRight" :
			if (ev.ctrlKey) {
				if (wallSelected) {
					
				}
				
				else if(fornSelected) {
					
				}
				
				else {
					var i=0;
					for (i=0; i<25;i++)
						zoomInCenterView();
				}
			}
			
			ev.preventDefault();
			break ;
			
			
		case "Slash" :
			if (ev.ctrlKey) {
				if (wallSelected) {
					
				}
				
				else if(fornSelected) {
					
				}
				
				else {
					var i=0;
					for (i=0;i<25;i++)
						zoomOutCenterView();
				}
			}
			
			ev.preventDefault();
			break ;
			
		
		case "KeyX" :
			if (ev.ctrlKey) {
				onCut();
				ev.preventDefault();
			}
			
			break ;
		
		
		case "KeyC" :
			if (ev.ctrlKey) {
				onCopy();
				ev.preventDefault();
			}
			
			break ;
		
		
		case "KeyV" :
			if (ev.ctrlKey) {
				onPaste();
				ev.preventDefault();
			}
			
			break ;
			
			
		case "KeyN" :
			if (ev.ctrlKey) {
				console.log("Creating new plan");
				ev.preventDefault();
			}
			
			break;
			
		
		case "KeyS" :
			if (ev.ctrlKey) {
				simulingOnClick("savePlan", "click");
				ev.preventDefault();
			}
			
			break;
			
			
		case "KeyO" :
			if (ev.ctrlKey) {
				simulingOnClick("loadPlan", "click");
				ev.preventDefault();
			}
			
			break;
			
			
		case "PageDown" :
			ev.preventDefault();
			
			break ;
			
		
		case "PageUp" :
			ev.preventDefault();
			
			break ;
			
			
		case "Space" :
			ev.preventDefault();
			
			break ;
	}
	
	invalidated= true;
}





/* Funzione per gestire la cancellazione di qualcosa
 */
function onDelete() {
	if (wallSelected) {
		iter= 0;
		disableComponentsButton();
		dc=wallSelected;
		wallInterval= window.setInterval(deletingWall, 10);
	}
	
	else if(fornSelected) {
		iter= 0;
		disableComponentsButton();
		dc= fornSelected;
		fornInterval= window.setInterval(deletingForn, 10);
	}
}





/* Callback per il timer per cancellare un muro
 */
function deletingWall() {
	//console.log("deletingWall  -->  iter: "+ iter);
	if (iter==0 || iter==0.5 || iter==3 || iter==3.5 || iter==4 || iter==4.5 || iter==7 || iter==7.5 || iter==8 || iter==8.5 || iter==11 || iter==11.5) {
		rotateWallAtCenter(dc, -10);
	}
	
	else if (iter==1 || iter==1.5 || iter==2 || iter==2.5 || iter==5 || iter==5.5 || iter==6 || iter==6.5 || iter==9 || iter==9.5 || iter==10 || iter==10.5) {
		rotateWallAtCenter(dc, 10);
	}
	
	else {
		if (dc.matrix.a<0.005) {
			removeWall();
			window.clearInterval(wallInterval);
			dc= null;
		}
		else {
			scaleWallAtCenter(dc, 0.8);
		}
	}
	
	invalidated= true;
	
	iter += 0.5;
}





/* Callback per il timer per cancellare un mobile
 */
function deletingForn() {
	if (iter==0 || iter==0.5 || iter==3 || iter==3.5 || iter==4 || iter==4.5 || iter==7 || iter==7.5 || iter==8 || iter==8.5 || iter==11 || iter==11.5) {
		rotateFornAtCenter(dc, -10);
	}
	
	else if (iter==1 || iter==1.5 || iter==2 || iter==2.5 || iter==5 || iter==5.5 || iter==6 || iter==6.5 || iter==9 || iter==9.5 || iter==10 || iter==10.5) {
		rotateFornAtCenter(dc, 10);
	}
	
	else {
		if (dc.m.a<0.005) {
			removeForn();
			window.clearInterval(fornInterval);
			dc= null;
		}
		else {
			scaleFornAtCenter(dc, 0.8);
		}
	}
	
	invalidated= true;
	iter += 0.5;
}





/* Funzione per gestire il taglio di qualcosa
 */
function onCut() {
	var i=0;
	
	console.log("onCut  -->  call of me!");
	
	if (fornSelected) {
		typeOfPaste= "forn";
		cutOrCopy= fornSelected;
		i= planComponents.fornitures.indexOf(fornSelected);
		planComponents.fornitures.splice(i, 1);
		
		var f= cutOrCopy;
		pasteRotation= getRotation(f.m);
		
		f.m= f.m.translate(f.currSize.width/2, f.currSize.height/2);
		f.m= f.m.rotate(pasteRotation);
		f.m= f.m.translate(-f.currSize.width/2, -f.currSize.height/2);
		
		hitTest({x:-10, y:-10}, mainMatrix);
	}
	
	else if (wallSelected) {
		typeOfPaste="wall";
		cutOrCopy= wallSelected;
		i= planComponents.walls.indexOf(wallSelected);
		planComponents.walls.splice(i,1);
		
		var w= cutOrCopy;
		pasteRotation= getRotation(w.matrix);
		
		w.matrix=w.matrix.translate(w.length/2, w.depth/2);
		w.matrix=w.matrix.rotate(pasteRotation);
		w.matrix=w.matrix.translate(-w.length/2,-w.depth/2);
	}
	
	invalidated= true;
}





/* Funzione per gestire il copiaggio di qualcosa
 */
function onCopy() {
	console.log("onCopy  -->  call of me!");
	var i=0;
	
	if (wallSelected) {
		typeOfPaste="wall";
		wallSelected.clone();
		cutOrCopy= planComponents.walls[planComponents.walls.length-1];
		planComponents.walls.splice(planComponents.walls.length-1, 1);
		
		var w= cutOrCopy;
		pasteRotation= getRotation(w.matrix);
		
		w.matrix=w.matrix.translate(w.length/2, w.depth/2);
		w.matrix=w.matrix.rotate(pasteRotation);
		w.matrix=w.matrix.translate(-w.length/2,-w.depth/2);
		
	}
	
	else if (fornSelected) {
		typeOfPaste="forn";
		fornSelected.clone();
		cutOrCopy=planComponents.fornitures[planComponents.fornitures.length-1];
		planComponents.fornitures.splice(planComponents.fornitures.length-1, 1);
		
		var f= cutOrCopy;
		pasteRotation= getRotation(f.m);
		
		f.m= f.m.translate(f.currSize.width/2, f.currSize.height/2);
		f.m= f.m.rotate(pasteRotation);
		f.m= f.m.translate(-f.currSize.width/2, -f.currSize.height/2);
	}
	
	invalidated= true;
}





/* Funzione per gestire l'incollaggio di qualcosa
 */
function onPaste() {
	var hp= hitPlan(currMousePos);
	var cmp= null;
	//console.log("onPaste  -->  hp: "+ hp +"\ttypOfPaste: "+ typeOfPaste);
	if (hp) {
		cmp= currMousePos;
	}
	else {
		cmp= {x: mainMatrix.e+(planSize.width/2*mainMatrix.a), y: mainMatrix.f+(planSize.height/2*mainMatrix.a)};
	}
	
	
	if ((typeOfPaste == "wall") && (cutOrCopy != null)) {
		wallSelected= cutOrCopy;
		planComponents.walls.push(cutOrCopy);
		var x= Number((v2w(cmp).x - (cutOrCopy.length/2)).toFixed(0));
		var y= Number((v2w(cmp).y).toFixed(0));
		var p= {x:x, y:y};
		p= normalizeHalf (p, cellLen);
		
		cutOrCopy.matrix.e= p.x;
		cutOrCopy.matrix.f= p.y;
		
		var w= wallSelected;
		w.matrix= w.matrix.translate(w.length/2, 0);
		w.matrix= w.matrix.rotate(-pasteRotation);
		w.matrix= w.matrix.translate(-w.length/2, 0);
		
		p= {x: w.matrix.e, y:w.matrix.f};
		p= normalizeHalf (p, cellLen);
		w.matrix.e= p.x;
		w.matrix.f= p.y;
	}
	
	else if ((typeOfPaste == "forn") && (cutOrCopy != null)) {
		fornSelected= cutOrCopy;
		planComponents.fornitures.push(cutOrCopy);
		
		cutOrCopy.m.e= Number((v2w(cmp).x - (cutOrCopy.currSize.width/2)).toFixed(0));
		cutOrCopy.m.f= Number((v2w(cmp).y - (cutOrCopy.currSize.height/2)).toFixed(0));
		
		fornSelected.m= fornSelected.m.translate(fornSelected.currSize.width/2, fornSelected.currSize.height/2);
		fornSelected.m= fornSelected.m.rotate(-pasteRotation);
		fornSelected.m= fornSelected.m.translate(-fornSelected.currSize.width/2, -fornSelected.currSize.height/2);
		
		endUpdatingForn(v2w(cmp));
	}
	
	hitTest(currMousePos, mainMatrix);
	
	cutOrCopy= null;
	pasteRotation= 0;
	
	invalidated= true;
}





/* Callback per gestire la pressione del tasto "zoomincomp"
 */
function onZoomInComponentMouseDown() {
	if (fornSelected) {
		zoomInComponentIntervalID= window.setInterval(increaseFornScale, stdLongIntervalMs);
	}
	
	else if (wallSelected) {
		function f() {onWallSizeMouseWheel({deltaY:-1});}
		f();
		zoomInComponentIntervalID= window.setInterval(f, stdLongIntervalMs*1.5);
	}
	
	invalidated= true;
}





/* Callback per gestire il rilascio del tasto "zoomincomp"
 */
function onZoomInComponentMouseUp() {
	window.clearInterval(zoomInComponentIntervalID);
}





/* Callback per gestire la pressione del tasto "zoomoutcomp"
 */
function onZoomOutComponentMouseDown() {
	if (fornSelected) {
		zoomOutComponentIntervalID= window.setInterval(decreaseFornScale, stdLongIntervalMs);
	}
	
	else if (wallSelected) {
		function f() {onWallSizeMouseWheel({deltaY:1})}
		f();
		zoomOutComponentIntervalID= window.setInterval(f, stdLongIntervalMs*1.5);
	}
	
	invalidated= true;
}





/* Callback per gestire il rilascio del tasto "zoomoutcomp"
 */
function onZoomOutComponentMouseUp() {
	window.clearInterval(zoomOutComponentIntervalID);
}





/* Callback per gestire la pressione del tasto "rotateleftcomp"
 */
function onLeftRotateComponentMouseDown() {
	//console.log ("onLeftRotateComponent  -->  ");
	
	if(fornSelected) {
		leftRotateComponentIntervalID= window.setInterval(fornitureLeftRotate, stdLongIntervalMs);
		
		invalidated= true;
	}
}





/* Callback per gestire il rilascio del tasto "rotateleftcomp"
 */
function onLeftRotateComponentMouseUp() {
	window.clearInterval(leftRotateComponentIntervalID);
}





/* Callback per gestire la pressione del tasto "rotaterightcomp"
 */
function onRightRotateComponentMouseDown() {
	//console.log("onRightRotateComponent  -->  ");
	
	if(fornSelected) {
		rightRotateComponentIntervalID= window.setInterval(fornitureRightRotate, stdLongIntervalMs);
		
		invalidated= true;
	}
}





/* Callback per gestire il rilascio del tasto "rotaterightcomp"
 */
function onRightRotateComponentMouseUp() {
	window.clearInterval(rightRotateComponentIntervalID);
}





/* Callback per gestire la pressione del tasto "rotateleft45comp"
 */
function onLeft45RotateComponentMouseDown() {
	console.log ("onLeft45RotateComponentMouseDown  -->  ");
	
	if(fornSelected) {
		fornitureLeft45Rotate();
		leftRotateComponentIntervalID= window.setInterval(fornitureLeft45Rotate, stdLongIntervalMs*10);
		
		invalidated= true;
	}
}





/* Callback per gestire il rilascio del tasto "rotateleft45comp"
 */
function onLeft45RotateComponentMouseUp() {
	window.clearInterval(leftRotateComponentIntervalID);
}





/* Callback per gestire la pressione del tasto "rotateright45comp"
 */
function onRight45RotateComponentMouseDown() {
	console.log("onRight45RotateComponent  -->  ");
	
	if(fornSelected) {
		fornitureRight45Rotate();
		rightRotateComponentIntervalID= window.setInterval(fornitureRight45Rotate, stdLongIntervalMs*10);
		
		invalidated= true;
	}
}





/* Callback per gestire il rilascio del tasto "rotateright45comp"
 */
function onRight45RotateComponentMouseUp() {
	window.clearInterval(rightRotateComponentIntervalID);
}





//Callback per quando arriva l'evento "onmousemove"
function onMainCanvasMouseMove(ev) {
	//console.log("onMainCanvasMouseMove  -->  ev.which: "+ ev.which +"\tev.buttons: "+ ev.buttons);
	ev.preventDefault();
	saveMousePos({x:ev.clientX, y:ev.clientY});
	var cmp= v2w(currMousePos);
	var pmp= v2w(prevMousePos);
	var d= {dx:(cmp.x - pmp.x), dy:(cmp.y - pmp.y)};
	//console.log("onMainCanvasMouseMove  -->  currMousePos: "+ currMousePos.x +", "+ currMousePos.y);

	if (movingPlan) {
		translatePlan(d);
		
		invalidated= true;
	}
	
	else if (updatingWall) {
		updateWallVertex(pmp, cmp);
		mainCanvas.style.cursor= "move";
		
		invalidated= true;
	}
	
	else if (updatingForn) {
		updateFornVertex(pmp,cmp);
		mainCanvas.style.cursor= "move";
		
		invalidated= true;
	}
	
	else if(haveToDrawWall) {
		mainCanvas.style.cursor= "crosshair";
		
		invalidated= true;
	}
	
	else if(checkHitTest(currMousePos, mainMatrix)) {
		mainCanvas.style.cursor= "pointer";
		
		invalidated= true;
	}
	
	else {
		mainCanvas.style.cursor= "";
	}
}





/* Callback per quando arriva l'evento "onmousedown" sul gridCanvas
 * Controllo se il click è avvenuto sulla griglia. Se si controllo prima se ho beccato qualche componente: se si allora non faccio nulla ( ci pensano le altre funzioni a fare qualcosa),
 * altrimenti controllo se c'è da disegnare un muro e, infine, se c'è da muovere la piantina 
 */
function onMainCanvasMouseDown(ev) {
	ev.preventDefault();
	
	var compHit= 0;
	//console.log ("onMainCanvasMouseDown");
	saveMousePos({x:ev.clientX, y:ev.clientY});
	
	// Controllo che l'onMouseDown sia avvenuto sulla griglia
	if (hitPlan(currMousePos)) {
		//console.log ("Fired!!");
		
		// Se era settata la variabile "haveToDrawWall", devo cominciare a diseganre un muro
		if (haveToDrawWall) {
			hitTest({x:-10, y:-10}, mainMatrix);
			startDrawingWall(currMousePos, Number(document.getElementById("wallSize").value));
			updatingWall= true;
		}
		
		// Se un muro era stato selezionato, controllo se viene premuta una delle sue maniglie per ridimensionarlo
		else if (wallSelected && wallSelected.hitHandle(currMousePos, mainMatrix)) {
			//console.log ("onMainCanvasMouseDown  -->  hit handle!!");
			updatingWall= true;
		}
		
		// Se un mobile era stato selezionato, controllo se viene premuta una delle sue maniglie per ridimensionarlo
		else if (fornSelected && fornSelected.hitHandle(currMousePos, mainMatrix)) {
			updatingForn= true;
		}
		
		// Controllo se sto pigiando qualcosa
		else if (compHit=hitTest(currMousePos, mainMatrix)) {
			//console.log("onMainCanvasMouseDown  -->  Hit!!\twallSelected.i: "+ wallSelected.i);
			if (compHit==1) {
				// Ho selezionato un mobilio..
				updatingForn= true;
			}
			else {
				// Ho selezionato un muro..
				document.getElementById("wallSize").value= (wallSelected.depth/cellLen).toFixed(1);
				updatingWall= true;
			}
		}
		
		// Devo spostare la piantina
		else {
			disableComponentsButton();
			//saveMousePos({x:ev.clientX, y:ev.clientY});
			movingPlan= true;
		}
	}
	
	else {
		// Controllo se sto pigiando qualcosa
		if (compHit=hitTest(currMousePos, mainMatrix)) {
			//console.log("onMainCanvasMouseDown  -->  Hit!!\twallSelected.i: "+ wallSelected.i);
			if (compHit==1) {
				// Ho selezionato un mobilio..
				updatingForn= true;
			}
			else {
				// Ho selezionato un muro..
				document.getElementById("wallSize").value= (wallSelected.depth/cellLen).toFixed(1);
				updatingWall= true;
			}
		}
		
		else {
			onKeyDown({code:"Escape"});
		}
	}
	
	invalidated= true;
}





// Callback per quando arriva l'evento "onmouseup" sul gridCanvas
function onMainCanvasMouseUp(ev) {
	// Se stavo disegnando un muro, termino la procedura
	if (updatingWall) {
		endDrawingWall(currMousePos);
	}
	
	if(updatingForn) {
		endUpdatingForn(currMousePos);
	}
	
	movingPlan= false;
	updatingWall= false;
	updatingForn= false;
	invalidated= true;
}





// Vallback per quando ariva l'evento "onmouseout" sul gridCanvas
function onMainCanvasMouseOut(event) {
	if (updatingWall) {
		endDrawingWall(currMousePos);
	}
	
	if(updatingForn) {
		endUpdatingForn(currMousePos);
	}
		
	movingPlan= false;
	updatingWall= false;
	updatingForn= false;
	invalidated= true;
}





/* Funzione per gestire lo scorrimento della rotellina del mouse all'interno del mainCanvas
 */
function onMainCanvasMouseWheel(ev) {
	var toDraw= false;
	var p= {x: ev.clientX, y: ev.clientY};
	
	if (ev.deltaY>0)
		toDraw= zoomOutHigh(currMousePos);
	else
		toDraw= zoomInHigh(currMousePos);
	
	invalidated= true;
}










/* Callback per la pressione del bottone "zoominplan"
 */
function onZoomInPlanMouseDown() {
	zoomInPlanIntervalID= window.setInterval(zoomInCenterView, stdShortIntervalMs);
}





/* Callback per il rilascio del bottone "zoominplan"
 */
function onZoomInPlanMouseUp() {
	window.clearInterval(zoomInPlanIntervalID);
}





/* Callback per la pressione del bottone "zoominplan"
 */
function onZoomOutPlanMouseDown() {
	zoomOutPlanIntervalID= window.setInterval(zoomOutCenterView, stdShortIntervalMs);
}





/* Callback per il rilascio del bottone "zoomoutplan"
 */
function onZoomOutPlanMouseUp() {
	window.clearInterval(zoomOutPlanIntervalID);
}










/* Callback chiamata quando schiaccio il bottone per disegnare un muro
 */
function onDrawWallClicked() {
	haveToDrawWall= !haveToDrawWall;

	if(haveToDrawWall) {
		document.getElementById("mainCanvas").style.cursor="crosshair";
		document.getElementById("wallImg").src="./resources/imgs/icons/wall_black_selected.svg";
	}
	else {
		document.getElementById("mainCanvas").style.cursor="auto";
		document.getElementById("wallImg").src="./resources/imgs/icons/wall_black.svg";
	}
	
	invalidated= true;
}










/* Callback chiamata quando si comincia a fare il drag&drop
 */
function onDragStart(ev) {
	//console.log ("onDragStart  -->  ev.clientX: "+ ev.clientX +"\tev.clientY: "+ ev.clientY);
	//console.log ("onDragStart  -->  ev.target.boundingClientRect: "+ ev.target.getBoundingClientRect());
	hitTest({x:-10, y:-10}, mainMatrix);
	
	var r= ev.target.getBoundingClientRect();
	r.x= Number(r.x.toFixed(0));
	r.y= Number(r.y.toFixed(0));
	
	ev.dataTransfer.setData("id", ev.target.id);
	ev.dataTransfer.setData("offX", ev.clientX-r.x);
	ev.dataTransfer.setData("offY", ev.clientY-r.y);
	//ev.preventDefault();
	
	invalidated= true;
}





/* Callback chiamata quando si entra in una zona in cui è possibile droppare
 */
function onDragEnter(ev) {
	// Potrebbe partire l'animazione che fa tremare l'immaginina sotto
	//ev.dataTransfer.dropEffect= "copy";
	ev.dataTransfer.dropEffect= "copy";
	ev.dataTransfer.effectAllowed= "copy";
	
	onMainCanvasMouseOver(ev);
	haveToDrawWall= false;
	document.getElementById("wallImg").src="./resources/imgs/icons/wall_black.svg";
	
	
	//console.log ("onDragEnter  -->  ");
	//ev.preventDefault();
	
	invalidated= true;
}





/* Callback chiamata quando il mouse è sopra alla zona di drop
 */
function onDragOver(ev) {
	var nmp= v2w(currMousePos);
	
	// Controllo se il mouse è dentro la piantina o no!
	if (nmp.x<0 || nmp.y<0 || nmp.x>planSize.width || nmp.y>planSize.height) {
		ev.dataTransfer.dropEffect= "none"
	}
	else {
		ev.dataTransfer.dropEffect= "copy";
	}
	
	saveMousePos({x:ev.clientX, y:ev.clientY});
	
	ev.preventDefault();
	
	invalidated= true;
}





/* Callback chiamata quando si esce dalla zona in cui è possibile droppare
 */
function onDragLeave(ev) {
	// Potrei far fermare l'animazione partita prima
	ev.dataTransfer.dropEffect= "none";

	//console.log ("onDragLeave  -->  ");
	ev.preventDefault();
	
	invalidated= true;
}





/* Callback chiamata quando si droppa nella piantina
 */
function onDrop(ev) {
	ev.preventDefault();
    var data = ev.dataTransfer.getData("id");
	var offx= ev.dataTransfer.getData("offX");
	var offy= ev.dataTransfer.getData("offY");
	
	hitTest({x:-10, y:-10}, mainMatrix);
	document.getElementById("mainCanvas").style.cursor="auto";
    //console.log("onDrop  -->  data:"+ data +"\t(dx, dy): ("+ offx +", "+ offy +")");
    //console.log("onDrop  -->  currMousePos: ("+ currMousePos.x +", "+ currMousePos.y +")");
	
	// Carico l'immagine nella griglia
	nmp= v2w(currMousePos);
	if (addForniture(data, {x:nmp.x-offx, y:nmp.y-offy})) {
		console.log("onDrop  -->  è andato tutto bene");
		enableComponentsButton();
	}
	else {
		console.log("onDrop  -->  errore!!!");
	}
	
	invalidated= true;
}










/* Callback per quando bisogna attivare la left_sidebar
 */
function showSidebar() {
	var e= document.getElementById("left_sidebar");
	//console.log("showSidebar  -->  call of me!");
	
	if (!e.classList.contains("active")) {
		e.classList.toggle("active");
		document.getElementsByClassName("ham-container")[0].classList.toggle("active");
		document.getElementById("sidebar_enabler").classList.toggle("disabled");
	}
	
	invalidated= true;
}





/* Funzione per quand obisogna disattivare la left_sidebar
 */
function hideSidebar() {
	var e= document.getElementById("left_sidebar");
	//console.log("showSidebar  -->  call of me!");
	
	if (e.classList.contains("active")) {
		document.getElementsByClassName("ham-container")[0].classList.toggle("active");
		e.classList.toggle("active");
		document.getElementById("sidebar_enabler").classList.toggle("disabled");
	}
	
	invalidated= true;
}





/* Funzione per disabilitare i bottoni che si occupano di gestire i componenti della piantina
 */
function disableComponentsButton() {
	disableElement("delete");
	disableElement("cut");
	disableElement("paste");
	disableElement("copy");
	disableElement("zoomincomp");
	disableElement("zoomoutcomp");
	disableElement("rotateleftcomp");
	disableElement("rotaterightcomp");
	disableElement("rotateright45comp");
	disableElement("rotateleft45comp");
}





/* Funzione per abilitare i bottoni che si occupano di gestire i componenti della piantina
 */
function enableComponentsButton() {
	enableElement("delete");
	enableElement("cut");
	enableElement("paste");
	enableElement("copy");
	enableElement("zoomincomp");
	enableElement("zoomoutcomp");
	enableElement("rotateleftcomp");
	enableElement("rotaterightcomp");
	enableElement("rotateright45comp");
	enableElement("rotateleft45comp");
}




/* Funzione per disabilitare la pagina html.
   Metto in foreground un div grigio con z-index=11
 */
function togglePageDisabler() {
	document.getElementById("page_disabler").classList.toggle("active");
	
	invalidated= true;
}