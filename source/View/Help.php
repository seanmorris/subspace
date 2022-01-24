<?php
namespace SeanMorris\SubSpaceTerminal\View;
class Help extends \SeanMorris\Theme\View
{
}
__halt_compiler(); ?>
Kallisti Sockets
©2018-2022 Sean Morris

Type 'commmands' for a list of REMOTE commands.

Channels:
If you're subscribed to a channel, you'll receive a
message if *any user* publishes a message on it.

Test it out:

<< sub your_channel
<< pub your_channel your message here

Binary Channels:

Binary channels have addresses consisting of a single
unsigned 16 bit integer. If you subscribe to a binary
channel, data will come in in Binary:

<< sub 0x0F
<< pub 0x0F test message

Publish raw bytes to a channel with /pub

<< sub 0x29A
<< /pub 0x29A 04 04 DE AD AF

Selectors:
You can subscribe/publish to channels using selectors.

Segment Selectors:
<< sub chat:*
<< pub chat:main Your message here.

Numbered Selectors:
<< sub chat:main:#
<< pub chat:main:0x00 Your message here.

Ranged Selectors:
<< sub chat:main:0x0-0xF
<< pub chat:main:0x00-0xFF Your spam here

--
