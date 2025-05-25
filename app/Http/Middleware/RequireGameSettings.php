<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireGameSettings
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // If 'game_settings' not in session, redirect to settings page
        if (!$request->session()->has('game_settings')) {
            // Change '/game-settings' to your settings route if needed
            return redirect('/game-settings')->with('error', 'Please set up a game first.');
        }
        return $next($request);
    }
}
