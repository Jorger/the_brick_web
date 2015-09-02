/*
THE TANKS GAME - Inspired by the Brick Game...
Author: Jorge Rubiano.
https://twitter.com/ostjh
*/
//La velocida de movimiento por defecto de los demás tanques...
var FPS = 0;
createjs.Sound.registerSound("games/tank/sounds/explosion.mp3", "explosion");
//createjs.Sound.registerSound("games/tank/sounds/choque.mp3", "choque");
//Las diferentes posiciones que tiene el tanque...
var POSTANK  = {
					"LEFT" 		: [[0, 1, 1], [1, 1, 0], [0, 1, 1]],
					"TOP" 		: [[0, 1, 0], [1, 1, 1], [1, 0, 1]], 
					"RIGHT" 	: [[1, 1, 0], [0, 1, 1], [1, 1, 0]],
					"BOTTOM" 	: [[1, 0, 1], [1, 1, 1],[0, 1, 0]]
				};

//Para activar el huevo de pascua del juego, en este caso los colores...
//izquierda, abajo, derecha, arriba, disparo...
var keyCode = {active : false, cont : 0, keyInput : [0, 3, 2, 1, "ENTER"]}; 
//Para la explosión del Tanque...
var explosionTANK = {
						anima 	: false, 
						cont 	: 0, 
						veces	: 0, 
						x 		: 0,
						y 		: 0, 
						puntos  : [[[1, 0, 0, 1], [0, 1, 1, 0], [0, 1, 1, 0], [1, 0, 0, 1]], 
								   [[0, 1, 1, 0], [1, 0, 0, 1], [1, 0, 0, 1], [0, 1, 1, 0]]]
				};
//Para los incrementos que tendrán los tanques cuando se mueven...
var directions = [{x : -1 , y : 0}, 
				  {x : 0, y : -1}, 
				  {x : 1 , y : 0}, 
				  {x : 0 , y : 1}];

//Para la representación de la vida...
var vidaJuego = ["LINEFOUR", "LINETHREE", "LINETWO", "POINT"];
var vida = 0;
//Para las balas que se dispararan...
var bullets = [];
//Constructor de figuras, en este caso de los tanques...
var CreateFigure = function(data)
{
	this.x = data.x;
	this.y = data.y;
	this.color = data.color;
	this.puntos = data.puntos;
	this.direction = data.direction;
	this.speed = data.speed;
	this.cont = data.cont;
};
//Tanque principal...
var TANK = new CreateFigure({
								x: 3, 
								y: 10, 
								color : "black", 
								puntos : POSTANK.BOTTOM, 
								direction : 3, 
								speed : 5, 
								cont : 0
							});
//La veocidad de la bala...
//
var speedBullet = {
					speed 	: TANK.speed - TANK.speed * 0.5,
					cont 	: 0
				};

//La relación de enemigos, que heredan de Tanque...
var visibleEnemies = 0;
var ENEMIESTANK = [
			   		JSON.parse(JSON.stringify(TANK)), 
			   		JSON.parse(JSON.stringify(TANK)), 
			   		JSON.parse(JSON.stringify(TANK)), 
			   		JSON.parse(JSON.stringify(TANK))
				];
//Las posiciones donde los enemigos aparecerán...
var posEnemies = [{x : 0 , y : 0}, 
				  {x : 7, y : 0}, 
				  {x : 0 , y : 17}, 
				  {x : 7 , y : 17}];

//Para configurar propiedades de los tanques...
var configTank = function(config)
{
	ENEMIESTANK[config.num].x = posEnemies[config.pos].x;
	ENEMIESTANK[config.num].y = posEnemies[config.pos].y;
	ENEMIESTANK[config.num].direction = config.direction;
	ENEMIESTANK[config.num].puntos = POSTANK[Object.keys(POSTANK)[ENEMIESTANK[config.num].direction]];
	ENEMIESTANK[config.num].color = !keyCode.active ? "black" : randomColor();
};

