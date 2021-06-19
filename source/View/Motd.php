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
\e[5mReminder!\e[0m
LOCAL commands start with a "/". REMOTE commands are bare
while in REMOTE MODE. Hit Esc to switch to LOCAL MODE.

- Type '\e[4m/theme\e[0m' to switch darkmode/lightmode.
- Type '\e[4m/commands\e[0m' for a list of LOCAL commands.
- Type '\e[4mcommands\e[0m' for a list of REMOTE commands.
- Type '\e[4mhelp\e[0m' or '\e[4mhelp COMMAND\e[0m' for help working with REMOTE.
<? //Type '\e[4m/help\e[0m' or '/help COMMAND' for help working with LOCAL. ?>

The shorthand syntax '\e[4m/COMMAND?\e[0m' also works for help text.

Type '\e[4mcommands\e[0m' to get started on REMOTE or '?' for help.
Type '\e[4mmanual\e[0m' for more detailed info about REMOTE.

Please respect your peers & the server.
Thank you.
--
