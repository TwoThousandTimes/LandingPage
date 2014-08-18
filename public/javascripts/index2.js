$(function() {

    var success = 'Success! Your username has been reserved. Confirmation has been sent to ';
	// Handle the form submition
    $('.email-form').submit(function(event) {
        event.preventDefault();
        var $form = $(this);
        
        $.ajax({
            type: "POST",
            url: '/process/username',
            data: $form.serialize(),
            success: function(data, textStatus, xhr) {
                if (data.error) {
                    $('.error-message').html(data.error).removeClass('hidden');
                    $form.find('input').addClass('error');
                } else {
                    // Success, display sharing options and success screen                   
                    $('.error-message').html(success + "'" + $form.find('input.email-input').val() + "'");
                    $form.fadeOut(function() {
                        $('.social-container').removeClass('hidden');
                        $('.error-message').removeClass('hidden');
                    });
                    $('.error-message').addClass('success');
                    ga('send', 'pageview', 'success');
                }
            },
            error: function() {

            }
        });
    });

    // Remove the error class (if any) when the user input changes. Also remove any error messages.
    $('input').change(function() {
        clear_error($(this).parent('form'));
    });
});

function clear_error(form) {
    console.log('clear error');
	form.find('input').removeClass('error');
	$('.error-message').html('').addClass('hidden');
}