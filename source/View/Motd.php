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
LOCAL commands start with a "/". REMOTE commands are bare
while in REMOTE MODE. Hit Esc to switch to LOCAL MODE.

- Type '/theme' to switch darkmode/lightmode.
- Type '/commands' for a list of LOCAL commands.
- Type 'commands' for a list of REMOTE commands.
- Type 'help' or 'help COMMAND' for help working with REMOTE.
<? //Type '/help' or '/help COMMAND' for help working with LOCAL. ?>

The shorthand syntax '/COMMAND?' also works for help text.

Type 'commands' to get started on REMOTE or '?' for help.
Type 'manual' for more detailed info about REMOTE.

Please respect your peers & the server.
Thank you.
--