//Función que inicializa las variables al iniciar el juego...
var init = (function init()
{
	visibleEnemies = 2;
	bullets = []; //Se reinicia la variable de balas...
	//Para poner establecer los puntos donde se ubicarán los enemigos...
	for(var i = 0; i < ENEMIESTANK.length; i++)
	{
		configTank({
						num 		: i, 
						pos  		: i, 
						direction 	: Math.floor(Math.random() * 4), 
						color 		: "black"
					});
		ENEMIESTANK[i].visible = i < visibleEnemies ? true : false;
		ENEMIESTANK[i].intelligence = Math.floor(Math.random() * 2) === 1 ? true : false;
	}
	//Reiniciar la posición del tanque principal...
	TANK.x = 3;
	TANK.y = 10;
	TANK.direction  = Math.floor(Math.random() * 4);
	TANK.puntos  = POSTANK[Object.keys(POSTANK)[TANK.direction]];
	TANK.color = !keyCode.active ? "black" : "#702929";
	//Fin de reiniciar al personaje...
	//Reiniciar la variable de animación de explosión...
	explosionTANK.anima = false;
	dataLCD.LEVEL = dataLCD.SPEED = 1;
	FPS = movement.BASE - movement.BASE * ((dataLCD.SPEED - 1) * movement.PERCENTAGE) / 100;
	if(vida >= 4)
	{
		gameEnds();
	}
	return init;
})();

//Generación aletorio de color...
function randomColor()
{
	return 'rgb(' + (Math.floor(Math.random() * 100)) + ',' + (Math.floor(Math.random() * 100)) + ',' + (Math.floor(Math.random() * 100)) + ')';
}

//Para girar los tanques...
var turnTank = function(direction, numTank)
{
	//Es el tanque principal...
	if(numTank === 0)
	{
		easterEgg(direction);
		if(TANK.direction !== direction)
		{
			TANK.puntos = POSTANK[Object.keys(POSTANK)[direction]];
			TANK.direction = direction;
		}
		else
		{
			moveTank(0, true);
		}
	}
	else
	{
		//Son los demás tanques...
		ENEMIESTANK[numTank - 1].puntos = POSTANK[Object.keys(POSTANK)[direction]];
		ENEMIESTANK[numTank - 1].direction = direction;
	}
};

var moveTank = function(numTank, moverse)
{
	var move = true;
	var tankTmp = JSON.parse(JSON.stringify(numTank === 0 ? TANK : ENEMIESTANK[numTank - 1]));
	if(numTank === 0 && !moverse)
	{
		move = input.LEFT.sustained && tankTmp.direction === 0 ? true : 
			   input.TOP.sustained && tankTmp.direction === 1 ? true : 
			   input.RIGHT.sustained && tankTmp.direction === 2 ? true : 
			   input.BOTTOM.sustained && tankTmp.direction === 3 ? true : false;
	}
	if(move)
	{
		var newPos = {
						x	: tankTmp.x + directions[tankTmp.direction].x,
						y 	: tankTmp.y + directions[tankTmp.direction].y
					};
		if((newPos.x >= 0 && newPos.x <= lcdDimensions.ancho - 3) && (newPos.y >= 0 && newPos.y <= lcdDimensions.alto - 3) && !collisionTank(numTank))
		{
			if(numTank === 0)
			{
				TANK.x = newPos.x;
				TANK.y = newPos.y;
			}
			else
			{
				ENEMIESTANK[numTank - 1].x = newPos.x;
				ENEMIESTANK[numTank - 1].y = newPos.y;
				//Revisar si el personaje está en la mira de disparo, si es así disparar...
				if(ENEMIESTANK[numTank - 1].intelligence)
				{
					if(tankClose(numTank))
					{
						bulletShoots(numTank);
					}
				}	
			}
		}
		else
		{
			if(numTank !== 0)
			{
				turnTank(Math.floor(Math.random() * 4), numTank);
				if(!ENEMIESTANK[numTank - 1].intelligence)
				{
					bulletShoots(numTank);
				}
			}
		}
	}
}

//Revisar si el tanque del personaje está cerca para realizar el disparo...
var tankClose = function(numTank)
{
	var shoot = false;
	var posCayon = [{x : 0, y : 1}, 
					{x : 1, y : 0},
					{x : 2, y : 1},
					{x : 1, y : 2}];

	//Para hallar la posición donde está el cañón...
	var cayon = {
					x : ENEMIESTANK[numTank - 1].x + posCayon[ENEMIESTANK[numTank - 1].direction].x, 
					y : ENEMIESTANK[numTank - 1].y + posCayon[ENEMIESTANK[numTank - 1].direction].y
				};
	//Tanque mirando hacia la izquierda y personaje ubicado a la izquierda del tanque...
	if(ENEMIESTANK[numTank - 1].direction === 0 && TANK.x < ENEMIESTANK[numTank - 1].x)
	{
		if(cayon.y >= TANK.y && cayon.y <= TANK.y + 2)
		{
			shoot = true;
		}
	}
	else
	{
		//Tanque mirando hacia arriba y personaje ubicado arriba del tanque...
		if(ENEMIESTANK[numTank - 1].direction === 1 && TANK.y < ENEMIESTANK[numTank - 1].y)
		{
			
			if(cayon.x >= TANK.x && cayon.x <= TANK.x + 2)
			{
				shoot = true;
			}
		}
		else
		{
			//Tanque mirando hacia la derecha y personaje ubicado a la derecha del tanque...
			if(ENEMIESTANK[numTank - 1].direction === 2 && TANK.x > ENEMIESTANK[numTank - 1].x)
			{
				if(cayon.y >= TANK.y && cayon.y <= TANK.y + 2)
				{
					shoot = true;
				}
			}
			else
			{
				//Tanque mirando hacia abajo y personaje ubicado abajo del tanque...
				if(ENEMIESTANK[numTank - 1].direction === 3 && TANK.y > ENEMIESTANK[numTank - 1].y)
				{
					if(cayon.x >= TANK.x && cayon.x <= TANK.x + 2)
					{
						shoot = true;
					}
				}
			}
		}
	}
	return shoot;
};

