<?php
namespace SeanMorris\SubSpace;
class EntryRoute implements \SeanMorris\Ids\Routable
{
	/**
	 * Print the Message of the Day.
	 */
	public function motd($router)
	{
		$clientId = $router->contextGet('__clientIndex');

		return sprintf('Welcome to the subspace server, #0x%04x!', $clientId);
	}

	/**
	 * Roll a 64 bit die.
	 */
	public function random()
	{
		return rand(PHP_INT_MIN,PHP_INT_MAX);
	}

	public function seq($router)
	{
		$agent = $router->contextGet('__agent');

		if(!$agent)
		{
			return;
		}

		foreach(range(0,255) as $i)
		{

		}
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
	 * Auth via JWT.
	 */
	public function auth($router)
	{
		$args = $router->path()->consumeNodes();

		if($router->contextGet('__authed'))
		{
			return [
				'error' => 'authed.'
			];
		}

		if(count($args) < 1)
		{
			return [
				'error' => 'Please supply an auth token.'
			];
		}

		if(\SeanMorris\Dromez\Jwt\Token::verify($args[0]))
		{
			fwrite(STDERR, sprintf(
				"Client #%d authentiated!\n"
				, $client->id
			));

			$router->contextSet('__authed', TRUE);

			return sprintf('authed');
		}
	}

	/**
	 * Get/Set your nickname.
	 */
	public function nick($router)
	{
		$args   = $router->path()->consumeNodes();

		if(!$router->contextGet('__authed'))
		{
			return [
				'error' => 'You need to auth before you can nick.'
			];
		}

		if(count($args) < 1)
		{
			return [
				'nick' => $router->contextGet('__nickname')
			];
		}

		if(!preg_match('/^[a-z]\w+$/i', $args[0]))
		{
			return [
				'error' => 'Nickname must be alphanumeric.'
			];
		}

		$client = $router->contextSet('__nickname', $args[0]);

		return [
			'yournick' => $args[0]
		];
	}

	/**
	 * Publish a message to a channel individually or by a selector.
	 */
	public function pub($router)
	{
		$args  = $router->path()->consumeNodes();
		$hub   = $router->contextGet('__hub');
		$agent = $router->contextGet('__agent');

		if(!$router->contextGet('__authed'))
		{
			return [
				'error' => 'You need to auth before you can pub.'
			];
		}

		if(count($args) < 1)
		{
			return [
				'error' => 'Please supply a channel selector.'
			];
		}

		$channelName = array_shift($args);

		$hub->publish($channelName, implode(' ', $args), $agent);
	}

	/**
	 * Subscribe to a channel individually or by a selector.
	 */
	public function sub($router)
	{
		$args  = $router->path()->consumeNodes();
		$hub   = $router->contextGet('__hub');
		$agent = $router->contextGet('__agent');

		if(!$router->contextGet('__authed'))
		{
			return [
				'error' => 'You need to auth before you can sub.'
			];
		}

		if(count($args) < 1)
		{
			return [
				'error' => 'Please supply a channel selector.'
			];
		}

		$hub->subscribe($args[0], $agent);

		return $this->subs($router);
	}

	/**
	 * List your current subscriptions.
	 */
	public function subs($router)
	{
		$args  = $router->path()->consumeNodes();
		$hub   = $router->contextGet('__hub');
		$agent = $router->contextGet('__agent');
		
		if(!$router->contextGet('__authed'))
		{
			return [
				'error' => 'You need to auth before you can subs.'
			];
		}

		$channels = array_keys(array_filter($hub->subscriptions($agent)));

		$channels = array_map(function($channel){
			if(is_numeric($channel))
			{
				return '0x' . strtoupper(
					str_pad(
						dechex($channel)
						, 4
						, 0
						, STR_PAD_LEFT
					)
				);
			}

			return $channel;
		}, $channels);

		return ['subscriptions' => $channels];
	}
	
	/**
	 * Unsubscribe from a channel individually or by a selector.
	 */
	public function unsub($router)
	{
		if(!$router->contextGet('__authed'))
		{
			return [
				'error' => 'You need to auth before you can unsub.'
			];
		}

		$args  = $router->path()->consumeNodes();
		$hub   = $router->contextGet('__hub');
		$agent = $router->contextGet('__agent');

		if(count($args) < 1)
		{
			return [
				'error' => 'Please supply a channel selector.'
			];
		}

		$channels = $hub->getChannels($args[0]);

		foreach($channels as $channelName => $channelClass)
		{
			$hub->unsubscribe($channelName, $agent);
		}

		return $this->subs($router);
	}

	/**
	 * List available channels on the server.
	 */
	public function channels($router)
	{
		$args = $router->path()->consumeNodes();
		$hub  = $router->contextGet('__hub');
		$args  = $router->path()->consumeNodes();

		// unset($channels['*']);

		return ['channels' => array_map(
			function($channel)
			{
				if(is_numeric($channel))
				{
					return '0x' . strtoupper(
						str_pad(
							dechex($channel)
							, 4
							, 0
							, STR_PAD_LEFT
						)
					);
				}

				return $channel;
			}
			, array_keys($hub->getChannels($args[0] ?? '*'))
		)];
	}

	/**
	 * Lists available commands.
	 */
	public function commands()
	{
		$reflection = new \ReflectionClass(get_class());
		$methods = $reflection->getMethods(\ReflectionMethod::IS_PUBLIC);

		$_methods = [];

		foreach($methods as $method)
		{
			if($method->name[0] == '_')
			{
				continue;
			}

			if($comment = $method->getDocComment())
			{
				$comment = substr($comment, 3);
				$comment = trim($comment);
				$comment = substr($comment, 2);
				$comment = substr($comment, 0, strlen($comment)-3);
				$comment = trim($comment);

				$_methods[$method->name] = $comment;

				continue;
			}

			$_methods[$method->name] = '';
		}

		return ['commands' => $_methods];
	}

	/**
	 * Print the help page.
	 */
	public function help()
	{
		return new \SeanMorris\SubSpace\Idilic\View\Help;
	}

	public function _dynamic($router)
	{
		$command = $router->path()->getNode();

		if($command == '?')
		{
			return $this->help($router);
		}

		return FALSE;
	}
}
