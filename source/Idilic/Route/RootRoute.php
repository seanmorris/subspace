<?php
namespace SeanMorris\SubSpace\Idilic\Route;
class RootRoute implements \SeanMorris\Ids\Routable
{
	const FREQUENCY = 120;

	public function derange()
	{
		var_dump(\SeanMorris\Kalisti\Channel::deRange('a:5-10:b:0-3:a:5-10:b:0-3:a:5-10:b:0-3'));
	}

	public function server()
	{
		$socket = new \SeanMorris\SubSpace\Socket;

		while(true)
		{
			usleep( 1000000 / static::FREQUENCY );

			$socket->tick();
		}
	}
}
