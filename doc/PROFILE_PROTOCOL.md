# Convo User Profiles Protocol

This document describes the blockchain protocol for dealing with user profiles

## Requisite Data

In order to implement a user profiling system, several fields are useful:

- **Name**: We will want to know what the user is to be called. Searching with this field is also useful.
- **Photo**: Users should be able to set profile photos for easy identification
- **Primary Signing Public Key**: This allows people to send standard messages to the user
- **Privileged Signing Public Key**: This allows people to send secret messages to the user
- **Timestamp**: This lets us know about profile updates

## Data Protocol

With the above fields in mind, we define a [Bitcom](https://bitcom.bitdb.network/#/) OP_RETURN protocol.

PUSHDATA | Field
---------|---------------------------------
0        | `OP_0` (see [this](https://bitcoinsv.io/2019/07/27/the-return-of-op_return-roadmap-to-genesis-part-4/))
1        | `OP_RETURN`
2        | Bitcom Protocol Namespace Address (`1CUPPJ9Zjs2qCN2BYgAQzFPga66DYL7uFa`)
3        | Bitcoin address associated with the Primary Signing key at path `m/2000/1` of a Rubeus user's key tree
4        | 33-byte primary signing public key at path `m/2000/1` of a Rubeus user
5        | 33-byte privileged signing public key at path `m/2000/1` of a Rubeus user
6        | Current epoch timestamp in **seconds** since January 1st, 1970
7        | UTF-8 encoded name for the user, maximum 64 characters
8        | HTTP or UHRP-compliant URL to a profile photo for the user

At least one transaction input must be signed (via R-puzzle or normal signature) with the private key from `m/2000/1` of the Primary Signing keyset of a Rubeus user.

## Implementation

This protocol has been implemented into a finite state machine using Bridgeport. The bus and bridge configurations can be found here:
- [Convo CUPP Bus](https://github.com/p2ppsr/convo-cupp-bus)
- [Convo CUPP Bridge](https://github.com/p2ppsr/convo-cupp-bridge)
