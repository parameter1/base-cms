base-cms-marko-web
===
This package provides the core MarkoJS and Express components for building a website using the BaseCMS ecosystem.

## Getting started

To use this project, pass configuration data to the `startServer` module:
```js
startServer({
  rootDir: __dirname,
  graphqlUri: 'https://some.api.url',
  siteId: 'abc123',
  routes: app => app.get('/', (_, res) => res.send('Hello, world!')),
});
```

For more information, check out [the docs](https://docs.parameter1.com/basecms-websites/getting-started/quick-start-guide#configuring-the-framework).

## Working with HTTPS

To utilize HTTPS, you must provide an SSL certificate and key. For local development, you can generate
a self-signed certificate.

### Generating a certificate
You can find more information about this process [here](https://stackoverflow.com/questions/34835859/node-js-https-example-error-unknown-ssl-protocol-error-in-connection-to-localh/35053638#35053638). On MacOS, you can use the following commands to generate a self-signed certificate in your project directory:
```sh
openssl genrsa -out client-key.pem 2048
openssl req -new -key client-key.pem -out client.csr
openssl x509 -req -in client.csr -signkey client-key.pem -out client-cert.pem
```

Fill out the CSR fields as needed, making sure to use the `EXPOSED_HOST` (default: `localhost`) for the `Common Name` field.

### Using your SSL certificate
To enable local HTTPS serving, ensure that the `sslKey`, and `sslCert` are sent to the `start-server`
utility. The `portHttps` and `exposedPortHttps` fields can also be customized, but will use default
values (from `PORT_HTTPS` and `EXPOSED_PORT_HTTPS`). The SSL key and certificate data should only be
sent if it is valid for use -- invalid key/certificate data will cause the https server to fail.

```js

startServer({
  // ...
  portHttps: 443,
  exposedPortHttps: 8443,
  sslKey: fs.existsSync(keyPath) ? fs.readFileSync(keyPath) : undefined,
  sslCert: fs.existsSync(certPath) ? fs.readFileSync(certPath) : undefined,
  // ...
});

```

### Trusting your certificate (MacOS)
Ref https://tosbourn.com/getting-os-x-to-trust-self-signed-ssl-certificates

1. Open [Keychain Access](x-help-action://openApp?bundleId=com.apple.keychainaccess)
2. File, Import items (./client-cert.pem)
3. Open the Certificates tab and double-click your new cert (matching the `EXPOSED_HOST` value from above).
4. Under the trust section, “When using this certificate” select “Always Trust”.
5. Open the HTTPS link and allow the certificate (in Chrome, select Advanced and )
