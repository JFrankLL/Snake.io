/*$('body').hammer().on('swipe',function(e){
  var direction = e.gesture.direction;
  $('#arrow').attr('class', direction);
  $('#arrow').replaceWith($('#arrow'));
});////animazione
$('body').on('touchmove', function(e){
  return false;
})*/


//CELULAR
var myElement = document.getElementById('snake_canvas');
var mc = new Hammer(myElement);
mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
mc.on("swipeleft", function(ev) {
    console.log('izquierda');
    m_a();
});
mc.on("swiperight", function(ev) {
    console.log('derecha');
    m_d();
});
mc.on("swipeup", function(ev) {
    console.log('arriba');
    m_w();
});
mc.on("swipedown", function(ev) {
    console.log('abajo');
    m_s();
});
///
