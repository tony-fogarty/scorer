<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->get('/match-settings', function () {
    return Inertia::render('settings/Settings');
})->name('match-settings');

Route::middleware(['auth', 'verified'])->get('/match', function () {
    return Inertia::render('Match', [
        'player1' => request('player1'),
        'player2' => request('player2'),
        'throwFirst' => request('throwFirst'),
        'gameType' => request('gameType'),
    ]);
})->name('match');


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
