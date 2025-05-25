<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Game;
use Illuminate\Support\Facades\Auth;
use Inertia\Response;
use Inertia\ResponseFactory;

class GameController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'player1' => 'required|string|max:255',
            'player2' => 'required|string|max:255',
            'throwFirst' => 'required|in:1,2',
            'gameType' => 'required|in:301,501',
            'totalSets' => 'required|integer|min:1|max:11',
            'totalLegs' => 'required|integer|min:1|max:11',
        ]);

        $game = Game::create([
            'user_id' => Auth::id(),
            'player1' => $data['player1'],
            'player2' => $data['player2'],
            'settings' => [
                'throwFirst' => $data['throwFirst'],
                'gameType' => $data['gameType'],
                'totalSets' => $data['totalSets'],
                'totalLegs' => $data['totalLegs'],
            ],
            'state' => [],
            'status' => 'in_progress',
        ]);

        return redirect()->route('game.show', $game->id);
    }

    public function show($id)
    {
        $game = Game::findOrFail($id);

        if ($game->user_id !== Auth::id()) abort(403);

        return Inertia::render('Game/Play', [
            'game' => $game,
        ]);
    }
}
