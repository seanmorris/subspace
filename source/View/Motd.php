<?php
namespace SeanMorris\SubSpaceTerminal\View;
class Motd extends \SeanMorris\Theme\View
{
}
__halt_compiler(); ?>
Message of the Day: 

Welcome to the subspace server, <?=$name ?? 'USER ' . $uid;?>!

<?php if($name): ?>You've been assined uid <?=$uid;?>.

<?php endif; ?>
Reminder!
LOCAL commands start with a "/". REMOTE commands are bare.

Type '/commands' for a list of LOCAL commands
Type '/help' or '/help COMMAND' for help working with LOCAL.
The syntax '/COMMAND?' also works.

Type 'commands' to get started on REMOTE or '?' for help.
Type 'manual' for more detailed info about REMOTE.

Please respect your peers & the server.
Thank you.

--
