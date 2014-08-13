
$(function() {

    $(document).ready(function() {


        // Setup the skrollr
        var s = skrollr.init({
            forceHeight: false,
            keyframe: function(element, name, direction) {
                //name will be one of data500, dataTopBottom, data_offsetCenter

                if (element.id === 'canvas-wrapper' && name === 'dataBottomCenter' && !hasAnimated) {
                    hasAnimated = true;
                    animateLines(canvas, pathColor, [pathStringLeft, pathStringRight, pathStringTopLeft, pathStringTopRight, pathStringTopLeft, pathStringTopRight]);

                }
            }
        });

		var once = 1;

        var windowResize = function() {
            // Set the video and final section heights
            var footerHeight = $('.footer').height();
            var windowHeight = $(window).height();
            $('#bgvid, .title-container, .final-section').height( windowHeight - footerHeight );
            
            if(once) {
            	once = false;
            	
            	c_height = $('#canvas').height();
            	c_width = $('#canvas').width();
            } else {
            	new_height = $('#canvas').height();
            	new_width = c_width * new_height / c_height;
            	console.log('resize');
            	$('#canvas svg').width(new_width);
            	$('#canvas svg').height(new_height);
            }
            
            s.refresh();
            
            
        };

        windowResize();
        $(window).resize(windowResize);

        // TODO: start the loading animation


        // Handle the form submition
        $('.email-form').submit(function() {
            event.preventDefault();
            var $form = $(this);
            $.ajax({
                type: "POST",
                url: '/process/username',
                data: $form.serialize(),
                success: function(data, textStatus, xhr) {
                    if (data.error) {
                        $form.find('.error-message').html(data.error);
                        $form.find('input').addClass('error');
                    } else {
                        // TODO: display some sort of success screen??

                    }
                },
                error: function() {

                }
            });
        });

        // Remove the error class (if any) when the user input changes. Also remove any error messages.
        $('input').change(function() {
            $(this).removeClass('error');
            $('.error-message').html('');
        });


    });

    // Fetch the landing page video!
    var getSupportedVideo = function () {
        if (window.Modernizr.video.ogg) return 'ogg';
        if (window.Modernizr.video.h264) return 'mp4';
        if (window.Modernizr.video.webm) return 'webm';
    };
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/images/B&W_pics_export._v2.mov', true);
    xhr.responseType = 'blob';
    xhr.onload = function(e) {
        if (this.status == 200) {
            console.log("got it");            

            var myBlob = this.response;
            var vid = (window.webkitURL ? webkitURL : URL).createObjectURL(myBlob);
            // myBlob is now the blob that the object URL pointed to.
            var video = document.getElementById("bgvid");
            video.src = vid;
            // TODO: stop the loading animation!
            video.play();
        }
    }
    xhr.send();





    // ========================== LINE ANIMATION STUFF ===================================
    // Line Animations (right after "Almost Nothing Captivates Us Like Telling a Story")

    var canvasId = "canvas";
    var animationTime = 3000;
    // Assume animation is counting down from 'animationTime' towards 0ms. Raising the trigger's below will make the
    // animations happen sooner. Triggers must be 0 < trigger < animationTime 
    var triggerTopRight = 3000; 
    var topRightAnimationSpeed = 1000;
    var triggerBottomRight = 3000;
    var triggerTopLeft = 3000;
    var triggerBottomLeft = 2500;

    var pathColor = "#fff";
    var pathStrokeWidth = 3;
    var topLineWidth = 100;
    var distanceBetweenTopHorizontalLines =175;
    var arcSize = 100;

    animateLines = function(canvas, colorNumber, paths) {
        
        var lines = [];
        paths.forEach( function (path) {
            lines.push(
                canvas.path(path).attr({
                    stroke: colorNumber,
                    'stroke-width': pathStrokeWidth
                })
            );
        });
        // WARNING! assumes lines[0] is the longest length path.
        var length = lines[0].getTotalLength();
        var hasAnimatedTopRight = false;
        var hasAnimatedBottomRight = false;
        var hasAnimatedBottomLeft = false;
        var hasAnimatedTopLeft = false;

        $('path[fill*="none"]').animate({
            'to': 1
        }, {
            duration: animationTime,
            easing:"easeInOutQuad",
            step: function(pos, fx) {
                var offset = length * fx.pos;
                var subpaths = [];
                lines.forEach( function (line) {
                    subpaths.push( line.getSubpath(0, offset) );
                });
                canvas.clear();
                subpaths.forEach( function( subpath ) {
                    canvas.path(subpath).attr({
                        stroke: colorNumber,
                        'stroke-width': pathStrokeWidth
                    });
                });
            },
            progress: function(animation, progress, remainingMs) {
                if (!hasAnimatedTopRight && remainingMs < triggerTopRight) {
                    $('.story-top-right').fadeIn(100);
                    $('.story-top-right-inner').css({marginLeft: 0});
                    hasAnimatedTopRight = true;
                    console.log('animate');
                }
                if (!hasAnimatedBottomRight && remainingMs < triggerBottomRight) {
                    $('.story-bottom-right').fadeIn('slow');
                }
                if (!hasAnimatedBottomLeft && remainingMs < triggerBottomLeft) {
                    $('.story-bottom-left').fadeIn();
                    $('.story-bottom-left .energy');
                }
                if (!hasAnimatedTopLeft && remainingMs < triggerTopLeft) {
                    $('.story-top-left').fadeIn();
                }
            }
        });
    };

    var canvas = Raphael(canvasId);

    var containerWidth = $('#' + canvasId).width();
    var containerHeight = $('#' + canvasId).height();
    var widthMid = containerWidth / 2;

    /*      
            -------
                    120px height
            -------
               |
               |
               |
    __________/ \__________
    */

    var pathStringLeft = "M" + widthMid + "," + distanceBetweenTopHorizontalLines + "h-" + topLineWidth + "M" + widthMid + "," + distanceBetweenTopHorizontalLines + "v" + (containerHeight - arcSize - distanceBetweenTopHorizontalLines) + "C" + widthMid + "," + containerHeight + " " + widthMid + "," + containerHeight + " " + (widthMid - arcSize) + "," + containerHeight + "H0";
    var pathStringRight = "M" + widthMid + "," + distanceBetweenTopHorizontalLines + "h" + topLineWidth + "M" + widthMid + "," + distanceBetweenTopHorizontalLines + "v" + (containerHeight - arcSize - distanceBetweenTopHorizontalLines) + "C" + widthMid + "," + containerHeight + " " + widthMid + "," + containerHeight + " " + (widthMid + arcSize) + "," + containerHeight + "H" + containerWidth;
    var pathStringTopLeft = "M" + widthMid + ",0h-" + topLineWidth;
    var pathStringTopRight = "M" + widthMid + ",0h" + topLineWidth;

    var hasAnimated = false;

});

