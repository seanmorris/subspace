<?php
namespace SeanMorris\SubSpace;
class EntryRoute implements \SeanMorris\Ids\Routable
{
	public function motd($router)
	{
		$clientId = $router->contextGet('__clientIndex');

		return sprintf('Welcome to the subspace server, %d!', $clientId);
	}

	public function time($router)
	{
		return ['time' => microtime(TRUE)];
	}

	public function auth($router)
	{
		$args   = $router->path()->consumeNodes();

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

	public function commands()
	{
		$reflection = new \ReflectionClass(get_class());
		$methods = $reflection->getMethods(\ReflectionMethod::IS_PUBLIC);
		
		return ['commands' => array_map(
			function($method)
			{
				return $method->name;
			}
			, $methods
		)];
	}
}
