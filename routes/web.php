<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\GameController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\SettingsController;

Route::get('/', fn() => Inertia::render('Welcome'))->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('Dashboard'))->name('dashboard');
    Route::get('/game-settings', [SettingsController::class, 'index'])->name('game-settings');
    Route::get('/game/{id}', [GameController::class, 'show'])->name('game.show');
    Route::post('/game', [GameController::class, 'store'])->name('game.store');
    Route::patch('/game/{id}/state', [GameController::class, 'updateState'])->name('game.updateState');
    Route::get('/game/{id}/summary', [GameController::class, 'showSummary'])->name('game.summary');
    Route::get('/games', [GameController::class, 'index'])->name('games.index');
    Route::resource('players', PlayerController::class);
    Route::post('/game/{id}/save-stats', [GameController::class, 'saveStats'])->name('game.saveStats');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';