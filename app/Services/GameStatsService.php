<?php

namespace App\Services;

class GameStatsService
{
    /**
     * Calculate stats for a player in a game.
     */
    public function calculate(
        array $history,
        int $legsFor,
        int $legsAgainst,
        int $setsFor,
        int $setsAgainst,
        int $playerId,
        int $gameId,
        ?int $leastDarts = null,
        array $legStats = []
    ): array {
        // Score bands (mutually exclusive)
        $scores_0_59 = 0;
        $scores_60_79 = 0;
        $scores_80_99 = 0;
        $scores_100_plus = 0; // 100-139
        $scores_140_plus = 0; // 140-169
        $scores_170_plus = 0; // 170-179
        $scores_180 = 0;      // exactly 180
        $totalScore = 0;

        foreach ($history as $entry) {
            $s = intval($entry['scored'] ?? 0);
            $totalScore += $s;

            if ($s >= 0 && $s <= 59) {
                $scores_0_59++;
            } else if ($s >= 60 && $s <= 79) {
                $scores_60_79++;
            } else if ($s >= 80 && $s <= 99) {
                $scores_80_99++;
            } else if ($s >= 100 && $s <= 139) {
                $scores_100_plus++;
            } else if ($s >= 140 && $s <= 169) {
                $scores_140_plus++;
            } else if ($s >= 170 && $s <= 179) {
                $scores_170_plus++;
            } else if ($s == 180) {
                $scores_180++;
            }
            // No double counting!
        }

        $dartsThrown = count($history) * 3;
        $average = ($dartsThrown > 0) ? ($totalScore / $dartsThrown) : null;
        $threeDartAverage = ($average !== null) ? number_format($average * 3, 2, '.', '') : null;

        // Find ALL winning legs, not just the last
        $winningLegs = array_filter($legStats, function ($leg) {
            return isset($leg['remaining']) && strval($leg['remaining']) === "0";
        });

        // Least darts is the MIN over all winning legs
        $leastDarts = null;
        if (count($winningLegs)) {
            $dartsArr = array_column($winningLegs, 'darts');
            $dartsArr = array_filter($dartsArr, fn($v) => $v !== null && $v !== '');
            if (count($dartsArr)) {
                $leastDarts = min($dartsArr);
            }
        }

        // Highest finish is the MAX over all winning legs
        $highestFinish = null;
        if (count($winningLegs)) {
            $checkouts = array_column($winningLegs, 'checkout');
            $checkouts = array_filter($checkouts, fn($v) => $v !== null && $v !== '');
            if (count($checkouts)) {
                $highestFinish = max($checkouts);
            }
        }

        return [
            'game_id' => $gameId,
            'player_id' => $playerId,
            'legs_for' => $legsFor,
            'legs_against' => $legsAgainst,
            'sets_for' => $setsFor,
            'sets_against' => $setsAgainst,
            'total_score' => $totalScore,
            'darts_thrown' => $dartsThrown,
            'average' => ($average !== null) ? number_format($average, 2, '.', '') : null,
            'three_dart_average' => $threeDartAverage,
            'scores_0_59' => $scores_0_59,
            'scores_60_79' => $scores_60_79,
            'scores_80_99' => $scores_80_99,
            'scores_100_plus' => $scores_100_plus,
            'scores_140_plus' => $scores_140_plus,
            'scores_170_plus' => $scores_170_plus,
            'scores_180' => $scores_180,
            'least_darts' => $leastDarts,
            'high_finish' => $highestFinish,
        ];
    }
}