<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Game;
use Illuminate\Support\Facades\Auth;


class GameController extends Controller
{
    public function store(Request $request)
    {
        // Validate and save settings to session or database as needed
        $data = $request->validate([
            'player1' => 'required|string|max:255',
            'player2' => 'required|string|max:255',
            'settings' => 'required|array',
            'throwFirst' => 'required',
            'gameType' => 'required',
            'totalSets' => 'required|integer',
            'totalLegs' => 'required|integer',
        ]);

        $game = Game::create([
            'user_id' => Auth::id(),
            'player1' => $data['player1'],
            'player2' => $data['player2'],
            'settings' => $data['settings'],
            'state' => [], // Empty game state at start
            'status' => 'in_progress',
        ]);
        
        //redirect to the game show route
        return redirect()->route('game.show');
    }

    public function show($id)
    {
        $game = Game::findOrFail($id);

        // Optionally, you could check that the authenticated user owns this game
        // if ($game->user_id !== Auth::id()) abort(403);

        return Inertia::render('Game/Play', [
            'game' => $game,
        ]);
    }
}
