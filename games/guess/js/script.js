/*
THE GUESS GAME - Inspired by the Brick Game...
Author: Jorge Rubiano.
https://twitter.com/ostjh
*/
var FPS = movement.BASE - movement.BASE * ((dataLCD.SPEED - 1) * movement.PERCENTAGE) / 100;
//Para el huevo de pascua (6 veces hacia abajo)...
var keyCode = {active : false, cont : 0};
//Para mostrar en el miniLCD la vida...
var vidaJuego = ["LINEFOUR", "LINETHREE", "LINETWO", "POINT"];
var vida = 0;
//La base de las figuras que se deben adivinar...
var baseFigure = [
					{
						puntos : figures["POINT"].TOP, 
						color  : "#3D6437"
					},
					{
						puntos : figures["LINETWO"].TOP, 
						color  : "#CC0C3C"
					},
					{
						puntos : figures["LSHORT"].TOP, 
						color  : "#553C2E"
					},
					{
						puntos : figures["O"].TOP, 
						color  : "#16386C"
					}
				];
var bottomFigure = []; //Las figuras que estarán en la base...
var guessFigure = []; //Las figuras que se deberán adivinar...
//Para hacer figuras aletoarias...
var randomFigureGuess = function()
{
	var basePosition = {x : 0, y : 0};
	var dataFigure = {};
	var numFigure = 0;
	for(var veces = 1; veces <= 2; veces++)
	{
		basePosition.x = 1;
		basePosition.y = veces === 1 ? 18 : 0;
		for(var i = 0; i < 3; i++)
		{
			//Para las figuras base...
			numFigure = Math.floor(Math.random() * 4);
			dataFigure = {
							x : basePosition.x, 
							y : basePosition.y, 
							puntos : baseFigure[numFigure].puntos, 
							color : !keyCode.active ? "black" : baseFigure[numFigure].color, 
							number : numFigure
						};
			if(veces === 1)
			{
				bottomFigure[i] = dataFigure;
			}
			else
			{
				guessFigure[i] = dataFigure;
			}
			basePosition.x += 3;
		}
	}
};

//Para iniciar el juego...
var init = (function init()
{
	//Para generar las figuras aleatorias...
	randomFigureGuess();
	if(vida >= 4)
	{
		gameEnds();
	}
	return init;
})();

//Para cambiar la figura...
var changeFigure = function(ind)
{
	keyCode.cont = ind === 3 ? keyCode.cont += 1 : 0;
	if(keyCode.cont === 6)
	{
		keyCode.active = !keyCode.active;
		keyCode.cont = 0;
		for(var i = 0; i < bottomFigure.length; i++)
		{
			bottomFigure[i].color = !keyCode.active ? "black" : baseFigure[bottomFigure[i].number].color;
			guessFigure[i].color = !keyCode.active ? "black" : baseFigure[guessFigure[i].number].color;
		}
	}
	if(ind !== 3)
	{
		bottomFigure[ind].number++;
		if(bottomFigure[ind].number === 4)
		{
			bottomFigure[ind].number = 0;
		}
		bottomFigure[ind].puntos = baseFigure[bottomFigure[ind].number].puntos;
		bottomFigure[ind].color = !keyCode.active ? "black" : baseFigure[bottomFigure[ind].number].color;

	}
};

//Para detectar la colisión de los elementos...
var collisionElements = function()
{
	var correctElements = 0;
	var samePosition = 0;
	for(var i = 0; i < bottomFigure.length; i++)
	{
		if(bottomFigure[i].y <= guessFigure[i].y)
		{
			samePosition++;
			if(bottomFigure[i].number === guessFigure[i].number)
			{
				correctElements++;
			}
		}
	}
	if(samePosition === 3 && correctElements === 3)
	{
		dataLCD.SCORE += 25;
		//Guardar la máxima puntuación que se tiene...
		if(dataLCD.SCORE >= dataLCD.HISCORE)
		{
			dataLCD.HISCORE = dataLCD.SCORE;
			localStorage.setItem("guess", dataLCD.SCORE);
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
		init();
		UPFigure = false;
	}
	else
	{
		if(samePosition === 3)
		{
			//Se debe poner en la misma posición donde estaba...
			for(var i = 0; i < bottomFigure.length; i++)
			{
				bottomFigure[i].y = 18;
			}
			if(guessFigure[0].y >= 18)
			{
				vida++;
				init();
				navigator.vibrate(200);
			}
			UPFigure = false;
		}
	}
};

//Los input...
var UPFigure = false;
input.ENTER.press = function(event)
{
	//this.timePress = 0.1;
	if(!UPFigure)
	{
		UPFigure = true;
	}
};

input.LEFT.press = function(event)
{
	changeFigure(0);
};

input.TOP.press = function(event)
{
	changeFigure(1);
};

input.RIGHT.press = function(event)
{
	changeFigure(2);
};

input.BOTTOM.press = function(event)
{
	changeFigure(3);
};

var render = function()
{
	//Para la vida...
	if(vida <= 3)
	{
		pantalla.miniLCD("LEFT", vidaJuego[vida]);
	}
	//Para imprimir las figuras...
	for(var i = 0; i < bottomFigure.length; i++)
	{
		if(UPFigure)
		{
			bottomFigure[i].y--;
		}
		pantalla.imprimeFigura(bottomFigure[i]);
		pantalla.imprimeFigura(guessFigure[i]);
	}
	//Para la velocidad de los elementos que caen...
	if(movement.CUENTA >= FPS)
	{
		for(i = 0; i < bottomFigure.length; i++)
		{
			guessFigure[i].y++;
		}
		movement.CUENTA = 0;
	}
	collisionElements();
	movement.CUENTA++;
};