# FrankAI bounce operations

Status: `BOUNCE_PROCESSING_PARTIAL`. The proposed monitored address is
`bounce@frankai.online`, but receipt and NDR correlation are not proven.

The proposed monitored address is `bounce@frankai.online`. Current application
submission sets the message `From` address but does not explicitly set a
separate Nodemailer envelope sender, so the final Return-Path must be confirmed
in staging before changing it. A future approved change may set the envelope
sender to `bounce@frankai.online`; it must not be applied to production in this
phase.

Monitor NDRs manually first. Correlate provider timestamps, Message-ID, and
Postfix queue ID with the application outbox without retaining full message
bodies. Classify hard and temporary failures, retain only what the approved
privacy policy permits, and do not automatically disable users or regenerate
tokens. Prevent loops by never sending automated responses to bounce messages
and by handling null reverse paths correctly.

Required proof after provider activation: controlled invalid-recipient test,
provider NDR receipt, no loop, no token-bearing content, and safe correlation.
