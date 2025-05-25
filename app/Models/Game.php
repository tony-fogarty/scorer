<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    /**
     * @property int $id
     * @property int $user_id
     * @property string $player1
     * @property string $player2
     * @property array $settings
     * @property array $state
     * @property string $status
     */

    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETE = 'complete';

    protected $fillable = [
        'user_id',
        'player1',
        'player2',
        'settings',
        'state',
        'status',
    ];

    protected $casts = [
        'settings' => 'array',
        'state' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