//Detectar la colisión de un tanque...
var collisionTank = function(numTank)
{
	var tankTmp = JSON.parse(JSON.stringify(numTank === 0 ? TANK : ENEMIESTANK[numTank - 1]));
	var rangoMove = {
						x : 
							{
								inicio 		: tankTmp.x + directions[tankTmp.direction].x, 
								finaliza 	: (tankTmp.x + 2) + directions[tankTmp.direction].x
							}, 
						y : 
							{
								inicio 		: tankTmp.y + directions[tankTmp.direction].y, 
								finaliza 	: (tankTmp.y + 2) + directions[tankTmp.direction].y
							} 
					};
	var colisiona = false;
	//Saber si el tanque que llega colisiona contra el principal (jugador)...
	if(numTank !== 0)
	{
		if(revisaCollision(rangoMove, TANK.x, TANK.y))
		{
			colisiona = true;
		}
	}
	//Recisar si se se choca contra los demás tanques, obviando el actual...
	if(!colisiona)
	{
		for(var i = 1; i <= ENEMIESTANK.length; i++)
		{
			if(i !== numTank && ENEMIESTANK[i - 1].visible)
			{
				if(revisaCollision(rangoMove, ENEMIESTANK[i - 1].x, ENEMIESTANK[i - 1].y))
				{
					colisiona = true;
					break;
				}
			}
		}
	}
	return colisiona;
};

var revisaCollision = function(rangoMove, x, y)
{
	//Saber si colisiona tanto en x como en y
	var colPuntos = {x : false, y : false};
	//Validar la colisión en x...
	if(rangoMove.x.inicio >= x && rangoMove.x.inicio <= x + 2)
	{
		colPuntos.x = true;
	}
	else
	{
		if(rangoMove.x.finaliza >= x && rangoMove.x.finaliza <= x + 2)
		{
			colPuntos.x = true;
		}
	}
	//Para la colisión en Y...
	if(rangoMove.y.inicio >= y && rangoMove.y.inicio <= y + 2)
	{
		colPuntos.y = true;
	}
	else
	{
		if(rangoMove.y.finaliza >= y && rangoMove.y.finaliza <= y + 2)
		{
			colPuntos.y = true;
		}
	}
	return colPuntos.x && colPuntos.y;
};

//Para disparar la bala desde el tanque...
var bulletShoots = function(numTank)
{
	//Validar si puede o no disparar otra bala...
	//Buscar las balas que correspondan al que dispara...
	var number = {bullet : 0, shoot : 0};
	for(var i = 0; i < bullets.length; i++)
	{
		if(bullets[i].source === numTank)
		{
			number.bullet++;
			if(bullets[i].move >= 6)
			{
				number.shoot++;
			}
		}
	}
	if(number.bullet === number.shoot)
	{
		var tankTmp = JSON.parse(JSON.stringify(numTank === 0 ? TANK : ENEMIESTANK[numTank - 1]));
		var posbullet = [{x : -1, y : 1}, 
						 {x : 1, y : -1},
						 {x : 3, y : 1},
						 {x : 1, y : 3}];
		var newPos = {
						x	: tankTmp.x + posbullet[tankTmp.direction].x,
						y 	: tankTmp.y + posbullet[tankTmp.direction].y
					};
		if((newPos.x >= 0 && newPos.x < lcdDimensions.ancho) && (newPos.y >= 0 && newPos.y < lcdDimensions.alto))
		{
			//Crear una bala...
			bullets.push({
							source 		: numTank, 
							x 			: newPos.x,
							y 			: newPos.y, 
							move 		: 0, 
							color 		: numTank === 0 ? (!keyCode.active ? "black" : TANK.color) : (!keyCode.active ? "black" : ENEMIESTANK[numTank - 1].color),
							direction 	: tankTmp.direction
						});
		}
	}
};

