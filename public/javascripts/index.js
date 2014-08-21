
$(function() {
    var titleAnimationComplete = false;

    $(document).ready(function() {

        footerHidden = false;
        // Setup the skrollr
        var s = skrollr.init({
            forceHeight: false,            
            keyframe: function(element, name, direction) {
                //name will be one of data500, dataTopBottom, data_offsetCenter
                
                if (element.id === 'canvas-wrapper' && name === 'dataBottomCenter' && !hasAnimated) {
                    hasAnimated = true;
                    animateLines(canvas, pathColor, calculateLines() );
                    console.log('animating');                    
                }

                if (name === 'data-100Bottom') {
                    $('.footer').stop().animate({
                                    opacity: 1
                                }, 200, 'swing', false);
                }

                if ( element.id === 'final-section') {
                    $('.footer').stop().animate({
                                    opacity: 0
                                }, 200, 'swing', false);
                }

            }
        });

		var once = 1;

        var windowResize = function() {
            // Set the video and final section heights
            var footerHeight = $('.footer').height();
            var windowHeight = $(window).height();
            $('.title-container').height( windowHeight - footerHeight );
            
            if(once) {
            	once = false;
            	c_height = $('#canvas').height();
            	c_width = $('#canvas').width();
            } else {
            	new_width = $('#canvas').width();
                new_height = $('#canvas').height();//Math.floor(new_width * c_height / c_width);
                canvas.clear();
                canvas.setSize(new_width, new_height);
                var resizedLines = calculateLines();
                resizedLines.forEach( function ( line ) {
                    canvas.path( line ).attr({
                        stroke: pathColor,
                        'stroke-width': pathStrokeWidth
                    })
                });
                console.log(new_height+' : '+new_width);
            }
            
            s.refresh();
            
            
        };

        windowResize();
        $(window).resize(windowResize);

        // TODO: start the loading animation
        
        // TODO: scroll link
        $(function() {
		  $('a[href*=#]:not([href=#])').click(function() {
			if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
			  var target = $(this.hash);
			  target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
			  if (target.length) {
				$('html,body').animate({
				  scrollTop: target.offset().top
				}, 1000);
				return false;
			  }
			}
		  });
		});


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
                        // Display the confirmation screen with social media share links
                        $('a.thanks').click();
                        $('.footer').fadeOut();
                        $('#reserveModal').on('hide.bs.modal', function (e) {
                            $('.footer').fadeIn();
                        });
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
            form.find('input').removeClass('error');
            form.find('.error-message').css('display','none').fadeOut();
    }

    var titleAnimationSpeed = 100; 
    var elements = $('.title-container h1 span');
    function fadeSpanIn ( index ) {
        if (index < elements.length) {
            $(elements[index]).fadeTo(titleAnimationSpeed, 1, function() {
                fadeSpanIn( index + 1);
            });
        } else {
            $('.loading-container, .learn-more').fadeIn('slow');
            console.log('finished');
            titleAnimationComplete = true;
        }
    }
    fadeSpanIn(0);

    // Fetch the landing page video!
    var getSupportedVideo = function () {
        if (window.Modernizr.video.h264) return 'mp4';
        if (window.Modernizr.video.webm) return 'webm';
        if (window.Modernizr.video.ogg) return 'ogg';
        return undefined;
    };
    var videoType = getSupportedVideo();
    console.log(videoType);

    var loadFirstVideo = function ( videoType, callback ) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', window.cdn + '/images/video/intro.' + videoType, true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
            if (this.status == 200) {
                console.log("got first video");            

                var myBlob = this.response;
                var vid = (window.webkitURL ? webkitURL : URL).createObjectURL(myBlob);
                // myBlob is now the blob that the object URL pointed to.
                var video = document.getElementById("bgvid");
                video.src = vid;
                // DONT PLAY VIDEO UNTIL LOADING ANIMATION COMPLETE!
                var timer = setInterval(function() {
                    if (titleAnimationComplete) {
                        callback();
                        video.play();
                        $(video).fadeIn('slow');
                        
                        $('#bgvid').bind('ended', function() {
                            console.log('first video ended!');
                            $(this).fadeOut('fast');
                            $('#bgvid2').show();
                        });
                        window.clearInterval(timer);
                    }
                }, 250);
            }
        }
        xhr.send();
    };

    var loadSecondVideo = function ( videoType ) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', window.cdn + '/images/video/loop.' + videoType, true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
            if (this.status == 200) {
                console.log("got second video");

                var myBlob = this.response;
                var vid = (window.webkitURL ? webkitURL : URL).createObjectURL(myBlob);
                // myBlob is now the blob that the object URL pointed to.
                var video = document.getElementById("bgvid2");
                video.src = vid;
                // TODO: stop the loading animation!
                video.play();


                

            }
        }
        xhr.send();
    };

    if (videoType) {
        loadFirstVideo( videoType, function() {
            // After first video is done loading, load the second video for loop...
            loadSecondVideo( videoType );
        });
    }


    // ========================== LINE ANIMATION STUFF ===================================
    // Line Animations (right after "Almost Nothing Captivates Us Like Telling a Story")

    var canvasId = "canvas";
    var animationTime = 3000;
    // Assume animation is counting down from 'animationTime' towards 0ms. Raising the trigger's below will make the
    // animations happen sooner. Triggers must be 0 < trigger < animationTime 
    var triggerTopRight = 2000; 
    var triggerBottomRight = 1500;
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

    var hasAnimated = false;

    var calculateLines = function() {
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

        return [pathStringLeft, pathStringRight, pathStringTopLeft, pathStringTopRight];
    };

});

