/* *****  WALL
 * Un muro è un oggetto composto da:
 * 	- una coppia di punti che sono i suoi vertici
 *  - un indice univoco
 *  - un numero che indica lo spessore del muro
 *  - il vertice (eventualmente) attualmente selezionato
 *  - una variabile che indica la lunghezza del muro, aggiornata ad ogni "updateWallVertex"
 *  - la lungheza del raggio delle maniglie
 *  - una funzione per disegnarlo all'interno di "mainContext" passandogli la matrice di trasformazione di base
 *  - una funzione che, preso un punto, dice se appartiene o meno all'oggetto
 *  - una funzione che, preso un punto, dice se è stata clickata una delle sue "maniglie"

var wall= {
	v1: {x:0, y:0},
	v2: {x:0, y:0},
	i: 0,
	depth: 0,
	length: 0,
	teta: 0,
	rLen: 0,
	selectedVertex: 0,
	fDraw: function(m) {},
	hitTest: function(p) {},
	hitHandle: function(p) {}
}
*/





/* Funzione per disegnare le "maniglie" del muro"
 */
function drawWallHandle(p, ctx, rLen) {
	//console.log("drawWallHandle  -->  p: ("+ p.x +", "+ p.y +")");
	
	ctx.save();
	ctx.beginPath();
	ctx.arc(p.x, p.y, rLen, 0, 2 * Math.PI, false);
	ctx.setLineDash([5,3]);
	ctx.lineWidth = 2;
	ctx.strokeStyle="red";
    ctx.stroke();
	ctx.restore();
}





/* Metodo della classe "Wall" per disegnare il muro
 * Effettuivamente il muro parte dal centro di un quadratino e finisce ne centro di un quadratino  -->  lo disegno shiftato un poco in su!
 */
function drawWall(ctx, m){
	// console.log("drawWall  -->  this.length: "+ this.length);
	var teta= 0;
	var tmpMatrix= null;
	
	ctx.save();
	
	if (drawingNewWall==this) {
		// Disegno una semplice linea di 2 px rossa
		ctx.beginPath();
		ctx.moveTo(newWallV1.x, newWallV1.y);
		ctx.lineTo(newWallV2.x, newWallV2.y);
		ctx.strokeStyle="red";
		ctx.lineWidth=2;
		ctx.stroke();
		
		drawWallHandle(newWallV1, ctx, cellLen/2);
		drawWallHandle(newWallV2, ctx, cellLen/2);
	}
	
	else {
		//console.log("drawWall  -->  call of me");
		
		tmpMatrix= m.multiply(this.matrix);
		setTransformMatrix(ctx, tmpMatrix);
		
		ctx.save();

		ctx.beginPath();
		ctx.strokeStyle= "#000000";
		ctx.fillStyle= "#FFFFFF";
		ctx.lineWidth=2;
		
		ctx.fillRect(-cellLen/2, -this.depth/2, this.length+cellLen, this.depth);
		ctx.rect(-cellLen/2, -this.depth/2, this.length+cellLen, this.depth);
		ctx.stroke();

		ctx.restore();
		
		if (wallSelected == this) {
			ctx.save();
			ctx.beginPath();
			ctx.setLineDash([5,3]);
			ctx.lineWidth= 2;
			ctx.strokeStyle= "red";
			ctx.rect(-cellLen/2, -this.depth/2, this.length+cellLen, this.depth);
			ctx.stroke();
			ctx.restore();
			
			//drawWallHandle({x:0, y:0}, ctx, this.rLen);
			var v2= computePoint(getLocation(this.matrix), this.length, getRotation(this.matrix));
			//console.log ("drawWall  -->  v2" + v2.x +" "+ v2.y);
			
			var out= v2.x<0 || v2.x>planSize.width || v2.y<0 || v2.y>planSize.height;
			if (!out) {
				drawWallHandle({x:this.length, y:0}, ctx, cellLen/2);
			}
		}
	}

	ctx.restore();
}





/* Metodo della classe "Wall" per verificare se sto clicckando sul muro
 * Restituisce false se non è clickato, true se viene clickato "in mezzo" o nelle maniglie
 */
function hitWall(p, m) {
	//console.log("hitWall  -->  p1: ("+ p1.x +", "+ p1.y +")");
	var toRet= false;
	var p1= transformPoint(p, (m.multiply(this.matrix)).inverse());
	
	p1.x += cellLen/2;
	p1.y += this.depth/2;
	
	//console.log("hitWall  -->  p1: ("+ p1.x +", "+ p1.y +")");
	
	toRet= ((p1.x>0) && (p1.x<this.length+cellLen) && (p1.y>0) && (p1.y<this.depth)) || this.hitHandle(p, m);
	this.selectedVertex=0;
	
	return toRet;
}





/* Metodo della classe "Wall" per verificare se sto clickando una delle due maniglie
 * Restituisce 0 se noessuna delle due maniglie è clickata, 1 se clicko sulla maniglia di v1 e 2 se clicko sulla maniglia di v2
 */
function hitWallHandle(p, m) {
	var x1=0, y1=0, x2=0, y2=0;
	var toRet= false;
	p1= transformPoint(p, (m.multiply(this.matrix)).inverse());
	
	x1= p1.x;
	y1= p1.y;
	x2= this.length-p1.x;
	y2= p1.y;
	
	/*if (((x1*x1)+(y1*y1))<(this.rLen*this.rLen)) {
		toRet= true;
		this.selectedVertex=1;
	}
	else*/ if(((x2*x2)+(y2*y2))<(cellLen*cellLen/4)) {
		toRet= true;
		this.selectedVertex= 2;
	}
	else {
		toRet= false;
		this.selectedVertex= 0;
	}

	return toRet;
}





/* Funzione per creare un nuovo oggetto di tipo "wall" a partire da this
 */
function cloneWall() {
	startDrawingWall(currMousePos, 1);
	var w= planComponents.walls[planComponents.walls.length-1];
	endDrawingWall(currMousePos);
	
	w.depth= this.depth;
	w.length= this.length;
	w.matrix.a= this.matrix.a;
	w.matrix.b= this.matrix.b;
	w.matrix.c= this.matrix.c;
	w.matrix.d= this.matrix.d;
	w.matrix.e= this.matrix.e;
	w.matrix.f= this.matrix.f;
	w.rLen= this.rLen;
}