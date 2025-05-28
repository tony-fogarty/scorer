<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('settings/Settings', [
            'players' => Player::orderBy('name')->get(['id', 'name']),
        ]);
    }
}