<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get unread notifications for admin
     */
    public function index()
    {
        $query = Notification::where('is_read', false);
        
        $totalCount = $query->count();
        
        $notifications = $query->orderBy('created_at', 'desc')
            ->limit(15)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'time' => $notification->time_ago,
                    'created_at' => $notification->created_at->toISOString(),
                ];
            });

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $totalCount
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllRead()
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        Notification::where('is_read', false)->update([
            'is_read' => true,
            'updated_at' => now()
        ]);
        
        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Mark single notification as read
     */
    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->update(['is_read' => true]);
        
        return response()->json(['message' => 'Notification marked as read']);
    }
}
