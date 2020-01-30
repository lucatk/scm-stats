const express = require('express');
const app = express();

const scmStats = require('scm-stats');
app.use('/', scmStats);

app.listen(8080);