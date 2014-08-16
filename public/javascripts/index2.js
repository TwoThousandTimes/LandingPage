$(function() {
	// Handle the form submition
        $('.email-form').submit(function(event) {
            event.preventDefault();
            var $form = $(this);
            if( $form.find('.error-message') ) {
                clear_error($form);
            }
            $.ajax({
                type: "POST",
                url: '/process/username',
                data: $form.serialize(),
                success: function(data, textStatus, xhr) {
                    if (data.error) {
                        $form.find('.error-message').css('display','block').html(data.error).fadeIn();
                        $form.find('input').addClass('error');
                    } else {
                        // TODO: display some sort of success screen??
                        $('a.thanks').click();
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
	form.find('input').removeClass('error');
	form.find('.error-message').css('display','none').fadeOut();
}