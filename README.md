Share2Give Server
========================

### Usage 

```bash
$ npm install               # Install dependencies
$ npm start                 # Starts 'forever'
$ npm stop                  # Stops all 'forever' processes
$ npm run-script status     # List the 'forever' processes
$ npm test                  # Run the tests
```

### For development:

```bash
$ grunt watch   # Watches sources, runs tests and restarts server on success
$ tail -f logs/server-log.json | bunyan     # pretty logs with bunyan
```

Run it from the command line:
```bash
$ node main.js --env test    # see config.yaml
```
