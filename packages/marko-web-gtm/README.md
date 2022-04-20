# BaseCMS Marko Web GTM Components
Google Tag Manager components for BaseCMS/Marko websites.

## Installation
Once you have a GTM container ID, you can enable GTM in your base-cms-marko-web application. To do so, include this package and add the following two tags to your app:

### `marko-web-gtm-init`
This component initializes the GTM container(s) specified, and allows a standard set of inputs to be used for projects utilizing this package solo and for projects using the `marko-web-deferred-script-loader` package.

To load GTM normally, include the following calls, specifying only your container id(s) and any of the optional arguments: `start`, `push`:
```marko
<marko-web-document ...input>
  <@head>
    <marko-web-gtm-init container-id="GTM-XXXXXX" start=true />
    <${input.head} />
  </@head>
  <@above-wrapper>
    <marko-web-gtm-noscript container-id="GTM-XXXXXX" />
  </@above-wrapper>
</marko-web-document>
```

To defer GTM, ensure the `marko-web-deferred-script-loader` package is installed and enabled, and then specify the relevant `on`, `request-frame`, and `target-tag` parameters along with your component call.
```marko
<marko-web-document ...input>
  <@head>
    <marko-web-gtm-init
      container-id="GTM-XXXXXX"
      start=true
      on="load"
      request-frame=true
      target-tag="body"
    />
    <${input.head} />
  </@head>
  <@above-wrapper>
    <marko-web-gtm-noscript container-id="GTM-XXXXXX" />
  </@above-wrapper>
</marko-web-document>
```

To specify an alternative datalayer name, use the `name="fooLayer"` parameter1.

To pre-push data to the datalayer, you can use the `push={ foo: 'bar' }` parameter. See the `marko-web-gtm-push` component for more details.

To automatically start your containers, send the `start=true` parameter with your `init` component. Otherwise, you must manually start the GTM container with the `marko-web-gtm-start` component.

### `marko-web-gtm-noscript`

### `marko-web-gtm-start`
### `marko-web-gtm-push`
### `marko-web-gtm-slot`
### `marko-web-gtm-track-bus-event`
### `marko-web-gtm-track-inview-event`
### `marko-web-gtm-track-load-more`
