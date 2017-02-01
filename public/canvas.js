var tam=16, a=0,//cuadro, separacion
    snake = [], snake_color,//jugador y color
    comida_x, comida_y,//pos comida
    pos_enemigos = []//pos enemigos (sombras)

var config = localStorage.getItem('configuration')
config = JSON.parse(config)

// [Dibuja] ------------------------------------------
var d_mapa = function(){
  var aux;
  if(config!=null){
    aux = config['colorFondo']
    //console.log(config['colorFondo'])
  }else
    aux = '#08F'
  $('canvas').drawRect({
    //fillStyle: '#08F',
    fillStyle: aux,
    x:400, y:400,
    width:800, height:800
  });
}
var d_parte = function(x, y, color){
  $('canvas').drawRect({
    fillStyle: color,
    x: x*(tam+a), y: y*(tam+a),
    width: tam, height: tam
  });
}
var d_comida = function(x, y){
  $('canvas').drawArc({
    fillStyle: '#ffc3a0',
    x: x*(tam+a), y: y*(tam+a),
    radius: tam/2
  });
}


// [Conexion] --------------------------------------
//var socket = io.connect('http://localhost:3000')
var socket = io.connect('http://192.168.0.106:3000')
var m_w = function(){socket.emit('mover_w')},
    m_a = function(){socket.emit('mover_a')},
    m_s = function(){socket.emit('mover_s')},
    m_d = function(){socket.emit('mover_d')},
    fondo_rojo = function(){
      var data = {
        colorFondo: '#f12f2f',
        colorSnake: "#9b2b27",
        otro: 'lo que sea'
      },
      data = JSON.stringify(data)
      localStorage.setItem('configuration', data)
      var data = localStorage.getItem('configuration')
          data = JSON.parse(data)
      console.log(data)
    }
    fondo_azul = function(){
      var data = {
        colorFondo: '#08F',
        colorSnake: "#0071D7",
        otro: 'lo que sea'
      },
      data = JSON.stringify(data)
      localStorage.setItem('configuration', data)
      var data = localStorage.getItem('configuration')
          data = JSON.parse(data)
      console.log(data)
    }
    fondo_verde = function(){
      var data = {
        colorFondo: '#84e269',
        colorSnake: "#4f7e49",
        otro: 'lo que sea'
      },
      data = JSON.stringify(data)
      localStorage.setItem('configuration', data)
      var data = localStorage.getItem('configuration')
          data = JSON.parse(data)
      console.log(data)
    }

    //var conecta = function(){socket.socket.connect('http://localhost:3000')}
    var conecta = function(){socket.socket.connect('http://192.168.0.106:3000')}

socket.on('stat', function(data) {
  console.log(data.msg);//imprime conexion efectuada o no
  if(data.con ==  false){
    var elem = document.getElementById("juego_id");
    elem.style.visibility = "hidden";
    var mensaje = document.getElementById("mensaje_log");
    mensaje.style.visibility = "visible"
  }
})
socket.on('snake_color', function(data) {
  snake_color = data.color
})
socket.on('dibuja', function(data) {
  dibuja()
})
socket.on('actualiza_snake', function(data) {
  snake = data.snake
  console.log('ptos: '+data.puntos)
})
socket.on('actualiza_comida', function(data) {
  comida_x = data.x; comida_y = data.y
})
socket.on('actualiza_enemigos', function(data) {
  pos_enemigos = data.pos
})
socket.on('ganaste', function(data) {
  //pos_enemigos = data.pos
  console.log(data.msg)
})
socket.on('puntua', function(data) {
  //pos_enemigos = data.pos
  console.log('Actualizar bd')



})
////////////
function dibuja(){
  d_mapa()//limpia
  d_snake(snake, snake_color)//dibuja jugador
  for(pos of pos_enemigos)//dibuja enemigos (sombras)
    if(config!=null)
      d_parte(pos.x, pos.y, config['colorSnake'])
    else
      d_parte(pos.x, pos.y, '#0071D7')
  d_comida(comida_x, comida_y)//comida
}
window.addEventListener("keydown", tecla, false);
function tecla(e) {
  switch(e.keyCode) {
    case 65:socket.emit('mover_a');break
    case 87:socket.emit('mover_w');break
    case 68:socket.emit('mover_d');break
    case 83:socket.emit('mover_s');break
    case 81:socket.disconnect();break//'Q'
  }
}
function d_snake(snake, color){
  for(parte of snake){//cada parte
    if(parte.x%2==0 && parte.y%2==0)
      d_parte(parte.x, parte.y, color)
    else if(parte.x%2==0 && parte.y%2!=0)
      d_parte(parte.x, parte.y, '#AAA')
    else if(parte.x%2!=0 && parte.y%2!=0)
      d_parte(parte.x, parte.y, color)
    else if(parte.x%2!=0 && parte.y%2==0)
      d_parte(parte.x, parte.y, '#AAA')
  }
}
///////////////////////////////
var main = setInterval(dibuja, 30)
