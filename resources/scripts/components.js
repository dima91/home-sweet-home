// Oggetto contenente tutti i componenti della piantina
var planComponents= {};

// Indice del prossimo muro aggiunto
var nextWallIndex=1;
// Variabile per memorizzare il muro selezionato
var wallSelected= null;
// Variabile per memorizzare il fatto che si sta creando un nuovo muro. È un puntatore al muro da disegnare
var drawingNewWall= null;
// Vertici per disegnare il muro quando si crea
var newWallV1= {x:0, y:0};
var newWallV2= {x:0, y:0};

// Indice del prossimo mobilio aggiunto
var nextFornIndex= 0;
// Variabile per memorizzare il mobilio correntemente selezionato
var fornSelected= null;

// Buffer per memorizzare le cose selezionate
var selectedComponentsBuffer= null;





/* Funzione per eseguire il setup dei componenti
 */
function setupComponents() {
	planComponents= {
			walls: [],
			fornitures: []
	}
}





/* Funzione per controllare se sto sopra qualcosa di clickabile
 */
function checkHitTest(p, m) {
	var i=0, wlen= planComponents.walls.length, flen= planComponents.fornitures.length, toRet=0;
	
	for (i=flen-1;i>=0;i--) {
		if (planComponents.fornitures[i].hitTest(p, m)) {
			toRet=1;
			break;
		}
	}
	
	if (toRet) {
		return 1;
	}
	
	for (i=wlen-1;i>=0;i--) {
		if (planComponents.walls[i].hitTest(p, m)) {
			toRet= 1;
			break ;
		}
	}
	
	return toRet;
}





/* Funzione che, a partire dal punto p (in coordinate vista), cerca il componente che eventualmente è stato clickato e setta la variabile "selected" che contiene l'indice del componente clickato.
 * Scorro l'array dalla fine all'inizio per lo z-index!!! --> appena trovo un componente che è stato clickato, lo sposto in fondo per rispettare sempre lo z-index!!
 */
function hitTest(p, m) {
	//console.log("hitTest  -->  call of me!!!");
	wallSelected= null;
	fornSelected= null;
	var toRet= 0;
	var i=0, wlen= planComponents.walls.length, flen= planComponents.fornitures.length;
	
	for (i=flen-1;i>=0;i--) {
		if (planComponents.fornitures[i].hitTest(p, m)) {
			//console.log("hitTest  -->  hit forniture!!");
			fornSelected= planComponents.fornitures[i];
			toLastPosition(planComponents.fornitures, i);
			toRet=1;
			break;
		}
	}
	
	if (toRet) {
		enableComponentsButton();
		console.log("hitTest  -->  toRet: "+ toRet);
		return toRet;
	}

	for (i=wlen-1;i>=0;i--) {
		if (planComponents.walls[i].hitTest(p, m)) {
			//console.log("hitTest  -->  Hit wall!!");
			wallSelected= planComponents.walls[i];
			toLastPosition(planComponents.walls, i);
			toRet=2;
			break ;
		}
	}
	
	if (toRet) {
		enableElement("delete");
		enableElement("cut");
		enableElement("copy");
		enableElement("paste");
		enableElement("zoomincomp");
		enableElement("zoomoutcomp");
	}
	else {
		disableComponentsButton();
	}
	
	return toRet;
}

























/* Funzione per cominciare a disegnare un nuovo muro a partire dalla posizione (in coordinate vista) (p.x, p.y)
 * Aggiungo un nuovo muro con i vertici coincidenti nel punto p.
 */
function startDrawingWall(p, d) {
	pw= v2w(p);

	var w= {
			// Profondità (spessore) del muro in pixel
			depth: d*cellLen,
			// Lunghezza del muro
			length: 0,
			// Matrice di trasformazione associata al muro (necessaria per la rotazione)
			matrix: document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix(),
			// Indice del muro all'interno dell'array "walls"
			i: nextWallIndex,
			// Lunghezza del raggio delle maniglie
			rLen: 3/4*d*cellLen,
			// Vertice correntemente selezionato
			selectedVertex: 2,
			// Funzione per disegnare ll muro
			fDraw: drawWall,
			// Funzione per vedere se clicko il muro
			hitTest: hitWall,
			// Funzione per vedere se clicko una delle due maniglie
			hitHandle: hitWallHandle,
			// Funzione per clonare il muro
			clone: cloneWall
	}
	
	newWallV1.x= pw.x;
	newWallV1.y= pw.y;
	newWallV2.x= pw.x;
	newWallV2.y= pw.y;

	planComponents.walls.push(w);
	wallSelected= w;
	drawingNewWall= w;
	nextWallIndex++;

	enableElement("delete");
	enableElement("cut");
	enableElement("paste");
	enableElement("copy");
	enableElement("zoomincomp");
	enableElement("zoomoutcomp");
}





