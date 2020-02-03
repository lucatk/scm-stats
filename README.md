# scm-stats

scm-stats is a simple Express middleware for pulling quick stats from Source Code Management services such as GitHub or GitLab.

## Installation

Use your favourite node package manager to install scm-stats.
See this example for installing using [yarn](https://yarnpkg.com):

```bash
yarn add scm-stats
```

## Usage

```javascript
// import the scm-stats module using require
const scmStats = require('scm-stats');
// or using ES6+ syntax:
import scmStats from 'scm-stats';

// add to Express as middleware
app.use('/', scmStats);
```

Make sure to create a respective OAuth app for your application.
See the [example/](https://github.com/lucatk/scm-stats/tree/master/example) folder for more detailed information.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
