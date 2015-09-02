/*
TETRIS - Inspired by the Brick Game...
Author: Jorge Rubiano.
https://twitter.com/ostjh
*/
//La velocidad que tendrá las figuras al caer...
var FPS = movement.BASE - movement.BASE * ((dataLCD.SPEED - 1) * movement.PERCENTAGE) / 100;
var GAMEOVER = false;
//Direcciones para el giro de las figuras...
var direcciones = ["LEFT", "TOP", "RIGHT", "BOTTOM"];
var collisionMatrix = pantalla.matrixCollision();
var sounds = [
					{
						sonido 	: 	"choque.mp3", 
						label	: 	"haceTetris"
					}, 
					{
						sonido 	: 	"mueve.mp3", 
						label	: 	"girar"
					}, 
					{
						sonido 	: 	"tetris.mp3", 
						label	: 	"tetris"
					}
				];
//Para cargar los audios del juego...
createjs.Sound.on("fileload", this.loadHandler, this);
for(var audio = 0; audio < sounds.length; audio++)
{
	createjs.Sound.registerSound("games/tetris/sounds/" + sounds[audio].sonido, sounds[audio].label);
}

function loadHandler(event)
{
	createjs.Sound.play("tetris");
}
createjs.Sound.play("tetris");

//Muestra la siguiente figura a salir...
var nextFigure = {
					direccion 	: "", 
					type 		: "", 
					numDir 		: 0
				};
//La figura que está actualmente en el escenario...
var currentFigure = {
						x			: 5, 
						y 			: 0, 
						puntos		: [], 
						color		: "black", 
						type 		: "", 
						numDir 		: 0
					};

//Genera figuras aleatorias...
var randomFigure = function()
{
	
	var numfigure = (Math.floor(Math.random() * Object.keys(figures).length) + 1) - 1;
	var numDir = (Math.floor(Math.random() * direcciones.length) + 1) - 1;
	return {
				type : Object.keys(figures)[numfigure], 
				direccion : direcciones[numDir], 
				numDir : numDir
		   };
};

//Para la colisión de la figura...
var collision = function(x, y, puntos)
{
	puntos = puntos || currentFigure.puntos;
	var posFigura = {x : 0, y : currentFigure.y};
	var posColisiona = {x : 0, y : 0};
	var hayColision = false;
	for(var i = 0; i < puntos.length; i++)
	{
		posFigura.x = currentFigure.x;
		for(var c = 0; c < puntos[i].length; c++)
		{
			if(puntos[i][c] === 1)
			{
				try
				{
					posColisiona.x = posFigura.x + x;
					posColisiona.y = posFigura.y + y;
					if((posColisiona.x >= 0 && posColisiona.x < lcdDimensions.ancho) && (posColisiona.y >= 0 && lcdDimensions.alto))
					{
						if(collisionMatrix[posColisiona.x][posColisiona.y] === 1)
						{
							hayColision = true;
							break;
						}
					}
				}
				catch(e)
				{
					console.log(e);
					debugger;
				}
			}
			posFigura.x++;
		}
		if(hayColision)
		{
			break;
		}
		posFigura.y++;
	}
	return hayColision;
};

//Para la figura que estará en el escenario...
var figureStage = (function figureStage()
{
	//Para validar si se ha terminado el juego...
	var newFigure = nextFigure.type !== "" ? nextFigure : randomFigure();
	currentFigure.puntos = pantalla.girarElemento(newFigure.direccion, newFigure.type);
	currentFigure.type = newFigure.type;
	currentFigure.numDir = newFigure.numDir;
	currentFigure.x = 4;
	currentFigure.y = currentFigure.puntos[0].length * -1;
	//Saber si hay colisión hacia abajo, por que ha terminado...
	if(collision(0, 1))
	{
		GAMEOVER = true;
		gameEnds();
		navigator.vibrate(200);
	}
	//Para la siguiente figura...
	nextFigure = randomFigure();
	return figureStage;
})();

//Para actualizar la matriz de colisión de los elementos...
var updateMatrixCollision = function()
{
	var puntos = currentFigure.puntos;
	var yPone = currentFigure.y;
	for(var i = 0; i < puntos.length; i++)
	{
		var xPone = currentFigure.x;
		for(var c = 0; c < puntos[i].length; c++)
		{
			if(puntos[i][c] === 1)
			{
				collisionMatrix[xPone][yPone] = 1;
			}
			xPone++;
		}
		yPone++;
	}
};

