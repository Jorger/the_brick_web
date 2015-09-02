/*
THE RACE GAME - Inspired by the Brick Game...
Author: Jorge Rubiano.
https://twitter.com/ostjh
*/
var FPS = 0; //Para la velocidad de renderizado...
//Para el sonido de explosión...
createjs.Sound.registerSound("games/cars/sounds/explosion.mp3", "explosion");
//Para el huevo de pascua, (06 veces botón abajo)...
var keyCode = {active : false, cont : 0, color : {
					car : "#16386C", 
					enemieOne : "#3D6437", 
					enemieTwo : "#75701A", 
					barrier : "#413B3B", 
					explosion : "#CC0C3C"
				}};
//Para crear las figuras en el escenario...
var CreateFigure = function(data)
{
	this.x = data.x;
	this.y = data.y;
	this.color = data.color;
	this.puntos = data.puntos;
};
var positionCAR = "LEFT"; //La posición donde se encuentra el carro...
var CAR = new CreateFigure({
								x: 2, 
								y: 16, 
								color : "black", 
								puntos : [[0, 1, 0], [1, 1, 1], [0, 1, 0], [1, 0, 1]]
							});
var explosion = [
					[[1, 0, 0, 1], [0, 1, 1, 0], [0, 1, 1, 0], [1, 0, 0, 1]], 
					[[0, 1, 1, 0], [1, 0, 0, 1], [1, 0, 0, 1], [0, 1, 1, 0]]
				];
//Para saber si ha chocado y debe explotar...
var explosionCAR = {
						anima 	: false, 
						cont 	: 0, 
						veces	: 0, 
						chocado : 0
				};

var vidaJuego = ["LINEFOUR", "LINETHREE", "LINETWO", "POINT"];
var vida = 0;
//Para guardar a los enemigos...
var ENEMIES = [JSON.parse(JSON.stringify(CAR)), JSON.parse(JSON.stringify(CAR))];
var barrier = [];
var basePuntos = figures["LINETWO"].TOP;
for(var i = 1; i <= 7; i++)
{
	//Izquierda...
	barrier.push(new CreateFigure(
					{
						x : 0, 
						y : 0,
						color : "black", 
						puntos : basePuntos
					}
				));
	//Derecha...
	barrier.push(new CreateFigure(
					{
						x : 9, 
						y : 0,
						color : "black", 
						puntos : basePuntos
					}
				));
}

//Para iniciar el juego...
var init = (function init()
{
	ENEMIES[0].x = (Math.floor(Math.random() * 2) + 1) === 1 ? 2 : 5;
	ENEMIES[0].y = -1;
	ENEMIES[1].x = (Math.floor(Math.random() * 2) + 1) === 1 ? 2 : 5;
	ENEMIES[1].y = -13;
	var baseY = -1;
	for(var i = 1, cont = 0; i <= 7; i++, cont+=2)
	{
		barrier[cont].y = barrier[cont + 1].y = baseY;
		baseY -= 3;
	}
	//Reiniciar el valor de explosión del carro...
	explosionCAR.anima = false;
	//Para reiniciar la velocidad...
	dataLCD.LEVEL = dataLCD.SPEED = 1;
	FPS = movement.BASE - movement.BASE * ((dataLCD.SPEED - 1) * movement.PERCENTAGE) / 100;
	if(vida >= 4)
	{
		gameEnds();
	}
	return init;
})();

input.ENTER.press = function(event){this.timePress = 0.1; keyCode.cont = 0;};
input.TOP.press = function(event){this.timePress = 0.1; keyCode.cont = 0;};
input.LEFT.press = function(event)
{
	keyCode.cont = 0;
	if(positionCAR !== "LEFT" && !explosionCAR.anima)
	{
		CAR.x -= 3;
		positionCAR = "LEFT";
	}
};

input.RIGHT.press = function(event)
{
	keyCode.cont = 0;
	if(positionCAR !== "RIGHT" && !explosionCAR.anima)
	{
		CAR.x += 3;
		positionCAR = "RIGHT";
	}
};

