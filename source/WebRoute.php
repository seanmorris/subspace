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

	public function init_rc($router)
	{
		return new \SeanMorris\SubSpaceTerminal\View\InitRc;
	}

	public function open_rc($router)
	{
		return new \SeanMorris\SubSpaceTerminal\View\OpenRc;
	}

	public function bounce_rc($router)
	{
		return new \SeanMorris\SubSpaceTerminal\View\BounceRc;
	}

	public function post($router)
	{
		if(!$user = \SeanMorris\Access\Route\AccessRoute::_currentUser())
		{
			return FALSE;
		}

		if(!isset($_POST['token']))
		{
			return FALSE;
		}

		if(!isset($_POST['channel']))
		{
			return FALSE;
		}

		$message = NULL;

		if(array_key_exists('message', $_POST))
		{
			$message = $_POST['message'];
		}
		else
		{
			if($_FILES['message'] && file_exists($_FILES['message']['tmp_name']))
			{
				$message = file_get_contents($_FILES['message']['tmp_name']);
			}
			else
			{
				return FALSE;
			}
		}

		if(!$tokenSource = \SeanMorris\SubSpace\JwtToken::verify($_POST['token']))
		{
			return FALSE;
		}

		if(!$token = json_decode($tokenSource))
		{
			return FALSE;
		}

		if(!isset($token->cid))
		{
			return FALSE;
		}

		\SeanMorris\SubSpaceTerminal\Queue\AjaxMessage::send([
			'message'   => $message
			, 'channel' => $_POST['channel']
			, 'agent'   => $token->cid
		]);
	}
}
