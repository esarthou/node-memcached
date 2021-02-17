# node-memcached


## Basic usage:

1 - Clone repository on local machine running:  
    
        git clone https://github.com/esarthou/node-memcached

2 - On your terminal aplication, navigate to the repository forlder and run 
            
        npm install

3 - To run the service in development mode execute:
        
        npm run start
     
This will start an instance that listens for connections on **127.0.0.1:11111** . (This should not be used in production or load testing, it uses more memory because it's not transpiled)

## Bundling:

### To compile the code for deployment execute:

        npm run clean
        npm run build
        npm run transpile

### Finally let's run it in production mode:

        npm run start:prod

## Testing:
### Integration tests: 
        npm run test

### Load testing:
        npm run test:load

### Reports:

- Linter: ~/node-memcached/test/results/lint/index.html

- Integration tests: ~/node-memcached/test/results/mochawesome/mochawesome.html

- Test coverage: ~/node-memcached/test/results/coverage/index.html

- Load test reports: ~/node-memcached/test/results/load/result.json.html

## Global dependencies:

- node 12 
