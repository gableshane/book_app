'use strict';

$('.selector').on('click', function(){
  $('.hideForm').attr('type', 'text');
  $('#submit').attr('type', 'submit');
  $('#selector').text('deselect');
  $('#selector').attr('id', 'deselector');
});

$('#editDetail').on('click', function(){
  $('.hideForm').attr('type', 'text');
  $('#submitEdit').attr('type', 'submit');
});
