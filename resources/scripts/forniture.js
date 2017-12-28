/* *****  FORNITURE
 * Un mobilio è un oggetto composto da:
 *  - una matrice di trasformazione che rappresenta la sua posizione nello spazio
 *  - un indicie univoco
 *  - una stringa che identifica l'immagine
 *  - una variabile che punta all'immagine
 *  - le dimensioni minime dell'immagine
 *  - le dimensioni correnti dell'immagine
 *  - una funzione per disegnarlo all'interno di "mainContext" passandogli la matrice di trasformazione di base
 *  - una funzione che, preso un punto, dice se appartiene o meno all'oggetto
 *  - ..

var forniture= {
	m: document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix(),
	i: 0,
	selectedVertex: 0,
	t: "",
	img: null
	minSize: {width, height},
	currSize: {width, height},
	fDraw: function(c, m) {},
	hitTest: function(p, m) {},
	hitHandle: function(p, m) {}
}

VERTICI: 
1---2
|   |
4 --3
 */





/* Funzione per disegnare i bordi del mobilio e le maniglie
 */
function drawBorders (cs, ctx) {
	ctx.save();
	ctx.beginPath();
	ctx.setLineDash([4,2]);
	ctx.strokeStyle= "black";
	ctx.lineWidth= 1;
	ctx.rect(0, 0, cs.width, cs.height);
	ctx.stroke();
	ctx.strokeStyle="red";
	ctx.moveTo(0,0);
	ctx.arc(0, 0, (cellLen/3), 0, 2 * Math.PI);
	ctx.moveTo(0,cs.height);
	ctx.arc(0, cs.height, (cellLen/3), 0, 2 * Math.PI);
	ctx.moveTo(cs.width,0);
	ctx.arc(cs.width, 0, (cellLen/3), 0, 2 * Math.PI);
	ctx.moveTo(cs.width,cs.height);
	ctx.arc(cs.width, cs.height, (cellLen/3), 0, 2 * Math.PI);
	ctx.stroke();
	ctx.restore();
}





/* Metodo della classe "Forniture" per stampare il mobilio
 */
function drawForniture(ctx, m) {
	var m1= m.multiply(this.m);
	ctx.save();
	setTransformMatrix(ctx, m1);
	
	ctx.drawImage(this.img, 0, 0, this.currSize.width, this.currSize.height);
	
	if (fornSelected==this && updatingForn==false) {
		drawBorders(this.currSize, ctx);
	}
	
	//console.log("drawForniture  -->  m: "+ matrixToString(this.m));
	
	
	ctx.restore();
}





/* Metodo della classe "Forniture" per controllare se è stata clickata
 */
function hitForniture(p, m) {
	var m1= m.multiply(this.m);
	p1= transformPoint(p, m1.inverse());
	
	if (p1.x<0 || p1.y<0 || p1.x>this.currSize.width || p1.y>this.currSize.height) {
		return false;
	}
	else {
		return true;
	}
}





/* Metodo della classe "Forniture" per controllare se è stata clickata una sua maniglia
 */
function hitFornHandle(p, m) {
	//console.log ("hitFornHandle  -->  ");
	var x1=0, y1=0, x2=0, y2=0, x3=0, y3=0, x4=0, y4=0;
	var toRet= false;
	var m1= m.multiply(this.m);
	p1= transformPoint(p, m1.inverse());
	
	x1=0-p1.x; y1= 0-p1.y;
	x2=this.currSize.width-p1.x; y2= 0-p1.y;
	x3=this.currSize.width-p1.x; y3=this.currSize.height-p1.y;
	x4=0-p1.x; y4=this.currSize.height-p1.y;
	
	if (((x1*x1)+(y1*y1))<(cellLen*cellLen/4)) {
		toRet= true;
		this.selectedVertex=1;
	}
	else if(((x2*x2)+(y2*y2))<(cellLen*cellLen/4)) {
		toRet= true;
		this.selectedVertex= 2;
	}
	else if (((x3*x3)+(y3*y3))<(cellLen*cellLen/4)) {
		toRet= true;
		this.selectedVertex=3;
	}
	else if (((x4*x4)+(y4*y4))<(cellLen*cellLen/4)) {
		toRet= true;
		this.selectedVertex=4;
	}
	else {
		toRet= false;
		this.selectedVertex= 0;
	}
	
	console.log("hitFornHandle  -->  toRet "+ toRet);
	
	return toRet;
}





/* Funzione per clonare il mobile this
 */
function cloneForn() {
	addForniture(this.t, currMousePos);
	
	var f=planComponents.fornitures[planComponents.fornitures.length-1];
	
	f.m.a= this.m.a;
	f.m.b= this.m.b;
	f.m.c= this.m.c;
	f.m.d= this.m.d;
	f.m.e= this.m.e;
	f.m.f= this.m.f;
	
	f.currSize.height= this.currSize.height;
	f.currSize.width= this.currSize.width;
}