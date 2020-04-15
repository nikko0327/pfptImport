$(document).ready(function(){
  $('a.edit').click(function (e) {
      e.preventDefault();
      const tr = $(this).closest('tr')
      const modal = $('#alphaModalEdit');
      // make AJAX call passing the ID
      //$.getJSON("/appliance/" + tr.data('id') + "/edit", function (data) {
          // set values in modal
          // modal.find('form').attr('action', '/appliance/' + tr.data('id') + '/edit');
          modal.find('#applianceIpA').val(tr.data('ip'));
          modal.find('#currentA').val(tr.data('current'));
          modal.find('#previousA').val(tr.data('previous'));
          modal.find('#applianceVersionA').val(tr.data('version'));
          // open modal
          console.log("Data from jquery: " + tr.data('id'))
          modal.modal('show');
      // });
  });

  // const tr = $(this).closest('tr')
  // const modal = $('#alphaModalEdit');
  // const id = modal.find('#applianceIpA').val(tr.data('id'));
  // alert(id)
  // document.getElementById('editSubmit').action = 'somethingelse';
});
