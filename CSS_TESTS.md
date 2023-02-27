# Example Website
Note: this includes theme-monorail, so default-theme is untested.

```bash
NODE_ENV=production yarn build:css
```

Baseline: 343.95 / 46.56

Less all bootstrap components: 198.54 / 25.34
- meaning bootstrap accounts for 145.41

## Bootstrap Components in Use:
```scss
@import "bootstrap/scss/alert";
@import "bootstrap/scss/breadcrumb";
@import "bootstrap/scss/buttons";
@import "bootstrap/scss/carousel";
@import "bootstrap/scss/custom-forms";
@import "bootstrap/scss/forms";
@import "bootstrap/scss/grid";
@import "bootstrap/scss/images";
@import "bootstrap/scss/input-group";
@import "bootstrap/scss/nav";
@import "bootstrap/scss/navbar";
@import "bootstrap/scss/reboot";
@import "bootstrap/scss/root";
@import "bootstrap/scss/spinners";
@import "bootstrap/scss/tables";
@import "bootstrap/scss/type";
@import "bootstrap/scss/utilities";
```

### Components that _should_ be inlined (after checking if in use)
Note: these need to be analyzed with postcss to determine if the selectors are elements (e.g. `h1` selectors) -- these always need inclusion.
- grid
- reboot
- root
- type
- utilities
Assuming these are removed, filesize is: 268.47 / 34.83
