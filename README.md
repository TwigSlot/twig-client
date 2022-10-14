# TWIG Client

Client for [twigslot.com](https://twigslot.com)

## Development Setup
```shell
git clone http://github.com/twigslot/twig-client
cd twig-client
yarn install
yarn dev
```
then visit http://localhost:5173 (unless changed via `--port`) to see the web app

See [server setup](http://github.com/twigslot/twig-server)

## Building (for Development)
> **Note** This build is not meant to be production ready. See [this](#building-for-production) for deployment.

```shell
cd twig-client
yarn build
serve -d dist -p 5173
```
Port `5173` is used because [twig-server](https://github.com/twigslot/twig-server) sets CORS policy to only accept `http://localhost:5173` and `http://127.0.0.1:5173`

## Building (for Production)
```shell
docker build . -t tch1001/twig_client:v1.5
docker push tch1001/twig_client:v1.5
```
See [twig-server](https://github.com/twigslot/twig-server) for continuation.
