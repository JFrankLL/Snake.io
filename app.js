
var express = require('express'),
    app = express(),

    http = require('http'),
    server = http.createServer(app),
    socketio = require('socket.io'),
    io = socketio(server),
    socketPort = 3000,
    httpPort = 4000,
  //  address = 'localhost',
    address = '192.168.0.106',
    //conexion a la bd
    bd = require('./public/mysql_setup.js'),
    mysql = require('mysql')

//CACHE---------------------
var bodyParser = require('body-parser')
app.use( bodyParser.json() );   // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));
//---------------------------

app.post('/login', function(req, res){
  console.log('Peticion, logeo de: ' + req.body.uname);res.set(req.body.uname)
  var respuesta
  if(respuesta = logea(req.body.uname, req.body.psw)){//Redireccion
    res.statusCode = 302;
    res.setHeader('Location', 'juego.html');
    res.end();
  }else
    res.send('usuario y/o contraseña incorrectos')

  //console.log(req.body.uname+' '+req.body.psw)
  console.log(respuesta)
});
app.post('/g_conf', function(req, res){
  console.log('chtm')
  console.log('Guardar configuracion: '+req.body.c_fondo);
  req.socket.emit('guardar_config('+req.body.c_fondo+')')
});

function logea(quien, pss){
  var r = bd.logea(quien, pss)
  bd.cerrar()
  console.log(r+" server");
  return r
}

//router----------------------------
var router = express.Router();
router.get('/', function(req, res) {
    res.sendFile( __dirname + "/public/" + "index.html" );
});
app.use('/', router)
//---------------------------------

app.use(express.static('public'))//anexa directorio

app.listen(httpPort, function() {
  console.log('Listo! Disponible en'+ address + ':' + httpPort)
})

//------------------[Base de datos]
/*bd.conectar();
var query = 'SELECT * FROM usuario'
bd.query(query)
bd.cerrar()*/
//---------------------------------

io.listen(socketPort)
// [control logica]---------------------------------------
var jugadores=[]
io.on('connection', function (socket) {
  socket.on('disconnect', function(){
    console.log(socket.id + ' se ha desconectado')
    quita_jugador(socket.id)
  })
  //Que hacerle al snake ***
  socket.on('mover_w', function(){if(jugador.direccion!=2)jugador.direccion = 0})//arriba
  socket.on('mover_a', function(){if(jugador.direccion!=3)jugador.direccion = 1})//izq
  socket.on('mover_s', function(){if(jugador.direccion!=0)jugador.direccion = 2})//abajo
  socket.on('mover_d', function(){if(jugador.direccion!=1)jugador.direccion = 3})//der
  //Extra
  if(jugadores.length >= 4){//Maximo 4 jugadores
    socket.emit('stat',{msg:'Maximo de jugadores alcanzado', con:false})//denegar
    return;
  }
  console.log('Nuevo jugador: '+socket.id)
  //Se crea un snake nuevo
  var largo = 10, direccion = 3, snake = [],
      jugador, spawn = 1+parseInt(Math.random()*40)
  for(var i=largo; i>0; i--)
    snake.push({x:i-largo+1, y:spawn})
  var colores = ["#a3bb67","#f0ad00","#6fccdd","#cc0000"],
      colr = colores[jugadores.length%4],//color chido
      puntos = 0
  jugador = {direccion, snake, socket, colr, puntos}//construye jugador
  jugador.socket.emit('snake_color', {color:colr})//setea el color
  jugadores.push(jugador);
});



// [Main]-------------------------------------------------
var cuadros_w = cuadros_h = 50,
    comida = {x:10, y:10},
    velocidad=64, vez=0, main = setInterval(logica, velocidad)

var insercion = false;

function logica() {
  if(jugadores.length == 1){
    console.log('partida terminada. Gano: '+jugadores[0].socket.id)
    jugadores[0].socket.emit('ganaste', {msg: 'yay gane'})
    if(!insercion){//inserta en db los puntos nuevos, solo 1 vez
      jugadores[0].socket.emit('puntua', {puntos: jugadores[0].puntos})
      insercion = true;
      var q = 'UPDATE usuario SET puntaje='+jugadores[0].puntos+' WHERE id=1'
      bd.conectar()
      bd.query(q)
      bd.cerrar()
    }
  }
  else{
    insercion = false;//debido a nueva partida, se habilita la insercion de nuevos pntos
    for(jug of jugadores){//para cada vibora
      var jug_x = jug.snake[0].x, jug_y = jug.snake[0].y,
          jug_puntos = jug.puntos;
      switch (jug.direccion) {
        case 0:jug_y--;break//arriba
        case 1:jug_x--;break//izquierda
        case 2:jug_y++;break//abajo
        case 3:jug_x++;break//derecha
      }

      var res = atraviesa_muro(jug_x, jug_y, true)
      jug_x = res.x; jug_y = res.y

      var posiciones = lista_posiciones_enemigas(jug)
      colision_enemigo(jug, posiciones)
      colision_propia(jug)

      var ptoss = avanzar_jugador(jug_x, jug_y, jug)
      // CLIENTE
      jug.socket.emit('actualiza_snake', {snake:jug.snake, puntos: ptoss})//dibuja cliente
      jug.socket.emit('actualiza_comida',{x:comida.x, y:comida.y})//manda pos comida
      jug.socket.emit('actualiza_enemigos', {pos: posiciones})//manda pos enemigos
    }
  }
}
// [Funciones] -----------------------------------------------------------------------
function quita_jugador(id){
  for(jj of jugadores)//busca el jugador que se desconecto mediante el id del socket
    if (jj.socket.id == id){
      var rem = jj//jugador encontrado
      break
    }
    jugadores.splice( jugadores.indexOf(rem), 1)//quita al jugador
}
function lista_posiciones_enemigas(jugador_actual){
  var posiciones = []//lista posiciones enemigas
  for(j of jugadores){//para cada jugador activo
    if(j != jugador_actual){//si no es jugador actual
      for(p of j.snake){//para cada parte del jugador j
        posiciones.push({x:p.x, y:p.y})//enlista posicion de parte
      }
    }
  }
  return posiciones
}
function avanzar_jugador(jug_x, jug_y, jugador){
  if(jug_x == comida.x && jug_y == comida.y) {//Aumenta longitud
    var cola = {x: jug_x, y: jug_y}
    comida.x = parseInt(1+Math.random()*30)
    comida.y = parseInt(1+Math.random()*30)
    //puntos
    jugador.puntos++;

  } else {//Recorre (avanza)
    var cola = jug.snake.pop()
    cola.x = jug_x
    cola.y = jug_y
  }
  jug.snake.unshift(cola)//agrega o quita parte
  return jugador.puntos;
}
function atraviesa_muro(jug_x, jug_y, atraviesa){
  if(jug_x <= 0)          jug_x = cuadros_w-1
  if(jug_x >= cuadros_w)  jug_x = 1
  if(jug_y <= 0)          jug_y = cuadros_h-1
  if(jug_y >= cuadros_h)  jug_y = 1
  return {x:jug_x, y:jug_y}
}
function colision_enemigo(jug, posiciones){
  for(parte of posiciones){//verificar colision con enemigo
    if(jug.snake[0].x == parte.x && jug.snake[0].y == parte.y){
      jug.socket.disconnect()//perder
      break
    }
  }
}
function colision_propia(jug){
  var ban = false
  for(parte of jug.snake){//verificar colision con sigo
    if(jug.snake[0].x == parte.x && jug.snake[0].y == parte.y && parte != jug.snake[0]){
      ban = true
      break
    }
  }
  if(ban)
    jug.socket.disconnect()//perder
}
