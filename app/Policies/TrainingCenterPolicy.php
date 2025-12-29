<?php

namespace App\Policies;

use App\Models\TrainingCenter;
use App\Models\User;

class TrainingCenterPolicy
{
    /**
     * Determine whether the user can view any training centers.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can create training centers.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the training center.
     */
    public function update(User $user, TrainingCenter $trainingCenter): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the training center.
     */
    public function delete(User $user, TrainingCenter $trainingCenter): bool
    {
        return $user->isAdmin();
    }
}
