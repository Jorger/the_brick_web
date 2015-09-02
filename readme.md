# Juego Adivinando.

Juego realizado con caracter académico, inspirado en el juego [Apensar].

![Adivinando](https://dl.dropboxusercontent.com/u/181689/imgGame/videoAdivinando.gif)

### Demo

Es posible acceder al juego a través de la dirección: http://jorger.github.io/juego_adivinando/

Para dispositivos móviles es posible escanear el siguiente código QR.

![QR](https://dl.dropboxusercontent.com/u/181689/imgGame/qrAdivinando.png)

### Objetivo

El objetivo del juego es adivinar una palabra en relación a las imágenes mostradas, también se le entrega al usuario una pista que le ayudará a encontrar la palabra correcta.

### Tecnologías.

Para el presente juego se ha utilizado:

* [API de Flickr]: Para el manejo de las imágenes, dado un tag el servicio devuelve una colección de imágenes (JSON).
* [owlcarousel]: Librería para el manejo de la transición de las imágenes entregadas por la API de Flickr.
* [sweetalert]: Lirería que pemite reemplazar el manejo de los mensajes nativos del navegador ```alert()``` ```confirm()```
* [SoundJS]: Para el manejo de los sonidos.

También se ha utilizado ```localStorage```para el almacenamiento del número de la palabra que se encuentra el usuario.

Para que el juego funcione como una "aplicación nativa" (webApp) es necesario "instalarla" en este caso a través de la opción "Add Home Screen" que ofrece el navegador (Chrome), además para controlar la orientación del dispositivo y otras opciones una vez "instalado" se hace uso del archivo [manifest.json]

### Futuras Mejoras.

En este momento el juego se alimenta de un archivo .json para la relación de palabras a adivinar, en una próxima versión se esperar adicionar una base de datos (Mysql ó Mongo) la cual guarde dicha información.

Además del almacenamiento del nivel de usuario no por localStorage sino a través de una base de datos, ranking por usuarios y comunicación con medios sociales (Facebook/Twitter/G+)

### Autor
Jorge Rubaino [@ostjh]
License
----
MIT
[@ostjh]:https://twitter.com/ostjh
[Apensar]:https://play.google.com/store/apps/details?id=com.icogroup.apensar&hl=es_419
[API de Flickr]:https://www.flickr.com/services/api/
[owlcarousel]:http://owlgraphic.com/owlcarousel/
[sweetalert]:http://t4t5.github.io/sweetalert/
[SoundJS]:http://www.createjs.com/soundjs
[manifest.json]:https://developers.google.com/web/updates/2014/11/Support-for-installable-web-apps-with-webapp-manifest-in-chrome-38-for-Android
