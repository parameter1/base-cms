Monorail website theme
===

## Features

### Content Metering

To install and use this feature, you must:
1. Import the content metering middleware and add to your content routes:
```diff
# site/routes/content.js

+import contentMetering from '@parameter1/base-cms-marko-web-theme-monorail/middleware/content-metering';

export default (app) => {
-  app.get('/*?:id(\\d{8})*', withContent({
+  app.get('/*?:id(\\d{8})*', contentMetering, withContent({
    template: content,
    queryFragment,
  }));
```

2. Add the `contentMeter` site config object. See below table for defined options/default values.

```diff
# site/config.js

module.exports = {
+   contentMeter: {
+    enabled: process.env.ENABLE_CONTENT_METER || false,
+    viewLimit: 5,
+  },
}
```

| Key | Default value | Description |
| - | - | - |
| `enable` | `false` | If the feature should be enabled. |
| `viewLimit` |  `3` | The number of content items a viewer can see in `timeframe` without logging in. |
| `timeframe` | `30 * 24 * 60 * 60 * 1000` (30 days in ms) | The timeframe to consider |
| `excludeLabels` | `[]` | Content labels that should be excluded from metering. |
| `excludeContentTypes` | `[]` | Content types that should be excluded from metering. |
| `excludePrimarySectionIds` | `[]` | Sections whose primary content should be excluded from metering. |
| `excludePrimarySectionAlias` | `[]` | Sections whose primary content should be excluded from metering. |
| `displayOverlay` | _None_ | ??? @B77Mills what is this |
| `promoCode` | _None_ | If present, the Omeda promo code to use with content metering events. |


```diff
# site/config.js

module.exports = {
+   contentMeter: {
+    enabled: process.env.ENABLE_CONTENT_METER || false,
+    viewLimit: 5,
+  },
}
```

3. Add the UI display and event tracking component to your core `document` component (ideally in above-container):
```marko
<!-- site/server/components/document.marko -->

$ const { contentMeterState } = out.global;
<if(contentMeterState && !contentMeterState.isLoggedIn)>
  <theme-content-meter-block
    views=contentMeterState.views
    view-limit=contentMeterState.viewLimit
    display-overlay=contentMeterState.displayOverlay
    display-gate=contentMeterState.displayGate
  />
</if>
```

5. Adjust the content body template/layout to truncate the body and/or show inline gating options:
```marko
<!-- site/components/layouts/content.marko -->

import cm from "@parameter1/base-cms-marko-web-theme-monorail/utils/content-meter-helpers";

$ const { content, blockName } = input;
$ const { contentGatingHandler, contentMeterState, req } = out.global;

$ const showOverlay = cm.shouldOverlay(contentMeterState);
$ const requiresReg = cm.restrictContentByReg(contentMeterState, contentGatingHandler, content);

$ let body = content.body;
<if(cm.shouldTruncate(contentMeterState))>
  $ if (showOverlay) body = getContentPreview({ body: content.body, selector: "p:lt(7)" });
  <marko-web-content-body block-name=blockName obj={ body } />
  <div class="content-page-preview-overlay" />
  <if(!showOverlay)>
    <theme-content-page-gate
      can-access=context.canAccess
      is-logged-in=context.isLoggedIn
      $ // ...
    />
  </if>
</if>
<else-if(!context.canAccess || context.requiresUserInput)>
  $ // ...

```
