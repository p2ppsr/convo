# Convo Mesenger

A private messaging app built with Project Babbage

## Overview

This is a React app demonstrating the use of [Babbage](https://projectbabbage.com) technologies with a simple private messaging experience.

- The app relies on the Babbage SDK to provide user accounts, key management and account recovery
- Bridgeport is used to provide a universal state machine backend powered by BSV transactions and real-time message and profile updates
- Hashbrown will soon provide a place to store picture messages and user profile photos

## A note on the (ab)use of redux

Some uses of Redux in this application are—shall we say—*unconventional*.

This is due primarily to a lack of sound Redux knowledge on the part of your author. However, I have done my best to ensure that these violations don't impact 
your ability to understand CWI and build your applications.

Try not to be too bothered by the occasional `store.dispatch` inside a React component. Pull requests that address these shortcomings are welcome :)

## License

The license for the code in this repository is the Open BSV License.
