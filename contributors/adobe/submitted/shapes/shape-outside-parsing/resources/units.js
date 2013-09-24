var positiveNumbers = [
function(i) { return '' + i },
function(i) { return '+' + i },
function(i) { return '.' + i },
function(i) { return '+.' + i },
function(i) { return i + '.' + i },
function(i) { return '+' + i + '.' + i }
]

var negativeNumbers = [
function(i) { return '-' + i },
function(i) { return '-.' + i },
function(i) { return '-' + i + '.' + i },
]

var relativeUnits = [
'em',
'ex',
'ch',
'rem',
'vw',
'vh',
'vmin',
'vmax'
]

var fixedUnits = [
'cm',
'mm',
'in',
'px',
'pt',
'pc'
]

var percentageUnits = [
'%'
]

var units = relativeUnits.concat(fixedUnits, percentageUnits);

function checkInlineStyle(property, shape, min, max, check) {
    var div = document.createElement('div');
    positiveNumbers.forEach(function(number) {
        units.forEach(function(unit) {
            for (var i = -1; i < max - min; i++) {
                var args = Array.apply(null, new Array(i + min + 1));
                args = args.map(function(arg, index) {
                    if (i === -1) return '0';
                    return number(index + 1) + unit;
                });
                var value = shape + '(' + args.join(',') + ')';
                div.style.removeProperty(property);
                div.style.setProperty(property, value);
                check(div.style.getPropertyValue(property), value);
            }
        });
    });
}