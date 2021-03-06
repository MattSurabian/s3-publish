const path = require('path');
const test = require('tape');
const Configuration = require('../src/models/Configuration');
const {examples, checkCommon, checkIgnoreHidden} = require('./common/config');

test('Configuration.fromFile (ignore-function)', function (t) {

    t.plan(checkCommon.count + checkIgnoreHidden.count);

    Configuration.fromFile(path.join(examples, 'ignore-function', 's3p.config.js'), (err, cfg) => {

        checkCommon(t, cfg);

        checkIgnoreHidden(t, cfg);
    });
});
