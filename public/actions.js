$(function() {
	$("form.call-it").submit(function (ev) {
		const data = {};
		$("form.call-it input, form.call-it textarea").get().reduce((obj, el) => {
			const name = $(el).attr('name');
			obj[name] = $(el).val();
			return obj;
		}, data);
		
		const cloud = $("form.call-it button .cloud");
		
		new Promise((ok, fail) => {
			$.post("", data, ok)
			 .fail(fail);
			 
			cloud.text("cloud_upload");
			$('#call-confirm').prop('checked', false);
		}).then(r => {
			cloud.text("cloud_done");
			return r;
		}).catch(e => {
			cloud.text("cloud_off").attr('title', e.statusText);
		}).then(() => setTimeout(() => cloud.text('cloud_queue'), 5000))
		return false;
	})
})