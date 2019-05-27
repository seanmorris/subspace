<?php
namespace SeanMorris\SubSpaceTerminal;
class WebRoute extends \SeanMorris\SubSpace\WebRoute
{
	public $routes = [
		'user' => 'SeanMorris\Access\Route\AccessRoute'
	];

	public function __construct()
	{
		if(!isset($_GET['api']) && !($_POST ?? FALSE) && php_sapi_name() !== 'cli')
		{
			\SeanMorris\Ids\Log::debug($_SERVER);

			$public = \SeanMorris\Ids\Settings::read('public');

			$page   = '/index.html';
			$uiPath = realpath($public . $page);

			if(file_exists($uiPath))
			{
				print file_get_contents($uiPath);
			}
			else
			{
				printf(
					'Cannot locate "%s".'
					, ($public . $page)
				);
			}

			die;
		}

		if (session_status() === PHP_SESSION_NONE)
		{
			session_start();
		}
	}
}
