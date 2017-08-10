$('#bugReportButton').prop('disabled', true);
$('#bugReport, #aboutBugReport').hide();
var email_validate = msg_validate = subj_validate = false;
var email_regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
$('#email').on('blur', function(){
	if($('#email').val().match(email_regex)){
		email_validate = true;
		$('#email').removeClass('invalidElement').addClass('validElement');
		$('#emailErrorMsg').html('');
	} else {
		email_validate = false;
		$('#email').removeClass('validElement').addClass('invalidElement');
		$('#emailErrorMsg').html('Please provide a properly formatted email address');
	}
	enabledBugButton(email_validate, msg_validate, subj_validate);
});
$('#subject').on('blur', function(){
	if($('#subject').val().length > 5 && $('#subject').val().length < 100){
		subj_validate = true;
		$('#subject').removeClass('invalidElement').addClass('validElement');
		$('#subjectErrorMsg').html('');
	} else {
		subj_validate = false;
		$('#subject').removeClass('validElement').addClass('invalidElement');
		$('#subjectErrorMsg').html('Your subject line must be between 5 and 100 characters');
	}
	enabledBugButton(email_validate, msg_validate, subj_validate);
});
$('#message').on('blur', function(){
	if($('#message').val().length > 5 && $('#message').val().length < 1000){
		msg_validate = true;
		$('#message').removeClass('invalidElement').addClass('validElement');
		$('#messageErrorMsg').html('');
	} else {
		msg_validate = false;
		$('#message').removeClass('validElement').addClass('invalidElement');
		$('#messageErrorMsg').html('The body of your message must be between 5 and 1000 characters');
	}
	enabledBugButton(email_validate, msg_validate, subj_validate);
});

$('#bugFormToggle').on('click', function(e){
	e.preventDefault();
	$('#bugReport, #aboutBugReport').toggle();
});