$('#tagModal').on('show.bs.modal', function (event) {
	// Button that triggered the modal
	var button = $(event.relatedTarget);
	// Extract info from data-* attributes
	var tagee = button.data('tagee');
	var tageeName = button.data('tageename');
	var modal = $(this);
	modal.find('.modal-body form').attr('action', '/tag/' + tagee);
	modal.find('.modal-body input').val(tageeName);
	modal.find('.modal-body input').first().val(tagee);
});