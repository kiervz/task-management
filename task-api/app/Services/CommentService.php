<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Task;
use App\Models\User;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class CommentService
{
    public function getTaskComments(Task $task, int $perPage)
    {
        return $task->comments()
            ->with('user')
            ->latest()
            ->paginate($perPage);
    }

    public function findCommentById(string $commentId): Comment
    {
        $comment = Comment::query()
            ->with(['task.project', 'user'])
            ->whereKey($commentId)
            ->first();

        if (!$comment) {
            throw new NotFoundHttpException('Comment not found.');
        }

        return $comment;
    }

    public function createComment(Task $task, User $user, array $data): Comment
    {
        $comment = $task->comments()->create([
            'user_id' => $user->id,
            'content' => $data['content'],
        ]);

        return $comment->load('user');
    }

    public function updateComment(Comment $comment, array $data): Comment
    {
        $comment->update($data);

        return $comment->fresh(['task.project', 'user']);
    }

    public function deleteComment(Comment $comment): void
    {
        $comment->delete();
    }
}
