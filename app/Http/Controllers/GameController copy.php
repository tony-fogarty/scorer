<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Game;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Services\GameStatsService;

class GameController extends Controller
{
    public function index()
    {
        $games = Game::with(['player1', 'player2'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Game', [
            'games' => $games,
        ]);
    }
    
    public function store(Request $request)
    {
        $data = $request->validate([
            'player1' => 'required|exists:players,id',
            'player2' => 'required|exists:players,id|different:player1',
            'throwFirst' => 'required|in:1,2',
            'gameType' => 'required|in:301,501',
            'totalSets' => 'required|integer|min:1|max:11',
            'totalLegs' => 'required|integer|min:1|max:11',
        ]);

        $game = Game::create([
            'user_id' => Auth::id(),
            'player1_id' => $data['player1'],
            'player2_id' => $data['player2'],
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
        $game = Game::with(['player1', 'player2'])->findOrFail($id);

        if ($game->user_id !== Auth::id()) abort(403);

        return Inertia::render('Game/Play', [
            'game' => $game,
            'player1' => $game->player1,
            'player2' => $game->player2,
        ]);
    }

    /**
     * Update the state of the game (and optionally the status).
     * If the status is set to "complete", redirect to games list with a flash message.
     */
    public function updateState(Request $request, $id)
    {
        $game = Game::findOrFail($id);
        $game->state = $request->input('state');
        if ($request->has('status')) {
            $game->status = $request->input('status');
        }
        $game->save();

        if ($request->has('status') && $request->input('status') === 'complete') {
            // Return 204 No Content (recommended)
            return response()->noContent();
            // Or if you want to send a message:
            // return response()->json(['success' => true, 'message' => 'Game finished!']);
        }

        return response()->json(['success' => true]);
    }

    public function saveStats(Request $request, Game $game)
    {
        $gameId = $game->id;

        // Validate the request
        $request->validate([
            'stats' => 'required|array',
            'stats.*.player_id' => 'required|exists:players,id',
            'stats.*.history' => 'array',
            'stats.*.legs_for' => 'integer',
            'stats.*.legs_against' => 'integer',
            'stats.*.sets_for' => 'integer',
            'stats.*.sets_against' => 'integer',
            'stats.*.least_darts' => 'nullable|integer',
            'stats.*.leg_stats' => 'array',  // <-- ADDED: validate per-leg stats!
        ]);
    
        Log::info('saveStats called', ['gameId' => $gameId, 'payload' => $request->all()]);

        try {
            $service = new GameStatsService();

            foreach ($request->stats as $stat) {
                Log::info('Processing stat', $stat);

                $calculated = $service->calculate(
                    $stat['history'] ?? [],
                    $stat['legs_for'] ?? 0,
                    $stat['legs_against'] ?? 0,
                    $stat['sets_for'] ?? 0,
                    $stat['sets_against'] ?? 0,
                    $stat['player_id'],
                    $gameId,
                    $stat['least_darts'] ?? null,
                    $stat['leg_stats'] ?? []    // <-- ADDED: pass per-leg stats!
                );

                \App\Models\PlayerGameStat::updateOrCreate(
                    [
                        'game_id' => $gameId,
                        'player_id' => $stat['player_id'],
                    ],
                    $calculated
                );
            }
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Error in saveStats', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    public function showSummary($id)
    {
        $game = Game::with(['player1', 'player2', 'playerStats'])->findOrFail($id);

        return Inertia::render('Game/Summary', [
            'game' => $game,
            'player1' => $game->player1,
            'player2' => $game->player2,
            'stats' => $game->playerStats,  // Array of player stats for this game
        ]);
    }
}