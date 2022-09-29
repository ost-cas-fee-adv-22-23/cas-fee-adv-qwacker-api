# qwacker API

This is the API for "qwacker". A simple API that supports creating
posts, replies and attaching media to them. Furthermore, the API
supports liking and unliking posts and replies.

This API is a demo API for the Certificate of Advanced Studies (CAS)
in Frontend Engineering Advanced at the University of Applied Sciences
OST in Switzerland (CAS FEE ADV OST ... I know. A lot of acronyms...).

This API delivers the "big three" possiblities of accessing a web API:
"REST", "graphQL", and "gRPC".

Most calls to the API are required to be authenticated by
[ZITADEL](https://zitadel.com). Accessing the list of "posts" or
the "search" is possible without authentication. To create, like, unlike,
or delete a post (or a reply), the user must be authenticated. The authentication
is done via OIDC and the API expects a valid JWT token in the
`HTTP Authoriztaion` header.

The following sections describe the access to the API in the specific
format and the authentication in detail.

## Authentication

To authenticate against the API of "qwacker", you'll need a valid
access token from ZITADEL. There is a specifically created ZITADEL
instance for qwacker.

## REST

baz

## graphQL

bar

## gRPC

foo
