/*
Frog across the river game - Inspired by the Brick Game...
Author: Jorge Rubiano.
https://twitter.com/ostjh
*/
var FPS = movement.BASE - movement.BASE * ((dataLCD.SPEED - 1) * movement.PERCENTAGE) / 100;
var vidaJuego = ["LINEFOUR", "LINETHREE", "LINETWO", "POINT"];
var vida = 0;
createjs.Sound.registerSound("games/frog/sounds/explosion.mp3", "explosion");
//Para el huevo de pascua, (06 veces botón abajo estando en la posición inicial del juego)...
var keyCode = {active : false, cont : 0, 
					colors : {
								frog  : "#3D6437", 
								walls : "#413B3B", 
								explosion : "#CC0C3C"}};
//Para la Rana...
var frog = {
				x 			: 4, 
				y 			: 19, 
				color 		: !keyCode.active ? "black" : keyCode.colors.frog,
				puntos		: figures["POINT"].TOP, 
				parpadea 	: 0, 
				cont 		: 0, 
				max			: 6
			};
//Para la explosión cuando la "rana" colisione con algún "carro"...
var explosion = [
					[[1, 0, 0, 1], [0, 1, 1, 0], [0, 1, 1, 0], [1, 0, 0, 1]], 
					[[0, 1, 1, 0], [1, 0, 0, 1], [1, 0, 0, 1], [0, 1, 1, 0]]
				];

//Para la explosión de la RANA...
var explosionFROG = {
						anima 	: false, 
						cont 	: 0, 
						veces	: 0, 
						x 		: 0,
						y 		: 0
				};

//Los diferentes niveles a los cuales subirá la rana...
var obstacles = [
				{
					numberWalls : 5, 
					numberCars : 5, 
					finalPosition : 9
				}, 
				{
					numberWalls : 6, 
					numberCars : 7,
					finalPosition : 7
				},
				{
					numberWalls : 7, 
					numberCars : 9,
					finalPosition : 5
				},
				{
					numberWalls : 8, 
					numberCars : 10,
					finalPosition : 3
				}
			];
//Para saber el número de elementos a mostrar mientras se termina de pasar un nivel y llegar a otro...
var numEscale = 0;
//Guardará los elementos que han logardo llegar al punto final...
var objective = [];
//Para indicar si avanzará en el ascenso...
var ascenso = true;
//Iniciarlizar el vector...
//Para el movimiento de la "rana"
var moveFrog = function(x, y)
{
	if(!explosionFROG.anima)
	{
		//Para validar el huvo de pascua que cambie el color de los elementos...
		//La posición de la rana debe ser la inicial (19)
		keyCode.cont = frog.y === 19 ? (y === 2 ? keyCode.cont += 1 : 0) : 0;
		if(keyCode.cont === 6)
		{
			keyCode.active = !keyCode.active;
			keyCode.cont = 0;
		}
		//Fin de la validación....
		var newPos = {
						x	: frog.x + x, 
						y 	: frog.y + y
					};
		if((newPos.x >= 0 && newPos.x <= lcdDimensions.ancho - 1) && (newPos.y >= 0 && newPos.y <= lcdDimensions.alto - 1))
		{
			frog.x = newPos.x;
			frog.y = newPos.y;			
			if(frog.y === obstacles[numEscale].finalPosition)
			{
				//Buscar si la posición está libre...
				if(!objective[frog.x].active)
				{
					dataLCD.SCORE += 50;
					//Guardar la máxima puntuación que se tiene...
					if(dataLCD.SCORE >= dataLCD.HISCORE)
					{
						dataLCD.HISCORE = dataLCD.SCORE;
						localStorage.setItem("frog", dataLCD.SCORE);
					}
					objective[frog.x].active = true;
					objective[frog.x].x = frog.x;
					objective[frog.x].y = frog.y
					//Buscar si se han llevado todas las "ranas"
					var numFrog = 0;
					for(var i = 0; i < objective.length; i++)
					{
						if(objective[i].active)
						{
							numFrog++;
						}
					}
					if(numFrog === objective.length)
					{
						ascenso = true;
						numEscale++;
						dataLCD.LEVEL++;
						//Darle una vida cuando pasa el nivel...
						if(vida !== 0)
						{
							vida--;
						}
						if(numEscale >= 4)
						{
							numEscale = 0;
							dataLCD.SPEED++;
							//Se debe aumentar la velocidad...
							FPS = movement.BASE - movement.BASE * ((dataLCD.SPEED - 1) * movement.PERCENTAGE) / 100;
							if(FPS <= 0)
							{
								FPS = 1;
							}
						}
					}
					init();
				}
				else
				{
					frogCollides();
				}
			}

		}
	}
};

