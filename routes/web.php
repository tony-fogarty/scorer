<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\MatchController;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->get('/match-settings', function () {
    return Inertia::render('settings/Settings');
})->name('match-settings');

Route::middleware(['auth', 'verified'])->post('/match', [MatchController::class, 'store'])->name('match.store');
Route::middleware(['auth', 'verified'])->get('/match', [MatchController::class, 'show'])->name('match.show');


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