/* Funzione per terminare il disegno del muro (chiamata sia quando disegno per la prima volta il muro, che quando aggiorno il muro
 */
function endDrawingWall(p) {
	console.log("endDrawingWall  -->  newWall");
	
	var w=wallSelected;
	var teta= 0;
	var v1, v2;
	
	// Trasformo il punto in coordinate mondo
	var p1= v2w(p);
	// Trasformo il punto in coordinate "muro"
	var p2= transformPoint(p1, w.matrix);
	
	
	// TODO Fai partire l'animazione!!!!!!
	if (drawingNewWall) {
		v1= newWallV1;
		v2= newWallV2;
		
		normalizeHalf(v1, cellLen);
		normalizeHalf(v2, cellLen);
		
		w.length= Math.sqrt((Math.pow(v2.x-v1.x, 2))+(Math.pow(v2.y-v1.y, 2)));
		w.matrix= w.matrix.translate(v1.x, v1.y);
		teta= computeTeta(v1, v2);
		
		w.matrix= w.matrix.rotate(-teta);
		
		drawingNewWall=null;
		newWallV1= {x:0, y:0};
		newWallV2= {x:0, y:0};
	}
	
	else {
		//console.log("endDrawingWall  -->  w.length: "+ w.length);
		
		if (w.selectedVertex == 0) {
			var ln= getLocation(w.matrix);
			normalize(ln, cellLen);
			ln.x+=cellLen/2;
			ln.y+=cellLen/2;
			w.matrix.e= ln.x;
			w.matrix.f= ln.y;
		}
		
		else if (w.selectedVertex == 1) {
			// CAZZO!!!
		}
		
		if (w.selectedVertex==2) {
			var oldTeta= getRotation(w.matrix);
			var newTeta= 0;
			
			// FIXME NON FUNZIONA!!!!!
			// teta -> l -> v2 -> v2' -> l' -> teta'
			v1= getLocation(w.matrix);
			v2= computePoint(v1, w.length, oldTeta);
			normalize(v2, cellLen);
			v2.x += cellLen/2;
			v2.y += cellLen/2;
			w.length= computelength(v1, v2);
			//console.log("endDrawingWall  -->  v2: ("+ v2.x +", "+ v2.y +")\toldTeta "+ oldTeta +"\tlength: "+ w.length);
			
			newTeta= computeTeta(v1, v2);
			//console.log("endDrawingWall  --> newTeta: "+ newTeta +"\toldTeta: "+ oldTeta);
			newTeta -= oldTeta;
			//console.log("endDrawingWall  --> offset: "+ newTeta);
			
			w.matrix= w.matrix.rotate (-newTeta);
			
			/*w.matrix.a= Math.cos(newTeta);
			w.matrix.b= Math.sin(newTeta);
			w.matrix.c= -Math.sin(newTeta);
			w.matrix.d= Math.cos(newTeta);*/
			
			// console.log("endDrawingWall  -->  w.length: "+ w.length +"\tw.teta: "+ w.teta + "\tv2: ("+ v2.x +", "+ v2.y +")");
		}
	}
	
	/*v1= getLocation(w.matrix);
	v2= computePoint(v1, w.length, );
	console.log("endDrawingWall  -->  w.length: "+ w.length +"\tw.teta: "+ w.teta + "\tv1: ("+ v1.x +", "+ v1.y +")\tv2: ("+ v2.x +", "+ v2.y +")");*/
	
	w.selectedVertex= 0;
}





/* Funzione per aggiornare uno dei due vertici del muro selezionato di un offset "o"
 * Ritorna 1 se ha spostato correttamente i vertici, 0 altrimenti
 */
function updateWallVertex(p, c) {
	//console.log("updateWallVertex  -->  call of me");
	var w= wallSelected;
	var toRet= 0;
	var p1= transformPoint(p, w.matrix.inverse());
	var c1= transformPoint(c, w.matrix.inverse());
	var o= {dx:c1.x-p1.x, dy:c1.y-p1.y};
	//console.log("updateWallVertex -->  o1: {"+ o.dx +", "+ o.dy +"}");
	
	
	if (drawingNewWall) {
		newWallV2.x += o.dx;
		newWallV2.y += o.dy;
		
		toRet=1;
	}
	
	else {
		if (w.selectedVertex == 0) {
			// Traslo il muro e basta
			w.matrix= w.matrix.translate(o.dx, o.dy);
			
			toRet= 1;
		}
		
		else if (w.selectedVertex == 1) {
			// ?!
		}
		
		else if (w.selectedVertex == 2) {
			// FIXME!!!!
			var pt= computeTeta({x:0, y:0}, p1);
			var ct= computeTeta({x:0, y:0}, c1);
			var ot= ct - pt;
			w.matrix= w.matrix.rotate(-ot);
			
			var pl= Math.sqrt((Math.pow(p1.x, 2))+(Math.pow(p1.y, 2)));
			var cl= Math.sqrt((Math.pow(c1.x, 2))+(Math.pow(c1.y, 2)));
			var ol= cl - pl;
			w.length += ol;
			
			toRet=1;
		}
		
		else {
			console.error("updateWallVertex --> error!");
		}
	}

	return toRet;
}





