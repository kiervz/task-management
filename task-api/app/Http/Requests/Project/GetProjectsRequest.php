<?php

namespace App\Http\Requests\Project;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class GetProjectsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        [$startDateFrom, $startDateTo] = $this->normalizeDateRange($this->input('start_date'));

        $this->merge([
            'status'          => $this->normalizeStringArray($this->input('status')),
            'priority'        => $this->normalizeStringArray($this->input('priority')),
            'search'          => $this->normalizeNullableString($this->input('search')),
            'start_date_from' => $this->normalizeNullableString($this->input('start_date_from') ?? $startDateFrom),
            'start_date_to'   => $this->normalizeNullableString($this->input('start_date_to') ?? $startDateTo),
            'sort_by'         => $this->normalizeNullableString($this->input('sort_by')),
            'sort_dir'        => $this->normalizeNullableString($this->input('sort_dir')),
            'per_page'        => $this->input('per_page'),
        ]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'array'],
            'status.*' => ['string', 'in:planning,active,completed,on_hold,cancelled'],
            'priority' => ['sometimes', 'array'],
            'priority.*' => ['string', 'in:low,medium,high'],
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'start_date_from' => ['sometimes', 'nullable', 'date'],
            'start_date_to' => ['sometimes', 'nullable', 'date', 'after_or_equal:start_date_from'],
            'sort_by' => ['sometimes', 'nullable', 'string', 'in:created_at,name,description,start_date,end_date,status,priority'],
            'sort_dir' => ['sometimes', 'nullable', 'string', 'in:asc,desc'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array{0: ?string, 1: ?string}
     */
    private function normalizeDateRange(mixed $value): array
    {
        if ($value === null) {
            return [null, null];
        }

        if (is_array($value)) {
            $from = $this->normalizeNullableString($value[0] ?? null);
            $to = $this->normalizeNullableString($value[1] ?? null);
            return [$from, $to];
        }

        $parts = explode(',', (string) $value, 2);
        $from = $this->normalizeNullableString($parts[0] ?? null);
        $to = $this->normalizeNullableString($parts[1] ?? null);

        return [$from, $to];
    }

    /**
     * @return array<string>
     */
    private function normalizeStringArray(mixed $value): array
    {
        if ($value === null) {
            return [];
        }

        if (!is_array($value)) {
            $value = explode(',', (string) $value);
        }

        return collect($value)
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