var printBullets = function()
{
	var newPos = {x	: 0, y 	: 0};
	var deleteBullets = []; //Guardará las balas que se deben eliminar...
	//Si se moverá la bala...
	var moveBullet = speedBullet.cont >= speedBullet.speed ? true : false;
	var imprime = true;
	for(var i = 0; i < bullets.length; i++)
	{
		imprime = true;
		if(moveBullet && !explosionTANK.anima)
		{
			newPos.x = bullets[i].x + directions[bullets[i].direction].x;
			newPos.y = bullets[i].y + directions[bullets[i].direction].y;
			if((newPos.x >= 0 && newPos.x < lcdDimensions.ancho) && (newPos.y >= 0 && newPos.y < lcdDimensions.alto))
			{
				var dataCollision = collisionBullet(i, newPos);
				if(!dataCollision.collision)
				{
					bullets[i].x = newPos.x;
					bullets[i].y = newPos.y;
					bullets[i].move++;
				}
				else
				{
					//Regresa un valor de tipo (type) (no se ha usado aún)...
					deleteBullets.push(i);
					//Para eliminar la otra bala...
					if(dataCollision.type === 1)
					{
						deleteBullets.push(dataCollision.choca);	
					}
					imprime = false;
				}
			}
			else
			{
				imprime = false;
				deleteBullets.push(i);
			}
		}
		if(imprime)
		{
			pantalla.dibujarCelda({
							x 			: bullets[i].x, 
							y 			: bullets[i].y, 
							activado 	: true, 
							color 		: bullets[i].color
						});
		}
	}
	//Contar de movimiento/velocidad de la bala...
	speedBullet.cont = !moveBullet ? speedBullet.cont + 1 : 0;
	//Para eliminar las balas que han salido o que chocaron (aún no se valida)...
	for(i = 0; i < deleteBullets.length; i++)
	{	
		bullets.splice(deleteBullets[i], 1);		
	}
};

//Para validar la colisión de la bala...
var collisionBullet = function(bullet, newPos)
{
	var action = {collision: false, type : 0, choca : 0};
	//Primero saber si ha colisionado con otra bala, diferente a la que se ha enviado...
	for(var i = 0; i < bullets.length; i++)
	{
		if(i !== bullet)
		{
			if((bullets[i].x === newPos.x) && (bullets[i].y === newPos.y))
			{
				action.collision = true;
				action.choca = i;
				action.type = 1;
				break;
			}
		}
	}
	if(!action.collision)
	{
		//Revisar si choca contra el personaje principal...
		if((newPos.x >= TANK.x && newPos.x <= TANK.x + 2) && (newPos.y >= TANK.y && newPos.y <= TANK.y + 2))
		{
			action.collision = true;
			action.choca = 0;
			action.type = 3;
			destroysTank();
		}
	}
	if(!action.collision)
	{
		//Ver si choca contra otro tanque y si la bala proviene del tanque principal, eliminarlo...
		for(i = 0; i < ENEMIESTANK.length; i++)
		{
			if(ENEMIESTANK[i].visible)
			{
				if((newPos.x >= ENEMIESTANK[i].x && newPos.x <= ENEMIESTANK[i].x + 2) && (newPos.y >= ENEMIESTANK[i].y && newPos.y <= ENEMIESTANK[i].y + 2))
				{
					action.collision = true;
					action.choca = i;
					action.type = 2;
					if(bullets[bullet].source === 0)
					{
						ENEMIESTANK[i].visible = false;
						scoreTank();
					}
					break;
				}
			}
		}
	}
	return action;
};

//Indica que el tanque dle personaje ha sido destruido...
var destroysTank = function()
{
	createjs.Sound.play("explosion");
	vida++;
	//Para iniciar la animación de explisión...
	explosionTANK.anima = true;
	explosionTANK.cont = explosionTANK.veces = 0;
	explosionTANK.x = TANK.x - 1;
	explosionTANK.y = TANK.y - 1;
	if(explosionTANK.x < 0 || explosionTANK.x + 4 >= lcdDimensions.ancho)
	{
		explosionTANK.x = explosionTANK.x < 0 ? 0 : 6;
	}
	if(explosionTANK.y < 0 || explosionTANK.y + 4 >= lcdDimensions.alto)
	{
		explosionTANK.y = explosionTANK.y < 0 ? 0 : 16;
	}
	navigator.vibrate(200);
};