//Para mover/girar los elementos...
var accionFigure = function(type, dir)
{
	if(!GAMEOVER && !PAUSEGAME)
	{
		//Para mover la figura...
		if(type === "MOVE")
		{
			//Primero saber que no se salga dle rango definido del escenario...
			switch(dir)
			{
				case "LEFT": //Mover a la izquierda...
							 if(currentFigure.x - 1 >= 0 && !collision(-1, 0))
							 {
							 	currentFigure.x--;
							 }
							 break;
				case "RIGHT": //Para mover hacia la derecha...
							 if(((currentFigure.x + currentFigure.puntos[0].length - 1) + 1 < lcdDimensions.ancho) && !collision(1, 0))
							 {
							 	currentFigure.x++;
							 }
							 break;
				case "BOTTOM": //Para mover hacia abajo...
							 if(((currentFigure.y + currentFigure.puntos.length - 1) + 1 < lcdDimensions.alto) && !collision(0, 1))
							 {
							 	currentFigure.y++;
							 }
							 else
							 {						 	
						 		input.BOTTOM.sustained = false; //Para que el sotsenido hacia bajo se deshabilite...
						 		//console.log("Abajo");
						 		updateMatrixCollision();
						 		haceTetris();
						 		figureStage();
							 }
							 break;
			}
		}
		else
		{
			createjs.Sound.play("girar");
			//Para girar la figura...
			var numDir = currentFigure.numDir >= 3 ? 0 : currentFigure.numDir + 1;
			var puntosGiro = pantalla.girarElemento(direcciones[numDir], currentFigure.type);
			//Primero validar en X, luego será en Y...
			if((currentFigure.x + (puntosGiro[0].length - 1) < lcdDimensions.ancho) && ((currentFigure.y + puntosGiro.length - 1) + 1 < lcdDimensions.alto))
			{
				currentFigure.numDir = numDir;
				currentFigure.puntos = puntosGiro;
			}
		}
	}
}

//Para comprobrar la existencia de Tetris...
var haceTetris = function()
{
	var tmpTXT = "";
	var numCeldas = 0;
	for(var c = lcdDimensions.alto - 1; c >= 0; c--)
	{
		tmpTXT = "";
		numCeldas = 0;
		for(var i = 0; i < lcdDimensions.ancho; i++)
		{
			if(tmpTXT != "")
			{
				tmpTXT += ",";
			}
			tmpTXT += collisionMatrix[i][c];
			if(collisionMatrix[i][c] === 1)
			{
				numCeldas++;
			}
		}
		if(numCeldas === lcdDimensions.ancho)
		{
			lineaTetris(c);
			break;
		}
	}
}

//Función que elimina la línea cuando se hace Tetris y baja las demás...
var lineaTetris = function(line)
{
	createjs.Sound.play("haceTetris");
	dataLCD.SCORE += 50;
	//Guardar la máxima puntuación que se tiene...
	if(dataLCD.SCORE >= dataLCD.HISCORE)
	{
		dataLCD.HISCORE = dataLCD.SCORE;
		localStorage.setItem("tetris", dataLCD.SCORE);
	}
	movement.CONT++;
	if(movement.CONT >= movement.MAX)
	{
		dataLCD.LEVEL++;
		dataLCD.SPEED++;
		movement.CONT = 0;
		FPS = movement.BASE - (movement.BASE * (((dataLCD.SPEED - 1) * movement.PERCENTAGE) / 100));
		if(FPS <= 0)
		{
			FPS = 1;
		}
	}
	for(var c = line - 1; c >= 0; c --)
	{
		for(var i = 0; i < lcdDimensions.ancho; i++)
		{
			collisionMatrix[i][c + 1] = collisionMatrix[i][c];
		}
	}
	haceTetris();
};

input.ENTER.press = function(event)
{
	accionFigure("TURN", "");
};

input.LEFT.press = function(event)
{
	this.timePress = 0.5;
	accionFigure("MOVE", "LEFT");
};

input.RIGHT.press = function(event)
{
	this.timePress = 0.5;
	accionFigure("MOVE", "RIGHT");
};

input.BOTTOM.press = function(event)
{
	this.timePress = 0.5;
	accionFigure("MOVE", "BOTTOM");
};

input.TOP.press = function(event)
{
	accionFigure("TURN", "");
};

//Para renderizar la animación de movement de los elementos...
var render = function(dt)
{
	if(input.RIGHT.sustained && !GAMEOVER)
	{
		accionFigure("MOVE", "RIGHT");
	}
	if(input.LEFT.sustained && !GAMEOVER)
	{
		accionFigure("MOVE", "LEFT");
	}
	if((movement.CUENTA >= (input.BOTTOM.sustained ? 1 : FPS)) && !GAMEOVER)
	{
		accionFigure("MOVE", "BOTTOM");
		movement.CUENTA = 0;
	}
	pantalla.imprimeFigura(currentFigure);
	//Mostrar los que están en uso en la matríz de colisión...
	for(var i = 0; i < collisionMatrix.length; i++)
	{
		for(var c = 0; c < collisionMatrix[i].length; c++)
		{
			if(collisionMatrix[i][c] === 1)
			{
				pantalla.dibujarCelda({
								x : i, 
								y : c, 
								activado : true, 
								color : "black"
							});
			}
		}
	}
	pantalla.miniLCD(nextFigure.direccion, nextFigure.type);
    movement.CUENTA++;
}