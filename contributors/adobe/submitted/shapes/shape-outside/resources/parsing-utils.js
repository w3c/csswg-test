var ParsingUtils = (function() {
function testInlineStyle(value, expected) {
    var div = document.createElement('div');
    div.style.setProperty('shape-outside', value);
    var actual = div.style.getPropertyValue('shape-outside');
    assert_equals(actual, expected);
}

function testComputedStyle(value, expected) {
    var div = document.createElement('div');
    div.style.setProperty('shape-outside', value);
    document.body.appendChild(div);
    var style = getComputedStyle(div);
    var actual = style.getPropertyValue('shape-outside');
    document.body.removeChild(div);
    assert_equals(actual, typeof expected !== 'undefined' ? expected : value);
}

function valuesAsTests(values, type) {
    var result = [];
    values.forEach(function(value) {

        // Base test case: [test name, test value]
        var testCase = Array.apply(null, Array(2)).map(String.prototype.valueOf, value);

        if(type == "invalid")
            // Invalid expected result is null
            testCase.push(null);
        else
            // Valid expected result is the value
            testCase.push(value)

       result.push(testCase);
    });
    return result;
}

function arraysAsTests(testArrays, actualIdx) {

    var result = [];
    testArrays.forEach(function(testArray) {

        if(testArray.length == 1)
            result.push(Array.apply(null, Array(2)).map(String.prototype.valueOf, testArray[0]));
        else if(testArray.length == 2) {
            testValue = testArray[actualIdx];
            if(actualIdx == 0)
                // use the test case as the test name
                testArray.unshift(testValue);
            else
                // otherwise, assume the expected is the actual
                testArray.push(testValue);

            result.push(testArray)
        }
        else
            result.push(testArray);
    });
    return result;
}

function buildEllipsoidTests(shape, type, unit1, unit2) {
    var result = [], testPositions;

    if(type == "invalid")
        testPositions = valuesAsTests(invalidPositions, "invalid");
    else
        testPositions = arraysAsTests(validPositions, 0);

    testPositions.forEach(function(test) {
        var testValue =  shape + '(at ' + setUnit(test[0], unit1, unit2) + ')';
        testCase = Array.apply(null, Array(2)).map(String.prototype.valueOf, testValue);

        if(test[2])
            testCase.push(shape + '(at ' + setUnit(test[2], unit1, unit2) + ')');
        else
            testCase.push(null);

        result.push(testCase);
    });

    return result;
}

function buildInsetTests(unit1, unit2) {
    var results = new Array();
    if(Object.prototype.toString.call( unit1 ) === '[object Array]') {
        unit1.forEach(function(unit) {
            insetTests = buildInsetTests(unit, unit2);
            results = results.concat(insetTests);
        });
    } else {
        validInsets.forEach(function(test) {
            var testValue = 'inset(' + setUnit(test[1], unit1, unit2) +')';
            testCase = Array.apply(null, Array(2)).map(String.prototype.valueOf, testValue);
            testCase.unshift(setUnit(test[0], unit1, unit2));
            results.push(testCase);
        });
    }
    return unique(results);
}

function unique(tests) {
    var list = tests.concat();
    for(var i = 0; i< list.length; ++i) {
        for(var j = i+1; j < list.length; ++j) {
            if(list[i][0] === list[j][0])
                list.splice(j--, 1);
        }
    }
    return list;
}

function setUnit(str, unit1, unit2) {
    if(arguments.length == 2)
        return str.replace(new RegExp("u1", 'g'), unit1);
    else
        return str.replace(new RegExp("u1", 'g'), unit1).replace(new RegExp("u2", 'g'), unit2);
}

function generateInsetRoundCases(units) {
    var testUnit = units;
    var sizes = [
        '10' + units,
        '20' + units,
        '30' + units,
        '40' + units
    ];

    function insetRound(value) {
        return 'inset(10' +testUnit+ ' round ' + value + ')';
    }

    function serializedInsetRound(lhsValues, rhsValues) {
        if(!rhsValues)
            return 'inset(10' +testUnit+ ' round ' + lhsValues +')';
        else
            return 'inset(10' +testUnit+ ' round ' + lhsValues +' / '+ rhsValues +')';
    }

    var results = [], left, lhs, right, rhs;
    for (left = 1; left <= 4; left++) {
        lhs = sizes.slice(0, left).join(' ');
        results.push([insetRound(lhs), insetRound(lhs), serializedInsetRound(lhs, null)]);
        for (right = 1; right <= 4; right++) {
            rhs = sizes.slice(0, right).join(' ');
            if(lhs == rhs)
                results.push([insetRound(lhs + ' / ' + rhs), insetRound(lhs + ' / ' + rhs), serializedInsetRound(lhs, null)]);
            else
                results.push([insetRound(lhs + ' / ' + rhs), insetRound(lhs + ' / ' + rhs), serializedInsetRound(lhs, rhs)]);
        }
    }
    return results;
}


/// [actual, expected]
var validPositions = [

/// [ percent ], [ length ], [ percent | percent ], [ percent | length ], [ length | percent ], [ length | length ]
    ["50%", "50% 50%"],
    ["50u1", "50u1 50%"],
    ["50% 50%", "50% 50%"],
    ["50% 50u1", "50% 50u1"],
    ["50u1 50%", "50u1 50%"],
    ["50u1 50u1", "50u1 50u1"],

///// [ keyword ], [ keyword keyword ] x 5 keywords
    ["left", "0% 50%"],
    ["top", "50% 0%"],
    ["right", "100% 50%"],
    ["bottom", "50% 100%"],
    ["center", "50% 50%"],

    ["left top", "0% 0%"],
    ["left bottom", "0% 100%"],
    ["left center", "0% 50%"],

    ["top left", "0% 0%"],
    ["top right", "100% 0%"],
    ["top center", "50% 0%"],

    ["right top", "100% 0%"],
    ["right bottom", "100% 100%"],
    ["right center", "100% 50%"],

    ["bottom left", "0% 100%"],
    ["bottom right", "100% 100%"],
    ["bottom center", "50% 100%"],

    ["center top", "50% 0%"],
    ["center left", "0% 50%"],
    ["center right", "100% 50%"],
    ["center bottom", "50% 100%"],
    ["center center", "50% 50%"],

////// [ keyword | percent ], [ keyword | length ], [ percent | keyword ], [ length | keyword ] x 5 keywords
    ["left 50%", "0% 50%"],
    ["left 50u1", "0% 50u1"],

    ["50% top", "50% 0%"],
    ["50u1 top", "50u1 0%"],

    ["right 80%", "100% 80%"],
    ["right 80u1", "100% 80u1"],

    ["bottom 70%", "70% 100%"],
    ["bottom 70u1", "70u1 100%"],
    ["70% bottom", "70% 100%"],
    ["70u1 bottom", "70px 100%"],

    ["center 60%", "50% 60%"],
    ["center 60u1", "50% 60u1"],
    ["60% center", "60% 50%"],
    ["60u1 center", "60u1 50%"],

////// [ keyword | keyword percent ], [ keyword | keyword length ] x 5 keywords
    ["center top 50%", "50% 50%"],
    ["center top 50u1", "50% 50u1"],
    ["center left 50%", "50% 50%"],
    ["center left 50u1", "50u1 50%"],
    ["center right 70%", "30% 50%"],
    ["center right 70u1", "right 70u1 50%"],
    ["center bottom 70%", "50% 30%"],
    ["center bottom 70u1", "50% bottom 70u1"],

    ["left top 50%", "0% 50%"],
    ["left top 50u1", "0% 50u1"],
    ["left bottom 70%", "0% 30%"],
    ["left bottom 70u1", "0% bottom 70u1"],

    ["top left 50%", "50% 0%"],
    ["top left 50u1", "50u1 0%"],
    ["top right 70%", "30% 0%"],
    ["top right 70u1", "70u1 0%"],

    ["bottom left 50%", "50%, 100%"],
    ["bottom left 50u1", "50u1 100%"],
    ["bottom right 70%", "30% 100%"],
    ["bottom right 70u1", "right 70u1 100%"],

    ["right bottom 70%", "100% 30%"],
    ["right bottom 70u1", "100% bottom 70u1"],
    ["right top 50%", "100% 50%"],
    ["right top 50u1", "100% 50u1"],

////// [ keyword percent | keyword], [ keyword length | keyword ] x 5 keywords
    ["left 50% center", "50% 50%"],
    ["left 50u1 center", "50u1 50%"],
    ["left 50% top", "50% 0%"],
    ["left 50u1 top", "50u1 0%"],
    ["left 50% bottom", "50% 100%"],
    ["left 50u1 bottom", "50u1 100%"],

    ["top 50% center", "50% 50%"],
    ["top 50u1 center", "50% 50u1"],
    ["top 50% left", "0% 50%"],
    ["top 50u1 left", "0% 50u1"],
    ["top 50% right", "100% 50%"],
    ["top 50u1 right", "100% 50u1"],

    ["bottom 70% center", "50% 30%"],
    ["bottom 70u1 center", "50% bottom 70u1"],
    ["bottom 70% left", "0%, 30%"],
    ["bottom 70u1 left", "0% bottom 70u1"],
    ["bottom 70% right", "100% 30%"],
    ["bottom 70u1 right", "100% bottom 70u1"],

    ["right 80% center", "20% 50%"],
    ["right 80u1 center", "right 80u1 50%"],
    ["right 80% bottom", "20% 100%"],
    ["right 80u1 bottom", "right 80u1 100%"],
    ["right 80% top", "20% 0%"],
    ["right 80u1 top", "right 80u1 0%"],

////// [ keyword percent |  keyword percent], [ keyword percent |  keyword length],
////// [ keyword length | keyword length],  [ keyword length | keyword percent] x 5 keywords
    ["left 50% top 50%", "50% 50%"],
    ["left 50% top 50u1", "50% 50u1"],
    ["left 50% bottom 70%", "50% 30%"],
    ["left 50% bottom 70u1", "50% bottom 70u1"],
    ["left 50u1 top 50%", "50u1 50%"],
    ["left 50u1 top 50u1", "50u1 50u1"],
    ["left 50u1 bottom 70%", "50u1 30%"],
    ["left 50u1 bottom 70u1", "50u1 bottom 70u1"],


    ["top 50% left 50%", "50% 50%"],
    ["top 50% left 50u1", "50u1 50%"],
    ["top 50% right 80%", "20% 50%"],
    ["top 50% right 80u1", "right 80u1 50%"],
    ["top 50u1 left 50%", "50% 50u1"],
    ["top 50u1 left 50u1", "50u1 50u1"],
    ["top 50u1 right 80%", "20% 50u1"],
    ["top 50u1 right 80u1", "right 80u1 50u1"],

    ["bottom 70% left 50%", "50%, 30%"],
    ["bottom 70% left 50u1", "50u1 30%"],
    ["bottom 70% right 80%", "20% 30%"],
    ["bottom 70% right 80u1", "right 80u1 30%"],
    ["bottom 70u1 left 50%", "50%, bottom 70u1"],
    ["bottom 70u1 left 50u1", "50u1 bottom 70u1"],
    ["bottom 70u1 right 80%", "20% bottom 70u1"],
    ["bottom 70u1 right 80u1", "right 80u1 bottom 70u1"],

    ["right 80% top 50%", "20% 50%"],
    ["right 80% top 50u1", "20% 50u1"],
    ["right 80% bottom 70%", "20% 30%"],
    ["right 80% bottom 70u1", "20% bottom 70u1"],
    ["right 80u1 top 50%", "right 80u1 50%"],
    ["right 80u1 top 50u1", "right 80u1 50u1"],
    ["right 80u1 bottom 70%", "right 80u1 30%"],
    ["right 80u1 bottom 70u1", "right 80u1 bottom 70u1"],
];

var invalidPositions = [
////// [ keyword | percent ], [ keyword | length ], [ percent | keyword ], [ length | keyword ] x 5 keywords
    "50% left",
    "50u1 left",
    "top 50%",
    "80% right",
    "80u1 right",

//////  [ keyword | keyword percent ], [ keyword | keyword length ] x 5 keywords
    "center center 60%",
    "center center 60u1",

    "left center 60%",
    "left center 60u1",
    "left right 80%",
    "left right 80u1",
    "left left 50%",
    "left left 50u1",

    "top center 60%",
    "top center 60u1",
    "top bottom 80%",
    "top bottom 80u1",
    "top top 50%",
    "top top 50u1",

    "bottom center 60%",
    "bottom center 60u1",
    "bottom top 50%",
    "bottom top 50u1",
    "bottom bottom 50%",
    "bottom bottom 50u1",

    "right center 60%",
    "right center 60u1",
    "right left 50%",
    "right left 50u1",
    "right right 70%",
    "right right 70u1",

////// [ keyword percent | keyword], [ keyword length | keyword ] x 5 keywords
    "center 60% top",
    "center 60u1 top",
    "center 60% bottom",
    "center 60u1 bottom",
    "center 60% left",
    "center 60u1 left",
    "center 60% right",
    "center 60u1 right",
    "center 60% center",
    "center 60u1 center",

    "left 50% right",
    "left 50u1 right",
    "left 50% left",
    "left 50u1 left",

    "top 50% bottom",
    "top 50u1 bottom",
    "top 50% top",
    "top 50u1 top",

    "bottom 70% top",
    "bottom 70u1 top",
    "bottom 70% bottom",
    "bottom 70u1 bottom",

    "right 80% left",
    "right 80u1 left",

////// [ keyword percent |  keyword percent], [ keyword percent |  keyword length],
////// [ keyword length | keyword length],  [ keyword length | keyword percent] x 5 keywords
    "center 60% top 50%",
    "center 60% top 50u1",
    "center 60% bottom 70%",
    "center 60% bottom 70u1",
    "center 60% left 50%",
    "center 60% left 50u1",
    "center 60% right 70%",
    "center 60% right 70u1",
    "center 60% center 65%",
    "center 60% center 65u1",
    "center 60u1 top 50%",
    "center 60u1 top 50u1",
    "center 60u1 bottom 70%",
    "center 60u1 bottom 70u1",
    "center 60u1 left 50%",
    "center 60u1 left 50u1",
    "center 60u1 right 70%",
    "center 60u1 right 70u1",
    "center 60u1 center 65%",
    "center 60u1 center 65u1",

    "left 50% center 60%",
    "left 50% center 60u1",
    "left 50% right 80%",
    "left 50% right 80u1",
    "left 50% left 50%",
    "left 50% left 50u1",
    "left 50u1 center 60%",
    "left 50u1 center 60u1",
    "left 50u1 right 80%",
    "left 50u1 right 80u1",
    "left 50u1 left 50%",
    "left 50u1 left 50u1",
    
    "top 50% center 60%",
    "top 50% center 60u1",
    "top 50% bottom 50%",
    "top 50% bottom 50u1",
    "top 50% top 50%",
    "top 50% top 50u1",
    "top 50u1 center 60%",
    "top 50u1 center 60u1",
    "top 50u1 bottom 70%",
    "top 50u1 bottom 70u1",
    "top 50u1 top 50%",
    "top 50u1 top 50u1",

    "bottom 70% center 60%",
    "bottom 70% center 60u1",
    "bottom 70% top 50%",
    "bottom 70% top 50u1",
    "bottom 70% bottom 50%",
    "bottom 70% bottom 50u1",
    "bottom 70u1 center 60%",
    "bottom 70u1 center 60u1",
    "bottom 70u1 top 50%",
    "bottom 70u1 top 50u1",
    "bottom 70u1 bottom 50%",
    "bottom 70u1 bottom 50u1",

    "right 80% center 60%",
    "right 80% center 60u1",
    "right 80% left 50%",
    "right 80% left 50u1",
    "right 80% right 85%",
    "right 80% right 85u1",
    "right 80u1 center 60%",
    "right 80u1 center 60u1",
    "right 80u1 left 50%",
    "right 80u1 left 50u1",
    "right 80u1 right 85%",
    "right 80u1 right 85u1"
];


 var validInsets = [
    ["One arg - u1", "10u1"],
    ["One arg - u2", "10u2"],
    ["Two args - u1 u1", "10u1 20u1"],
    ["Two args - u1 u2", "10u1 20u2"],
    ["Two args - u2 u1", "10u2 20u1"],
    ["Two args - u2 u2", "10u2 20u2"],
    ["Three args - u1 u1 u1", "10u1 20u1 30u1"],
    ["Three args - u1 u1 u2", "10u1 20u1 30u2"],
    ["Three args - u1 u2 u1", "10u1 20u2 30u1"],
    ["Three args - u1 u2 u2 ", "10u1 20u2 30u2"],
    ["Three args - u2 u1 u1", "10u2 20u1 30u1"],
    ["Three args - u2 u1 u2 ", "10u2 20u1 30u2"],
    ["Three args - u2 u2 u1 ", "10u2 20u2 30u1"],
    ["Three args - u2 u2 u2 ","10u2 20u2 30u2"],
    ["Four args - u1 u1 u1 u1", "10u1 20u1 30u1 40u1"],
    ["Four args - u1 u1 u1 u2", "10u1 20u1 30u1 40u2"],
    ["Four args - u1 u1 u2 u1", "10u1 20u1 30u2 40u1"],
    ["Four args - u1 u1 u2 u2", "10u1 20u1 30u2 40u2"],
    ["Four args - u1 u2 u1 u1", "10u1 20u2 30u1 40u1"],
    ["Four args - u1 u2 u1 u2", "10u1 20u2 30u1 40u2"],
    ["Four args - u1 u2 u2 u1", "10u1 20u2 30u2 40u1"],
    ["Four args - u1 u2 u2 u2", "10u1 20u2 30u2 40u2"],
    ["Four args - u2 u1 u1 u1", "10u2 20u1 30u1 40u1"],
    ["Four args - u2 u1 u1 u2", "10u2 20u1 30u1 40u2"],
    ["Four args - u2 u1 u2 u1", "10u2 20u1 30u2 40u1"],
    ["Four args - u2 u1 u2 u2", "10u2 20u1 30u2 40u2"],
    ["Four args - u2 u2 u1 u1", "10u2 20u2 30u1 40u1"],
    ["Four args - u2 u2 u1 u2", "10u2 20u2 30u1 40u2"],
    ["Four args - u2 u2 u2 u1", "10u2 20u2 30u2 40u1"],
    ["Four args - u2 u2 u2 u2", "10u2 20u2 30u2 40u2"]
]

return {
    testInlineStyle: testInlineStyle,
    testComputedStyle: testComputedStyle,
    valuesAsTests: valuesAsTests,
    arraysAsTests: arraysAsTests,
    buildEllipsoidTests: buildEllipsoidTests,
    buildInsetTests: buildInsetTests,
    generateInsetRoundCases: generateInsetRoundCases
}
})();
