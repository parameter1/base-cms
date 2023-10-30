Omeda+IdentityX Middleware
===

## Set Identity Cookie
This [middleware](./set-identity-cookie.js) sets the IdentityX Identity cookie. This cookie represents the identity that all user behavior should be attributed to.

Test cases:
1. Fully anonymous user (no omeda or idx tokens). No cookie should be set.
2. Logged in user w/o cookie: cookkie should be set
3. Logged in user w/ cookie: Cookie shoudl not be set.
4. Omeda identity cookie present, identityx user exists for ext id: cookie shoul dbe set.
5. Omeda identity cookie present, no identityx user exists: cookie should be set.
