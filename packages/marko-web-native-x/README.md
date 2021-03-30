# BaseCMS Marko Web NativeX Components
NativeX components for BaseCMS/Marko websites.

## Configuration

All NativeX components rely upon an instance of the NativeXConfiguration class being provided. For ease of use, this configuration is typically set into the Express app locals via the `start-server` utility, but must be provided when querying for an advertisement or a story. This configuration defines (at minimum) the NativeX instance URI and the default template alias. If website section-based templates are in use, they must be defined after creation:
```js
const NativeXConfiguration = require('@parameter1/base-cms-marko-web-native-x/config');

const config = new NativeXConfiguration('https://example.native-x.parameter1.com',
  {
    enabled: true,
    defaultAlias: 'default',
  }
);

// Configure a placement
config.setPlacement({
  alias: 'default',
  name: 'default',
  id: '5d4b04769f69b200013ab109',
});

// Configure multiple placements for an alias
config.setAliasPlacements('my-custom-alias', [
  { name: 'custom-placement-1', id: '95d4b04769f69b200013ab10' },
  { name: 'custom-placement-2', id: '095d4b04769f69b200013ab1' },
]);

module.exports = config;
```

## Usage

### Advertisements

Rendering NativeX advertisements is typically done by using the `<marko-web-native-x-render>` component. If NativeX is enabled, this component then uses the `<marko-web-native-x-retrieve>` component to query NativeX for an advertisement. When an advertisement is available, the content node will be replaced by the ad details.

The render component requires the following properties:
- `config`: An instance of the NativeXConfiguration class.
- `name`: The name of the placement to use (as defined by `setPlacement` and `setAliasPlacements`)
- `aliases`: An array of active aliases to use. (See aliases below)
- `node`: The content node that may become a NativeX ad.
- `when`: A boolean. When truthy, the content node will be replaced by the ad (if available)
- `sectionName`: Used by the conversion utilities. Because ads do not have website context, indicate the name of the primary section of the "content" (the ad, once replaced)

#### Aliases

When registering an placement, you must specify an alias. If you are not using any alias-aware placements, you should use the value `default` for the alias field. This is the most common!

In an atypical website deployment, multiple NativeX placements may be used to further segment NativeX metrics. When a placement is requested, the supplied aliases are checked against registered placements. If a more specific placement exists, it is used preferentially over the `default` placement with a matching `name`.

For example, consider the following:
```js
const config = new NativeXConfiguration(...);

// The default placement
config.setPlacement({ alias: 'default', name: 'default', id: '5d4b04769f69b200013ab109' });
config.setPlacement({ alias: 'section-1', name: 'default', id: '95d4b04769f69b200013ab10' });
config.setPlacement({ alias: 'section-2', name: 'default', id: '095d4b04769f69b200013ab1' });

const aliases = ['section-1/child-section/grand-child', 'section-1/child-section', 'section-1'];

const placement = config.getPlacement({ name: 'default', aliases });
console.log(placement.id);
// 95d4b04769f69b200013ab10
```


### Stories

To render a NativeX story in a consuming application, import the `with-story` middleware. This middleware requires a NativeX configuration and a Marko template to render a response. It also supports sending a custom `queryFragment` to return additional fields, if needed.

An Express route
```js
// my-site/routes/native-x-story.js
const withNativeXStory = require('@parameter1/base-cms-marko-web-native-x/middleware/with-story.js');
const config = require('../config/native-x');
const template = require('../templates/native-x-story');

module.exports = (app) => {
  app.use('/some-path/:id', withNativeXStory({
    config,         // Required. An instance of the NativeXConfiguration class.
    template,       // Required. A Marko template used to render the story.
    queryFragment,  // Optional. A GraphQL query fragment specifying included fields.
  }));
};
```

A minimal Marko template
```marko
<!-- my-site/templates/native-x-story.marko -->
$ const { document } = out.global;
$ const { story } = input;

<${document}>
  <@container>
    <@page>
      <if(imgSrc)>
        <marko-web-img class="img-fluid" src=story.primaryImage.src />
      </if>
      <h1>${story.title}</h1>
      <if(story.teaser)>
        <p>${story.teaser}</p>
      </if>
      <hr>
      $!{story.body}
    </@page>
  </@container>
</>
```

A GraphQL fragment definition
```js
// my-site/graphql/fragments/story.js

const gql = require('graphql-tag');

module.exports = gql`
  fragment MyCustomStoryFragment on Story {
    id
    title
    campaigns {
      totalCount
      edges {
        id
        name
      }
    }
  }
`;

```
