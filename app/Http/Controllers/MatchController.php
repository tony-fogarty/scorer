<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Inertia\Inertia;


class MatchController extends Controller
{
    public function store(Request $request)
    {
        // Validate and save settings to session or database as needed
        $data = $request->validate([
            'player1' => 'required|string',
            'player2' => 'required|string',
            'throwFirst' => 'required',
            'gameType' => 'required',
            'totalSets' => 'required|integer',
            'totalLegs' => 'required|integer',
        ]);

        // Store in session, or pass via redirect
        session(['match_settings' => $data]);
        
        return redirect()->route('match.show');
    }

    public function show(Request $request)
    {
        // Retrieve settings from session or database
        $settings = session('match_settings', []);

            // Add this to debug:
        Log::info('Match settings:', $settings);

        return Inertia::render('Match', $settings);
    }
}