//Los "muros" base que separán de los "carros"...
var wallsBase = function()
{
	var yBase = 18; //La posición base en la que iniciarán los muros del juego...
	for(var i = 1; i <= obstacles[numEscale].numberWalls; i++)
	{
		for(var c = 0; c < lcdDimensions.ancho; c++)
		{
			if(explosionWalls(c, yBase))
			{
				pantalla.dibujarCelda({
									x : c, 
									y : yBase, 
									activado : true, 
									color : (!keyCode.active ? "black" : keyCode.colors.walls)
								});
			}
		}
		yBase -= 2;
	}
};

//Para determinar si porciones del cavas se mostrarán cuando se realice una explisión...
var explosionWalls = function(x, y)
{
	var imprime = true;
	if(explosionFROG.anima)
	{
		//Para X...
		if(x >= explosionFROG.x && x <= explosionFROG.x + 3)
		{
			//Para Y...
			if(y >= explosionFROG.y && y <= explosionFROG.y + 3)
			{
				imprime = false;
			}
		}
	}
	return imprime;
}

//Los "carros" que se mostrarán en el escenario, es decir, el tráfico...
var CARS = [
				{
					x 		: 0, 
					y 		: 17, 
					size 	: 3,
					speed 	: FPS - (FPS * 0.05) <= 0 ? 1 : FPS - (FPS * 0.05),
					move 	: -1, 
					cont 	: 0, 
					color 	: "#75701A"
				}, 
				{
					x 		: 3, 
					y 		: 15, 
					size 	: 4,
					speed 	: FPS - (FPS * 0.1) <= 0 ? 1 : FPS - (FPS * 0.1),
					move 	: 1, 
					cont 	: 0,
					color 	: "#553C2E"
				}, 
				{
					x 		: 1, 
					y 		: 13, 
					size 	: 2,
					speed 	: FPS - (FPS * 0.08) <= 0 ? 1 : FPS - (FPS * 0.08),
					move 	: -1, 
					cont 	: 0,
					color 	: "#16386C"
				}, 
				{
					x 		: 5, 
					y 		: 13, 
					size 	: 3,
					speed 	: FPS - (FPS * 0.08) <= 0 ? 1 : FPS - (FPS * 0.08),
					move 	: -1, 
					cont 	: 0,
					color 	: "#16386C"
				}, 
				{
					x 		: 1, 
					y 		: 11, 
					size 	: 5,
					speed 	: FPS - (FPS * 0.3) <= 0 ? 1 : FPS - (FPS * 0.3),
					move 	: 1, 
					cont 	: 0,
					color 	: "#652729"
				}, 
				{
					x 		: 1, 
					y 		: 9, 
					size 	: 3,
					speed 	: FPS - (FPS * 0.12) <= 0 ? 1 : FPS - (FPS * 0.12),
					move 	: -1, 
					cont 	: 0,
					color 	: "#75701A"
				}, 
				{
					x 		: 6, 
					y 		: 9, 
					size 	: 3,
					speed 	: FPS - (FPS * 0.12) <= 0 ? 1 : FPS - (FPS * 0.12),
					move 	: -1, 
					cont 	: 0,
					color 	: "#16386C"
				}, 
				{
					x 		: 0, 
					y 		: 7, 
					size 	: 2,
					speed 	: FPS - (FPS * 0.08) <= 0 ? 1 : FPS - (FPS * 0.08),
					move 	: 1, 
					cont 	: 0,
					color 	: "#16386C"
				}, 
				{
					x 		: 5, 
					y 		: 7, 
					size 	: 2,
					speed 	: FPS - (FPS * 0.08) <= 0 ? 1 : FPS - (FPS * 0.08),
					move 	: 1, 
					cont 	: 0,
					color 	: "#75701A"
				},
				{
					x 		: 2, 
					y 		: 5, 
					size 	: 6,
					speed 	: FPS - (FPS * 0.35) <= 0 ? 1 : FPS - (FPS * 0.35),
					move 	: -1, 
					cont 	: 0,
					color 	: "#652729"
				}
			];

//Para mostrar/mover los carros en el tráfico...
var carsBase = function()
{
	var xBase = 0;
	for(var i = 1; i <= obstacles[numEscale].numberCars; i++)
	{
		if(!explosionFROG.anima)
		{
			if(CARS[i - 1].cont >= CARS[i - 1].speed)
			{
				if(CARS[i - 1].x + CARS[i - 1].move < 0 || CARS[i - 1].x + CARS[i - 1].move >= lcdDimensions.ancho)
				{
					CARS[i - 1].x = CARS[i - 1].x + CARS[i - 1].move < 0 ? lcdDimensions.ancho - 1 : 0;
				}
				else
				{
					CARS[i - 1].x += CARS[i - 1].move;
				}
				CARS[i - 1].cont = 0;
			}
			CARS[i - 1].cont++;
		}
		for(var c = 0; c < CARS[i - 1].size; c++)
		{
			xBase = CARS[i - 1].x + c;
			if(xBase >= lcdDimensions.ancho)
			{
				xBase = (xBase - lcdDimensions.ancho);
			}
			if(explosionWalls(xBase, CARS[i - 1].y))
			{
				pantalla.dibujarCelda({
									x : xBase, 
									y : CARS[i - 1].y, 
									activado : true, 
									color : (!keyCode.active ? "black" : CARS[i - 1].color)
								});
			}
		}
	}
};

