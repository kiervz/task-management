<?php

namespace App\Http\Requests\Project;

use App\Models\ProjectMember;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectInviteRequest extends FormRequest
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
            'member_email' => ['required', 'string', 'max:255', 'exists:users,email'],
            'role' => ['required', Rule::in([ProjectMember::ROLE_ADMIN, ProjectMember::ROLE_MEMBER])],
        ];
    }
}
