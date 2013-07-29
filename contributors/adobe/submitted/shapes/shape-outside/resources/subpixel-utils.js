var SubPixelLayout = (function() {
    var SUBPIXELS_PER_PIXEL = 64;
    var enabled = undefined;

    function isEnabled()
    {
        if (enabled === undefined) {
            var elem = document.createElement('div');
            elem.style.setProperty('width', '4.5px');
            document.body.appendChild(elem);
            var bounds = elem.getBoundingClientRect();
            enabled = (bounds.width != Math.floor(bounds.width));
            document.body.removeChild(elem);
        }
        return enabled;
    }

    return {
        isEnabled: isEnabled,
        snapToLayoutUnit: function(f) {
            return isEnabled() ? Math.floor(f * SUBPIXELS_FOR_PIXEL) / SUBPIXELS_FOR_PIXEL : Math.floor(f); // as in LayoutUnit(f).toFloat()
        },
        ceilSnapToLayoutUnit: function(f) {
            return isEnabled() ? Math.ceil(f * SUBPIXELS_FOR_PIXEL) / SUBPIXELS_FOR_PIXEL : Math.ceil(f); // see ceiledLayoutUnit(), LayoutUnit.h
        }
    }
}());
