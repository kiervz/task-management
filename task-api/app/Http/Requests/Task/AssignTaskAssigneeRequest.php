<?php

namespace App\Http\Requests\Task;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AssignTaskAssigneeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'user_ids' => $this->normalizeUserIds(
                $this->input('user_ids', $this->input('user_id'))
            ),
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['string', 'uuid', 'exists:users,id'],
        ];
    }

    private function normalizeUserIds(mixed $value): array
    {
        if ($value === null) {
            return [];
        }

        return collect(is_array($value) ? $value : [$value])
            ->map(fn (mixed $item) => trim((string) $item))
            ->filter(fn (string $item) => $item !== '')
            ->unique()
            ->values()
            ->all();
    }
}
