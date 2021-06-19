# SubSpace Console / Kallisti Websockets Playground

### LOCAL Commands:
LOCAL commands begin with a "/", like /login or /pub

It is recommended to use "/login" and "/register" to
perform the respective actions rather than  the bare
"login" and "register" as the UI will prompt for a
password separately rather than printing it to the
terminal.

Run `/commands` for the full list of LOCAL commands.

### REMOTE Commands
server commands are barwords like "pub", "sub" or
"unsub".

Run `commands` for the full list of REMOTE commands.

### Binary Messages:
Binary messages are transmitted on channels named by
a single 16 bit value in the range of 0x0000-0xFFFF.

Binary messages will come in this format:

```
>> 0x00320000 02 9A DE AD AF
# or
>> 0x0000 02 9A DE AD AF
```

The first example signifies that it is a message that
originated from user 0x0032 and was published to channel
0x0000. This is displayed as one long header: 0x00320000.

The second example signifies that the message originated
on the server.

Run the following commands to test:
```
<< sub 0x0000
<< /pub 0000 01 AF A0 FA DF
```

Please note these numbers are hexadecimal.

### Text Messages:
Text messages will come in the following format:
```json
{
    "message": "message",
    "origin": "user",
    "originId": 50,
    "channel": "random:channel:name",
    "originalChannel": "random:*"
}
```

"originId" represents the user who sent the message, in
decimal.

"channel" is the channel the message was RECEIVED on.

"originalChannel" is the channel (or channel selector) th
message was PUBLISHED on.

Run the following commands to test:

```
<< sub random:channel:name
<< pub random:channel:name your message here
```

## Kallisti Sockets

Channels:
If you're subscribed to a channel, you'll receive a
message if *any user* publishes a message on it.

Test it out:

```
<< sub your_channel
<< pub your_channel your message here
```

Binary Channels:

Binary channels have addresses consisting of a single
unsigned 16 bit integer. If you subscribe to a binary
channel, data will come in in Binary:

```
<< sub 0x0F
<< pub 0x0F test message
```

Publish raw bytes to a channel with /pub
```
<< sub 029A
<< /pub 029A 04 04 DE AD AF
```

Selectors:
You can subscribe/publish to channels using selectors.

Segment Selectors:

```
<< sub chat:*
<< pub chat:main Your message here.
```

Numbered Selectors:

```
<< sub chat:main:#
<< pub chat:main:0x00 Your message here.
```

Ranged Selectors:
```
<< sub chat:main:0x0-0xF
<< pub chat:main:0x00-0xFF Your spam here
```
