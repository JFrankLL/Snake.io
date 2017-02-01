var conexion,
    logeado;
module.exports = {
  query: function(query) {
    conexion.query(query, function (error, results){
      if(error)
        throw error;
      else{
        console.log(results[0]);
        //setV(results[0])
      }
    });
  },
  cerrar: function() {
    conexion.end();
  },
  conectar: function(){
    var mysql = require('mysql');
    conexion = mysql.createConnection({
      host : "localhost",
      user : "root",
      password : "",
      database : "base_snake"
    })
    return conexion
  },
  logea: function(quien, pss){
    var peticion = 'SELECT * FROM usuario WHERE username=\"'+quien+'\"'
    logeado = module.exports.conectar().query(peticion, function (error, results){
      if(error){
        return false
        throw error;
      }
      else{//query OK
        logeado = results[0].username == quien && results[0].password==pss
        console.log(logeado+' en expor loge')
        return logeado
      }
    })
    console.log(logeado[1]+' en fuer expor loge')
    return logeado
  }
}
