## Installation locally

```bash
#1. clone repository
$ git clone https://github.com/luthfi-satria/simplechat-fe.git 

#3 go to directory
$ cd simplechat-fe

#4 install dependencies
$ npm install

#6 run application
$ npm run dev
```

## Disclaimer
1. Make sure chat server <b>simplechat-be</b> was run
2. Before run application, please setup .env file then change VITE_WEBSOCKETURL and VITE_APIURL


## Installation via docker
```bash
# clone repository
$ git clone https://github.com/luthfi-satria/simplechat-fe.git

# Go to directory
$ cd simplechat-fe

# run docker compose
$ docker-compose up --build
```