//Se debe buscar si la rana está en la misma posición que uno de los carros...
var collisionFrog = function()
{
	var xBase = 0;
	var colisiona = false;
	for(var i = 1; i <= obstacles[numEscale].numberCars; i++)
	{
		//Misma Posición en Y...
		if(frog.y === CARS[i - 1].y)
		{
			for(var c = 0; c < CARS[i - 1].size; c++)
			{
				xBase = CARS[i - 1].x + c;
				if(xBase >= lcdDimensions.ancho)
				{
					xBase = (xBase - lcdDimensions.ancho);
				}
				if(frog.x === xBase)
				{
					colisiona = true;
					break;
				}
			}
			if(colisiona)
			{
				break;
			}
		}
	}
	//Colisiona, se llama la función de colisión que inicia la explosión...
	if(colisiona)
	{
		frogCollides();
	}
};

var frogCollides = function()
{
	//Para quitar la vida, en este caso relacionado al vector de vidas...
	createjs.Sound.play("explosion");
	vida++;
	//Para iniciar la animación de explisión...
	explosionFROG.anima = true;
	explosionFROG.cont = explosionFROG.veces = 0;
	explosionFROG.x = frog.x - 1;
	explosionFROG.y = frog.y - 1;
	if(explosionFROG.x < 0 || explosionFROG.x + 4 >= lcdDimensions.ancho)
	{
		explosionFROG.x = explosionFROG.x < 0 ? 0 : 6;
	}
	if(explosionFROG.y < 0 || explosionFROG.y + 4 >= lcdDimensions.alto)
	{
		explosionFROG.y = explosionFROG.y < 0 ? 0 : 16;
	}
	navigator.vibrate(200);
};

//Para mostrar las "ranas" que se han llevado...
var frogsTake = function()
{
	for(i = 0; i < objective.length; i++)
	{
		if(objective[i].active)
		{
			if(explosionWalls(objective[i].x, objective[i].y))
			{
				pantalla.dibujarCelda({
										x : objective[i].x, 
										y : objective[i].y, 
										activado : true, 
										color : (!keyCode.active ? "black" : keyCode.colors.frog)
									});
			}
		}
	}
};

//Función que inicializa el juego...
var init = (function init()
{
	//Reiniciar la posición de la rana...
	frog.y = 19;
	frog.x = 4;
	frog.parpadea = frog.cont = 0;
	//Reiniciar el valor de explosión...
	explosionFROG.anima = false;
	if(vida >= 4)
	{
		gameEnds();
	}
	//Para saber si está en ascenso cuando se incializa...
	if(ascenso)
	{
		ascenso = false;
		//Se deberán reiniciar las variables de posición a donde deberá llevar a la rana...
		for(var i = 0; i < lcdDimensions.ancho; i++)
		{
			objective[i] = {
								active : false, 
								x : 0, 
								y : 0
						};
		}
	}
	return init;
})();

input.ENTER.press = function(event)
{
	moveFrog(0, -2);
};

input.LEFT.press = function(event)
{
	moveFrog(-1, 0);
};

input.TOP.press = function(event)
{
	moveFrog(0, -2);
};

input.RIGHT.press = function(event)
{
	moveFrog(1, 0);
};

input.BOTTOM.press = function(event)
{
	moveFrog(0, 2);
};

var render = function()
{
	if(!explosionFROG.anima)
	{
		if(frog.cont === frog.max)
		{
			frog.parpadea++;
			frog.color = frog.parpadea % 2 === 0 ? "#8C9A93" : (!keyCode.active ? "black" : keyCode.colors.frog);
			frog.cont = 0;
			if(frog.parpadea >= 60)
			{
				frog.parpadea = 0;
			}
		}
		frog.cont++;
		pantalla.imprimeFigura(frog);
		collisionFrog();
	}
	//Para la "impresión" de los muros base...
	wallsBase();
	//Para los "carros" en el escenario...
	carsBase();
	//Para dibujar las "ranas" que se han llevado...
	frogsTake();
	if(explosionFROG.anima)
	{
		pantalla.imprimeFigura(
								{
									x 	: explosionFROG.x, 
									y 	: explosionFROG.y, 
									color : (!keyCode.active ? "black" : keyCode.colors.explosion),
									puntos : explosion[explosionFROG.veces % 2 === 0 ? 0: 1]
								}
							);
		explosionFROG.cont++;
		if(explosionFROG.cont >= 4)
		{
			explosionFROG.cont = 0;
			explosionFROG.veces++;
			if(explosionFROG.veces >= 8)
			{
				init();
			}
		}
	}
	//Para la vida...
	if(vida <= 3)
	{
		pantalla.miniLCD("LEFT", vidaJuego[vida]);
	}
};