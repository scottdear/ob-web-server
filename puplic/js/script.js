$(document).ready(function(){
    $('.pass_show').append('<span class="ptxt">Show</span>');  
});
    
$(document).on('click','.pass_show .ptxt', function(){     
    $(this).text($(this).text() == "Show" ? "Hide" : "Show"); 
    $(this).prev().attr('type', function(index, attr){return attr == 'password' ? 'text' : 'password'; }); 
});  

$().ready(function(){
	$('#myform').validate({
		rules: {
			password: {
				required: true,
				pattern: /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/
			},
			confirm_password: {
				required: true,
				equalTo: "#password"
			}
		}, 
		messages: {
			password: {
				required: 'The New Password is required',
				pattern: 'Password must have at least 8 characters, contains non-alphanumeric symbols, contains uppercase letters, lowercase letters and numbers' 
			},
			confirm_password: {
				required: 'The Confirm Password is required'
			}
		},
		errorPlacement: function(error, element) {
			error.appendTo('#errordiv');
		}
	})

	$("#myform").on('keyup blur', function(){
		if($("#myform").valid()) {
			$("#resetBtn").prop('disabled', false);
		} else {
			$("#resetBtn").prop('disabled', 'disabled');
		}
	})
})