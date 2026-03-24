<?php

namespace App\Http\Requests\Task;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'task_type_id' => ['required', 'string', 'uuid', 'exists:task_types,id'],
            'task_status_id' => ['required', 'string', 'uuid', 'exists:task_statuses,id'],
            'task_priority_id' => ['required', 'string', 'uuid', 'exists:task_priorities,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'assignee_ids' => ['sometimes', 'array'],
            'assignee_ids.*' => ['string', 'uuid', 'exists:users,id'],
        ];
    }
}
