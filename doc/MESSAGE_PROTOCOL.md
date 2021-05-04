# Convo User Messaging Protocol

This document describes the blockchain protocol for dealing with messages

## Requisite Data

In order to implement a secure messaging system, several fields are useful:

- **Recipient ID**: The recipient should be able to query for all messages destined for them
- **Sender ID**: The parties should be able to query for messages from a given conversation
- **Timestamp**: Timestamps allow better querying and sequential ordering
- **Message Type**: Allows us to denote different types of messages. Encryption prevents this from becoming public.
- **Message Contents**: The encrypted content being sent

## Data Protocol

PUSHDATA | Field
---------|---------------------------------
0        | `OP_0` (see [this](https://bitcoinsv.io/2019/07/27/the-return-of-op_return-roadmap-to-genesis-part-4/))
1        | `OP_RETURN`
2        | Bitcom Protocol Namespace Address (`1CUMP5cMD9UJSARBvdVEsn8GndRN7dV8Sh`)
3        | User ID for the sender
4        | User ID for the recipient
5        | Current epoch timestamp in **milliseconds** since January 1st, 1970
6        | Queryable message type hash
7        | Encrypted message type
8        | Encrypted message content

The sender needs to sign at least one of the inputs to the transaction (either using an R-puzzle or a regular signature).

## Dealing with Encrypted Message Types and Indexability

If we try to encrypt the message type value with the ECDH shared secret and a random IV, it will be impossible to query for it later without first knowing the IV that was used.

Therefore, we need to use the ECDH shared secret with an HMAC function. To search, we just use HMAC with the desired message type and query the chain for that value.

However, when we aren't searching (such as when we are perusing messages in a conversation), it would be inconvenient to try every message type with HMAC until we got a match. Therefore, we store a second field that simply contains a copy of the mesage type encrypted with ECDH like normal.

## Additional Protocol Rules

All message types are encrypted and indexed with the **Primary Signing** keypair and primary ECDH shared secret.

When the message type denotes it, a secret message may have a content field encrypted with the **Privileged Signing** keypair and privileged ECDH shared secret.

Never cross-polinate primary and privileged keypairs with ECDH. For example, don't derive shared secrets with the sender's primary signing private key and the recipient's privileged signing public key.

## Message Types

### Text

When the message type is `text`, the content field will be a UTF-8 encoded message string encrypted with the ECDH shared secret between the sender's primary signing private key and the recipient's primary signing public key.

### Secret Text

When the message type is `secret-text`, the content field will be a UTF-8 encoded message string encrypted with the ECDH shared secret between the sender's privileged signing private key and the recipient's privileged signing public key.

### Photo

When the message type is `photo`, the content field will be an HTTP or UHRP-compliant URL. Downloading the data from the URL will produce the raw binary image data buffer encrypted with the ECDH shared secret between the sender's primary signing private key and the recipient's primary signing public key.

### Secret Photo

When the message type is `secret-photo`, the content field will be an HTTP or UHRP-compliant URL. Downloading the data from the URL will produce the raw binary image data buffer encrypted with the ECDH shared secret between the sender's privileged signing private key and the recipient's privileged signing public key.

## Implementation

This protocol has been implemented into a finite state machine using Bridgeport. The bus and bridge configurations can be found here:
- [Convo CUMP Bus](https://github.com/p2ppsr/convo-cump-bus)
- [Convo CUMP Bridge](https://github.com/p2ppsr/convo-cump-bridge)