/* Funzione per eliminare il muro correntemente selezionato
 */
function removeWall() {
	var i= planComponents.walls.indexOf(wallSelected);
	
	if (i!=-1)
		planComponents.walls.splice(i,1);
	
	return 1;
}

























/* Funzione per aggiungere una nuova fornitura di tipo "t" nel punto "p" (in coordinate vista)
 * Restituisce 1 se è andato tutto bene (e tiene selezionata la figura), 0 altrimenti (l'immagine non sta pienamente nella piantina tipo)
 */
function addForniture (t, p) {
	//console.log("addForniture  -->  call of me!!");
	
	if ((t == null) || (t == "") || (t == undefined)) {
		console.log("addForniture  -->  errore!!!");
		return ;
	}
	
	// FIXME Potrei controllare che due oggetti non vadano sopra
	var img= new Image();
	console.log("addForniture  -->  t: "+ t +"\timg: "+ img);
	img.src= "./resources/imgs/icons/"+ t +".svg";
	nextFornIndex++;

	var f= {
			m: document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix(),
			i: nextFornIndex,
			t: t,
			img: img,
			minSize: {width:img.width/2, height:img.height/2},
			currSize: {width:img.width, height:img.height},
			selectedVertex: 0,
			fDraw: drawForniture,
			hitTest: hitForniture,
			hitHandle: hitFornHandle,
			clone: cloneForn
	}
	f.m= f.m.translate(p.x, p.y);
	planComponents.fornitures.push(f);
	fornSelected= f;
	
	//console.log("addForniture  -->  img.w: "+ f.img.width +"\timg.h: "+ img.height);
	console.log ("addForniture  -->  f.m: "+ matrixToString(f.m));

	return 1;
}





/* Funzione chiamata quando si finisce di aggiornare un mobile
 */
function endUpdatingForn(p) {
	fornSelected.selectedVertex= 0;
	
	invalidated= true;
	
	// Controllo che i vertici siano dentro alla piantina!!
}





/* Funzione per eliminare un mobilio dall'array "fornitures" */
function removeForn() {
	var i= planComponents.fornitures.indexOf(fornSelected);
	
	if (i!=-1)
		planComponents.fornitures.splice(i,1);
	
	return 1;
}





/* Funzione per muovere di un offset o il mobile selezionato
 */
function updateFornVertex(p, c) {
	var f= fornSelected;
	var toRet= 0;
	var o;
	
	/* L'offset che mi passano è in coordinate mondo --> lo porto in coordinate del "fornSelected" considerando
	 * di avere i punti p (0,0) e q(o.dx, o.dy)
	 */
	p1= transformPoint(p, f.m.inverse());
	c1= transformPoint(c, f.m.inverse());
	o= {dx:c1.x-p1.x, dy:c1.y-p1.y};
	console.log("updateFornVertex  -->  o1: {"+ o.dx +", "+ o.dy +"}");
	
	
	if (f.selectedVertex == 1) {
		f.currSize.width -= o.dx;
		f.currSize.height -= o.dy;
		
		if ((f.currSize.width >= f.minSize.width) && (f.currSize.height >= f.minSize.height)) {
			fornSelected.m= fornSelected.m.translate(o.dx, o.dy);
		}
		else {
			f.currSize.width += o.dx;
			f.currSize.height += o.dy;
		}
	}
	
	else if (f.selectedVertex == 2) {
		f.currSize.width += o.dx;
		f.currSize.height -= o.dy;
		
		if ((f.currSize.width >= f.minSize.width) && (f.currSize.height >= f.minSize.height)) {
			fornSelected.m= fornSelected.m.translate(0, o.dy);
		}
		else {
			f.currSize.width -= o.dx;
			f.currSize.height += o.dy;
		}
	}
	
	else if (f.selectedVertex == 3) {
		f.currSize.width += o.dx;
		f.currSize.height += o.dy;
		
		if ((f.currSize.width >= f.minSize.width) && (f.currSize.height >= f.minSize.height)) {
		}
		else {
			f.currSize.width -= o.dx;
			f.currSize.height -= o.dy;
		}
	}
	
	else if (f.selectedVertex == 4) {
		f.currSize.width -= o.dx;
		f.currSize.height += o.dy;
		
		if ((f.currSize.width >= f.minSize.width) && (f.currSize.height >= f.minSize.height)) {
			fornSelected.m= fornSelected.m.translate(o.dx, 0);
		}
		else {
			f.currSize.width += o.dx;
			f.currSize.height -= o.dy;
		}
	}
	
	else {
		fornSelected.m= fornSelected.m.translate(o.dx, o.dy);
	}
	
	invalidated= true;
	
	return 1;
}



