$(function() {

    // Line Animations (right after "Almost Nothing Captivates Us Like Telling a Story")

    var canvasId = "canvas";
    var animationSpeed = 4000;
    var pathColor = "#fff";
    var topLineWidth = 20;

    animateLines = function(canvas, colorNumber, pathString1, pathString2) {
        
        var line1 = canvas.path(pathString1).attr({
            stroke: colorNumber
        });

        var line2 = canvas.path(pathString2).attr({
            stroke: colorNumber
        });
        
        var length = line1.getTotalLength();

        $('path[fill*="none"]').animate({
            'to': 1
        }, {
            duration: animationSpeed,
            easing:"easeInOutCubic",
            step: function(pos, fx) {
                var offset = length * fx.pos;
                var subpath1 = line1.getSubpath(0, offset);
                var subpath2 = line2.getSubpath(0, offset);
                canvas.clear();
                canvas.path(subpath1).attr({
                    stroke: colorNumber
                });
                canvas.path(subpath2).attr({
                    stroke: colorNumber
                });
            },
        });
    };

    var canvas = Raphael(canvasId, "100%", "100%");

    var containerWidth = $('#' + canvasId).width();
    var containerHeight = $('#' + canvasId).height();
    var widthMid = containerWidth / 2;

    /*      
            -------
               |
               |
               |
    __________/ \__________
    */

    var pathStringLeft = "M" + widthMid + ",0h-" + topLineWidth + "M" + widthMid + ",0v" + (containerHeight - 50) + "C" + widthMid + "," + containerHeight + " " + widthMid + "," + containerHeight + " " + (widthMid - 50) + "," + containerHeight + "H0";
    var pathStringRight = "M" + widthMid + ",0h" + topLineWidth + "M" + widthMid + ",0v" + (containerHeight - 50) + "C" + widthMid + "," + containerHeight + " " + widthMid + "," + containerHeight + " " + (widthMid + 50) + "," + containerHeight + "H" + containerWidth;
    
    var pathStringArc1 = "M80,0h20M100,0V150   C100,200 100,200 50,200h-50";
    var pathStringArc2 = "M120,0h-20M100,0V150C100,200 100,200 150,200h50";





    var hasAnimated = false;

    var s = skrollr.init({
        keyframe: function(element, name, direction) {
            //name will be one of data500, dataTopBottom, data_offsetCenter

            if (element.id === 'canvas-wrapper' && name === 'dataBottomCenter' && !hasAnimated) {
                hasAnimated = true;
                animateLines(canvas, pathColor, pathStringLeft, pathStringRight);
            }
        }
    });

});