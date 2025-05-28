<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlayerController extends Controller
{
    // List all players
    public function index()
    {
        $players = Player::orderBy('name')->get();
        return Inertia::render('Players/Index', [
            'players' => $players,
        ]);
    }

    // Show form for creating a new player (optional - can be handled in SPA)
    public function create()
    {
        return Inertia::render('Players/Create');
    }

    // Store a new player
    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255|unique:players,name']);
        Player::create(['name' => $request->name]);
        return redirect()->route('players.index');
    }

    // Show a single player (optional)
    public function show(Player $player)
    {
        return Inertia::render('Players/Show', ['player' => $player]);
    }

    // Show form to edit a player
    public function edit(Player $player)
    {
        return Inertia::render('Players/Edit', ['player' => $player]);
    }

    // Update a player
    public function update(Request $request, Player $player)
    {
        $request->validate(['name' => 'required|string|max:255|unique:players,name,' . $player->id]);
        $player->update(['name' => $request->name]);
        return redirect()->route('players.index');
    }

    // Delete a player
    public function destroy(Player $player)
    {
        $player->delete();
        return redirect()->route('players.index');
    }
}