/* Funzione per aumentare l'angolo di rotazione del mobilio correntemente selezionato
 */
function fornitureLeftRotate() {
	if (fornSelected == null)
		return ;
	
	fornSelected.m= fornSelected.m.translate(fornSelected.currSize.width/2, fornSelected.currSize.height/2);
	fornSelected.m= fornSelected.m.rotate(-3);
	fornSelected.m= fornSelected.m.translate(-fornSelected.currSize.width/2, -fornSelected.currSize.height/2);
	
	invalidated= true;
	
	return 1;
}





/* Funzione per diminuire l'angolo di rotazione del mobilio correntemente selezionato
 */
function fornitureRightRotate() {
	if (fornSelected == null)
		return 0;
	
	fornSelected.m= fornSelected.m.translate(fornSelected.currSize.width/2, fornSelected.currSize.height/2);
	fornSelected.m= fornSelected.m.rotate(3);
	fornSelected.m= fornSelected.m.translate(-fornSelected.currSize.width/2, -fornSelected.currSize.height/2);
	
	invalidated= true;
	
	return 1;
}





/* Funzione per aumentare di 45 gradi l'angolo di rotazione del mobilio correntemente selezionato
 */
function fornitureLeft45Rotate() {
	if (fornSelected == null)
		return ;
	
	fornSelected.m= fornSelected.m.translate(fornSelected.currSize.width/2, fornSelected.currSize.height/2);
	fornSelected.m= fornSelected.m.rotate(-45);
	fornSelected.m= fornSelected.m.translate(-fornSelected.currSize.width/2, -fornSelected.currSize.height/2);
	
	invalidated= true;
	
	return 1;
}





/* Funzione per diminuire di 45 gradi l'angolo di rotazione del mobilio correntemente selezionato
 */
function fornitureRight45Rotate() {
	if (fornSelected == null)
		return 0;
	
	fornSelected.m= fornSelected.m.translate(fornSelected.currSize.width/2, fornSelected.currSize.height/2);
	fornSelected.m= fornSelected.m.rotate(45);
	fornSelected.m= fornSelected.m.translate(-fornSelected.currSize.width/2, -fornSelected.currSize.height/2);
	
	invalidated= true;
	
	return 1;
}





/* Funzione per aumentare la scalatura del muro correntemente selezionato
 */
function increaseWallSize() {
	if (wallSelected==null) {
		return 0;
	}
	
	else if (wallSelected.depth < (2*cellLen)) {
		wallSelected.depth += (0.1 * cellLen);
		wallSelected.rLen= 3/4*wallSelected.depth;
		return 1;
	}
	
	else {
		return 0;
	}
	
	invalidated= true;
}





/* Funzione per diminuire la scalatura del muro correntemente selezionato
 */
function decreaseWallSize() {
	if (wallSelected==null) {
		return 0;
	}
	
	else if (wallSelected.depth > (0.1*cellLen)) {
		wallSelected.depth -= (0.1*cellLen);
		wallSelected.rLen= 3/4*wallSelected.depth;
		return 1;
	}
	
	else {
		return 0;
	}
	
	invalidated= true;
}





/* Funzione per aumentare la scalatura del mobile selezionata
 * Aggiorno la dimensione corrente di 10 e sposto di 5 la figura
 */
function increaseFornScale() {
	var f= fornSelected;
	
	if (f==null)
		return 0;
	
	var scale= f.currSize.width/f.currSize.height;
	
	f.currSize.width += (2*scale);
	f.currSize.height += 2;
	
	if ((f.currSize.width >= f.minSize.width) && (f.currSize.height >= f.minSize.height)) {
		fornSelected.m= fornSelected.m.translate((-1*scale),-1);
	}
	else {
		f.currSize.width -= (2*scale);
		f.currSize.height -= 2;
	}
	
	invalidated= true;
}





/* Funzione per diminuire la scalatura del mobile selezionata
 */
function decreaseFornScale() {
	var f= fornSelected;
	
	if (f==null)
		return 0;
	
	var scale= f.currSize.width/f.currSize.height;
	
	f.currSize.width -= (2*scale);
	f.currSize.height -= 2;
	
	if ((f.currSize.width >= f.minSize.width) && (f.currSize.height >= f.minSize.height)) {
		fornSelected.m= fornSelected.m.translate((1*scale),1);
	}
	else {
		f.currSize.width += (2*scale);
		f.currSize.height += 2;
	}
	
	invalidated= true;
}