input.BOTTOM.press = function(event)
{
	keyCode.cont++;
	if(keyCode.cont === 6)
	{
		keyCode.active = !keyCode.active;
		keyCode.cont = 0;
		CAR.color = !keyCode.active ? "black" : keyCode.color.car;
		//Para los enemigos...
		ENEMIES[0].color = !keyCode.active ? "black" : keyCode.color.enemieOne;
		ENEMIES[1].color = !keyCode.active ? "black" : keyCode.color.enemieTwo;
		//Para las barreras...
		for(var i = 1, cont = 0; i <= 7; i++, cont+=2)
		{
			barrier[cont].color = barrier[cont + 1].color = !keyCode.active ? "black" : keyCode.color.barrier;
		}
	}
};
//Para detectar la colisión de los carros con respecto al personaje...
var collisionCar = function(ind)
{
	var colisiona = false;
	if(CAR.x === ENEMIES[ind].x)
	{
		if((ENEMIES[ind].y >= CAR.y && ENEMIES[ind].y <= CAR.y + 3) || (ENEMIES[ind].y + 3 >= CAR.y && ENEMIES[ind].y + 3 <= CAR.y + 3))
		{
			colisiona = true;
			explosionCAR.chocado = ind;
		}
	}
	return colisiona;
};

var scoreGame = function()
{
	dataLCD.SCORE += 10;
	//Guardar la máxima puntuación que se tiene...
	if(dataLCD.SCORE >= dataLCD.HISCORE)
	{
		dataLCD.HISCORE = dataLCD.SCORE;
		localStorage.setItem("cars", dataLCD.SCORE);
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
};

function randomColor()
{
	return 'rgb(' + (Math.floor(Math.random() * 255)) + ',' + (Math.floor(Math.random() * 100)) + ',' + (Math.floor(Math.random() * 255)) + ')';
}

//Para renderizar el escenario...
var render = function()
{
	//Para el carro...
	if(!explosionCAR.anima)
	{
		pantalla.imprimeFigura(CAR);
	}
	else
	{
		pantalla.imprimeFigura(
								{
									x 	: CAR.x, 
									y 	: CAR.y, 
									color : !keyCode.active ? "black" : keyCode.color.explosion, 
									puntos : explosion[explosionCAR.veces % 2 === 0 ? 0: 1]
								}
							);
		explosionCAR.cont++;
		if(explosionCAR.cont >= 5)
		{
			explosionCAR.cont = 0;
			explosionCAR.veces++;
			if(explosionCAR.veces >= 6)
			{
				init();
			}
		}
	}
	for(var i = 0; i < barrier.length; i++)
	{
		pantalla.imprimeFigura(barrier[i]);
		if(i <= 1)
		{
			if(!explosionCAR.anima || i !== explosionCAR.chocado)
			{
				pantalla.imprimeFigura(ENEMIES[i]);
			}
		}
	}
	if((movement.CUENTA >= ((input.ENTER.sustained || input.TOP.sustained) ? 1 : FPS)))
	{
		//Para el movement de las barreras...
		if(!explosionCAR.anima)
		{
			for(i = 0; i < barrier.length; i++)
			{
				barrier[i].y++;
				if(barrier[i].y >= 20)
				{
					barrier[i].y = -1;
				}
				if(i <= 1)
				{
					ENEMIES[i].y++;
					if(ENEMIES[i].y >= 20)
					{
						ENEMIES[i].y = -4;
						ENEMIES[i].x = (Math.floor(Math.random() * 2) + 1) === 1 ? 2 : 5;
						ENEMIES[i].color = !keyCode.active ? "black" : randomColor(); 
						//Para el marcador del juego...
						scoreGame();
					}
					if(collisionCar(i))
					{
						createjs.Sound.play("explosion");
						explosionCAR.anima = true;
						explosionCAR.veces = explosionCAR.cont = 0;
						navigator.vibrate(200);
						vida++;
					}
				}
			}
		}
		movement.CUENTA = 0;
	}
	if(vida <= 3)
	{
		pantalla.miniLCD("LEFT", vidaJuego[vida]);
	}
	movement.CUENTA++;
};