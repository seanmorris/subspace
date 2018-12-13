<?php
namespace SeanMorris\SubSpace\Idilic\Route;
class RootRoute implements \SeanMorris\Ids\Routable
{
	public function server()
	{
		$socket = new \SeanMorris\SubSpace\Socket;

		while(true)
		{
			$socket->tick();
		}

		return "lol not implmented";
	}
}
