<?php
namespace SeanMorris\SubSpaceTerminal;
class SocketRoute extends \SeanMorris\SubSpace\EntryRoute
{
	/**
	 * Print the Message of the Day.
	 */
	public function motd($router)
	{
		$clientId = $router->contextGet('__agent')->id;

		$uid  = sprintf('0x%04x', $clientId);
		$name = NULL;

		if($user = $router->contextGet('__persistent'))
		{
			$name = $user->username;
		}

		return new \SeanMorris\SubSpaceTerminal\View\Motd([
			'name'  => $name
			, 'uid' => $uid
		]);
	}

	/**
	 * Roll a 64 bit die.
	 */
	public function random()
	{
		return rand(PHP_INT_MIN,PHP_INT_MAX);
	}

	/**
	 * Iterate a sequence.
	 */
	public function seq($router)
	{
		$agent = $router->contextGet('__agent');

		if(!$agent)
		{
			return;
		}

		$current = $router->contextGet('__sequence') ?? 0;

		$router->contextSet('__sequence', $current + 1);

		return $current;

		// foreach(range(0,255) as $i)
		// {

		// }
	}

	/**
	 * Get the current time.
	 */
	public function time($router)
	{
		$args = $router->path()->consumeNodes();

		if($args[0] ?? FALSE)
		{
			return ['time' => microtime(TRUE)];
		}

		return (int) round(microtime(TRUE) * 1000);
	}

	/**
	 * Print the help page.
	 */
	public function help()
	{
		return new \SeanMorris\SubSpaceTerminal\View\Help;
	}

	/**
	 * Print the Manual.
	 */
	public function manual()
	{
		return new \SeanMorris\SubSpaceTerminal\View\Manual;
	}

	/**
	 * Use /register instead. Type "manual" for more info.
	 * Create a persistent user account.
	 */
	public function register($router)
	{
		if($user = $router->contextGet('__persistent'))
		{
			return ['error' => sprintf(
				'Already logged in in as %s.'
				, $user->username
			)];
		}

		$args = $router->path()->consumeNodes();

		if(!$router->contextGet('__authed'))
		{
			return ['error' => 'You need to auth before you can register.'];
		}

		if(count($args) < 3)
		{
			return ['error' => 'Usage: register USERNAME PASSWORD EMAIL.'];
		}

		if(!filter_var($args[2], FILTER_VALIDATE_EMAIL))
		{
			return ['error' => 'Please supply a valid email in position 3.'];
		}

		$user = \SeanMorris\Access\User::loadOneByUsername($args[0]);

		if($user)
		{
			return ['error' => 'Username exists.'];
		}

		$user = new \SeanMorris\Access\User;

		$user->consume([
			'username'   => $args[0]
			, 'password' => $args[1]
			, 'email'    => $args[2]
		]);

		if($user->save())
		{
			$router->contextSet('__persistent', $user);

			return ['success' => 'Persistent user account created!'];
		}

		return [
			'error' => 'Unknown.'
		];
	}

	/**
	 * Use /login instead. Type "manual" for more info.
	 * Login to your account.
	 */
	public function login($router)
	{
		if($user = $router->contextGet('__persistent'))
		{
			return ['error' => sprintf(
				'Already logged in as %s.'
				, $user->username
			)];
		}

		$args = $router->path()->consumeNodes();

		if(count($args) < 2)
		{
			return ['error' => 'Usage: register USERNAME PASSWORD.'];
		}

		$user = \SeanMorris\Access\User::loadOneByUsername($args[0]);

		if(!$user)
		{
			return ['error' => 'User not found.'];
		}

		if($user->login($args[1]))
		{
			$router->contextSet('__persistent', $user);

			return ['success' => 'Logged in!'];
		}
		else
		{
			return ['error' => 'Bad password.'];
		}
	}

	public function logout($router)
	{
		$router->contextSet('__persistent', FALSE);

		return 'logged out.';
	}

	public function _dynamic($router)
	{
		// $args = $router->path()->consumeNodes();

		$command = $router->path()->getNode();

		if($command == '?')
		{
			return $this->help($router);
		}

		return FALSE;
	}

	public function _tick($hub)
	{
		\SeanMorris\SubSpaceTerminal\Queue\AjaxMessage::check(
			function($message) use($hub){
				\SeanMorris\Ids\Log::debug($message);

				$hub->publish(
					$message['channel']
					, $message['message']
					, $hub->agent($message['agent'])
				);
			}
		);
	}
}