var scoreTank = function()
{
	//Guardar la máxima puntuación que se tiene...
	//createjs.Sound.play("choque");
	dataLCD.SCORE += 10;
	if(dataLCD.SCORE >= dataLCD.HISCORE)
	{
		dataLCD.HISCORE = dataLCD.SCORE;
		localStorage.setItem("tank", dataLCD.SCORE);
	}
	movement.CONT++;
	if(movement.CONT >= movement.MAX)
	{
		dataLCD.LEVEL++;
		movement.CONT = 0;
		if(dataLCD.LEVEL % 3 === 0)
		{
			//Para mostrar un enemigo adicional...
			if(visibleEnemies + 1 <= 4)
			{
				visibleEnemies++;
			}
			else
			{
				dataLCD.SPEED++;
				if(vida - 1 >= 0)
				{
					vida--;
				}
			}
		}
		FPS = movement.BASE - (movement.BASE * (((dataLCD.SPEED - 1) * movement.PERCENTAGE) / 100));
		if(FPS <= 0)
		{
			FPS = 1;
		}
	}
}

//Para activar el huevo de pascua, relacionado al cambio de color...
var easterEgg = function(valKey)
{
	if(keyCode.keyInput[keyCode.cont] === valKey)
	{
		keyCode.cont++;
		if(keyCode.cont >= 5)
		{
			keyCode.active = !keyCode.active;
			keyCode.cont = 0;
			TANK.color = !keyCode.active ? "black" : "#702929";
			for(var i = 0; i < ENEMIESTANK.length; i++)
			{
				ENEMIESTANK[i].color = !keyCode.active ? "black" : randomColor();
			}
		}
	}
	else
	{
		keyCode.cont = 0;
	}
};

input.ENTER.press = function(event)
{
	//Tiempo en que se considerará que el botón está sostenido...
	//0 no tendrá está propiedad...
	this.timePress = 0.5;
	easterEgg("ENTER")
	bulletShoots(0);
};

input.LEFT.press = function(event)
{
	this.timePress = 0.2;
	turnTank(0, 0);
};

input.TOP.press = function(event)
{
	this.timePress = 0.2;
	turnTank(1, 0);
};

input.RIGHT.press = function(event)
{
	this.timePress = 0.2;
	turnTank(2, 0);
};

input.BOTTOM.press = function(event)
{
	this.timePress = 0.2;
	turnTank(3, 0);

};

var render = function()
{
	if(!explosionTANK.anima)
	{
		pantalla.imprimeFigura(TANK);
		if(TANK.cont >= TANK.speed)
		{
			moveTank(0, false);
			TANK.cont = 0;
		}
		TANK.cont++;
		if(input.ENTER.sustained)
		{
			bulletShoots(0);
		}
	}
	else
	{
		pantalla.imprimeFigura(
								{
									x 	: explosionTANK.x, 
									y 	: explosionTANK.y, 
									color : !keyCode.active ? "black" : "#CC0C3C", 
									puntos : explosionTANK.puntos[explosionTANK.veces % 2 === 0 ? 0: 1]
								}
							);
		explosionTANK.cont++;
		if(explosionTANK.cont >= 4)
		{
			explosionTANK.cont = 0;
			explosionTANK.veces++;
			if(explosionTANK.veces >= 8)
			{
				init();
			}
		}
	}
	for(var i = 0; i < ENEMIESTANK.length; i++)
	{
		if(ENEMIESTANK[i].visible)
		{
			pantalla.imprimeFigura(ENEMIESTANK[i]);
		}
	}
	if(movement.CUENTA >= FPS)
	{
		if(!explosionTANK.anima)
		{
			for(var i = 0; i < ENEMIESTANK.length; i++)
			{
				if(ENEMIESTANK[i].visible)
				{
					moveTank(i + 1, false);
				}
				else
				{
					if(i < visibleEnemies)
					{
						var tmpPos = Math.floor(Math.random() * 4);
						var dirPos = [[2, 3], [0, 3], [1, 2], [0, 1]];
						configTank({
										num 		: i, 
										pos  		: tmpPos, 
										direction 	: dirPos[tmpPos][Math.floor(Math.random() * 2)], 
										color 		: "black"
									});
						if(!collisionTank(i + 1))
						{
							ENEMIESTANK[i].visible = true;
							ENEMIESTANK[i].intelligence = Math.floor(Math.random() * 2) === 1 ? true : false;
						}
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
	//Para imprimir las balas...
	printBullets();
	movement.CUENTA++;
};