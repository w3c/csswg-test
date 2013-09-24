function test_inline_style(value, expected) {
    var div = document.createElement('div');
    div.style.setProperty('shape-outside', value);
    var actual = div.style.getPropertyValue('shape-outside');
    assert_equals(actual, typeof expected !== 'undefined' ? expected : value);
}

function test_computed_style(value, expected, props) {
    var div = document.createElement('div');
    div.style.setProperty('shape-outside', value);
    if (props)
        for (key in props)
            div.style.setProperty(key, props[key]);
    document.body.appendChild(div);
    var style = getComputedStyle(div);
    var actual = style.getPropertyValue('shape-outside');
    document.body.removeChild(div);
    assert_equals(actual, typeof expected !== 'undefined' ? expected : value);
}

function test_approx_computed_style(value, expected, props) {
    var div = document.createElement('div');
    div.style.setProperty('shape-outside', value);
    if (props)
        for (key in props)
            div.style.setProperty(key, props[key]);
    document.body.appendChild(div);
    var numre = /[\d\.]+/g;

    var result = getComputedStyle(div).getPropertyValue('shape-outside');
    document.body.removeChild(div);

    // Is it the same except for the numbers?
    assert_equals(result.replace(numre, ''), expected.replace(numre, ''));

    // Are the numbers equal?
    var results = result.match(numre).map(parseFloat);
    var expecteds = expected.match(numre).map(parseFloat);
    assert_equals(results.length, expecteds.length);
    results.forEach(function(result, i) {
        assert_approx_equals(result, expecteds[i], 0.01);
    });
}
