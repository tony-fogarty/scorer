<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\GameController;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->get('/game-settings', function () {
    return Inertia::render('settings/Settings');
})->name('game-settings');


Route::middleware(['auth', 'verified'])
    ->get('/game/{id}', [GameController::class, 'show'])
    ->name('game.show');


Route::middleware(['auth', 'verified'])
    ->post('/game', [GameController::class, 'store'])
    ->name('game.store');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
