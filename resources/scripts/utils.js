function matrixToString(m) {
	return "("+m.a+", "+m.b+", "+m.c+", "+m.d+", "+m.e+", "+m.f+")";
}





/* Funzione per ottenere, a partire dal punto "p" passato come argomento (in coordinate relative al canvas), un nuovo punto nel sistema di coordinate definito da m;
 */
function transformPoint (p, m) {
	var p1= {x:0, y:0};
	
	p1.x= (m.a*p.x) + (m.c*p.y) + m.e;
	p1.y= (m.b*p.x) + (m.d*p.y) + m.f;
	
	//console.log("transformPoint  -->  m.a: "+ m.a +"\tm.b: "+ m.b +"\tm.c: "+ m.c +"\tm.d: "+ m.d +"\tm.e: "+ m.e +"\tm.f: "+ m.f);
	
	return p1;
}





/* Funzione per assegnare una matrice di trasformazione m al contesto c
 */
function setTransformMatrix(c, m) {
	c.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
}





/* Funzione per resettare il contenuto di una matrice
 */
function resetMatrix(m) {
	m.a=1;
	m.b=0;
	m.c=0;
	m.d=1;
	m.e=0;
	m.f=0;
}





/* Funzione per ottenere la posizione di un dato elemento a partire dalla matrice di trasformazione
 */
function getLocation(m) {
	return {x:m.e, y:m.f};
}





/* Funzione per ottenere l'angolo di rotazione di un dato elemento a partire dalla matrice di trasformazione
 */
function getRotation(m) {
	var teta= -(Math.atan2(m.b, m.d));
		if (teta < 0) {
			teta= (2*Math.PI) + teta;
		}
	
	return teta*180/Math.PI;
}




/* Funzione per "normalizzare" il punto p rispetto al valore "val"
 */
function normalize(p, val) {
	//console.log ("normalize  -->  val:"+ val +"\tp.x: "+ p.x +"\tp.y: "+ p.y +"\tp.x%val: "+ p.x%val);
	
	p.x= Number(p.x.toFixed(0));
	p.y= Number(p.y.toFixed(0));
	
	while ((p.x%val)>0) {
		p.x--;
	}
	while ((p.y%val)>0) {
		p.y--;
	}
	
	return p;
}





/* Funzione per "normalizzare" il punto p rispetto al valore "val/2"
 */
function normalizeHalf(p, val) {
	normalize(p, val);
	
	p.x += val/2;
	p.y += val/2;
	
	return p;
}






/* Funzione per spostare un oggetto alla fine di un array
 */
function toLastPosition(array, oldIndex) {
	var tmp= null;
	
	while (oldIndex<array.length-1) {
		tmp=array[oldIndex];
		array[oldIndex]=array[oldIndex+1];
		array[oldIndex+1]=tmp;
		
		oldIndex++;
	}
};





/* Funzione per calcolare la distanza di un punto da una retta
 */
function distFromRect (a, b, c, p) {
	return (Math.abs((a*p.x)+(b*p.y)+c))/(Math.sqrt((a*a)+(b*b)));
}





/* Funzione per calcolare l'angolo teta che una retta forma con l'asse delle "x" ([0,360))
 */
function computeTeta(p, q) {
	var coeff= 0;
	var teta= 0;
	//console.log("computeTeta -->  prevTeta: "+ teta +"\tp.x: "+ p.x +"\tq.x: "+ q.x);
	
	if (p.y == q.y) {
		// Retta parallela all'asse delle x --> 0° || 180°
		if (p.x>q.x) {
			teta= 180;
		}
		else {
			teta= 0;
		}
	}

	else if (p.x == q.x) {
		// Retta parallela all'asse delle y --> 90° || 270°
		if (p.y>q.y) {
			teta= 90;
		}
		else {
			teta= 270;
		}
	}
	
	else {
		coeff= (q.y-p.y)/(q.x-p.x);
		teta= Math.abs(Math.atan(coeff)*180/Math.PI);
		
		if (p.x>q.x && p.y>q.y) {
			// Retta nel "quarto quadrante"
			teta= 180-teta;
		}
		else if (p.x>q.x && p.y<q.y) {
			// Retta nel "terzo quadrante"
			teta= 180+teta;
		}
		else if (p.x<q.x && p.y<q.y) {
			// Retta nel "secondo quadrante"
			teta= 360-teta;
		}
	}
	
	console.log("computeTeta  -->  \tteta: "+ teta);
	
	return teta;
}





/* Funzione per calcolare un punto a distanza l con angolo t dal punto v1
 */
function computePoint(v1, l, t) {
	var x= v1.x + (l * Math.cos(t*Math.PI/180));
	var y= v1.y - (l * Math.sin(t*Math.PI/180));
	
	return {x:x, y:y};
}





/* Funzione per calcolare la lunghezza di un segmento dati due punti
 */
function computelength(v1, v2) {
	return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
}





/* Funzione per far ruotare un muro di tot gradi rispetto al suo centro
 */
function rotateWallAtCenter (w, t) {
	w.matrix= ((w.matrix.translate (w.length/2, 0)).rotate(t)).translate(-w.length/2, 0);
}




/* Funzione per far scalare un muro rispetto al suo centro
 */
function scaleWallAtCenter (w, s) {
	w.matrix= ((w.matrix.translate (w.length/2, 0)).scale(s)).translate(-w.length/2, 0);
}





/* Funzione per far ruotare un mobile di tot gradi rispetto al suo centro
 */
function rotateFornAtCenter (f, t) {
	f.m= ((f.m.translate (f.currSize.width/2, f.currSize.height/2)).rotate(t)).translate(-f.currSize.width/2, -f.currSize.height/2);
}




/* Funzione per far scalare un muro rispetto al suo centro
 */
function scaleFornAtCenter (f, s) {
	f.m= ((f.m.translate (f.currSize.width/2, f.currSize.height/2)).scale(s)).translate(-f.currSize.width/2, -f.currSize.height/2);
}





/* Funzione per simulare un event su un elemento id
 */
function simulingOnClick(id, ev) {
	console.log("simulingOnClick  -->  call of me!!\t\tid: "+ id +"\tev: "+ ev);
	var param= {
		view: window,
		bubbles: true,
		cancelable: true,
		clientX: 0.5,
		clientY: 0.5
	}
	var event= new MouseEvent(ev, param);
	document.getElementById(id).dispatchEvent(event);
}





/* Funzione per salvare il canvas su PDF
 */
function saveToPDF() {
  var imgData = mainCanvas.toDataURL("image/jpeg", 1.0);
  var pdf = new jsPDF();
  pdf.addImage(imgData, 'JPEG', 0, 0);
  var download = document.getElementById('download');

  pdf.save("download.pdf");
}





/* Funzione per disegnare il contorno del cerchio per il caricamento con centro c,
 * raggio r, angolo t e lunghezza l e altezza della linea w. Tutto questo nel contesto ctx
 */
function drawLoadingCircle(ctx, c, r, t, l, w) {
	ctx.save();
	
}