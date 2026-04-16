<?php

namespace App\Http\Requests\Task;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class GetTasksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'task_status' => $this->normalizeStringArray($this->input('task_status')),
            'task_type' => $this->normalizeStringArray($this->input('task_type')),
            'task_priority' => $this->normalizeStringArray($this->input('task_priority')),
            'due' => $this->normalizeNullableString($this->input('due')),
            'assignee_id' => $this->normalizeNullableString($this->input('assignee_id')),
            'search' => $this->normalizeNullableString($this->input('search')),
            'due_from' => $this->normalizeNullableString($this->input('due_from')),
            'due_to' => $this->normalizeNullableString($this->input('due_to')),
            'sort_by' => $this->normalizeNullableString($this->input('sort_by')),
            'sort_dir' => $this->normalizeNullableString($this->input('sort_dir')),
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'task_status' => ['sometimes', 'array'],
            'task_status.*' => ['string'],
            'task_type' => ['sometimes', 'array'],
            'task_type.*' => ['string'],
            'task_priority' => ['sometimes', 'array'],
            'task_priority.*' => ['string'],
            'due' => ['sometimes', 'nullable', 'string', 'in:overdue,today,this_week,this_month,not_due'],
            'assignee_id' => ['sometimes', 'nullable', 'uuid'],
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'due_from' => ['sometimes', 'nullable', 'date'],
            'due_to' => ['sometimes', 'nullable', 'date', 'after_or_equal:due_from'],
            'sort_by' => ['sometimes', 'nullable', 'string', 'in:due_date,created_at,updated_at,title'],
            'sort_dir' => ['sometimes', 'nullable', 'string', 'in:asc,desc'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ];
    }

    private function normalizeStringArray(mixed $value): array
    {
        if ($value === null) {
            return [];
        }

        return collect(is_array($value) ? $value : [$value])
            ->map(fn (mixed $item) => trim((string) $item))
            ->filter(fn (string $item) => $item !== '')
            ->values()
            ->all();
    }

    private function normalizeNullableString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = trim((string) $value);

        return $normalized === '' ? null : $normalized;
    }
}
