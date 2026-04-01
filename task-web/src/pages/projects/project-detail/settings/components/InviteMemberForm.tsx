import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Shield, Mail } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { getApiError } from '@/lib/getApiError';
import { useInviteProjectMemberMutation } from '@/store/api/projectApi';

import {
  inviteMemberSchema,
  type InviteMemberFormValues,
} from '../schemas/inviteMemberSchema';

type InviteMemberFormProps = {
  projectCode: string;
  canInvite: boolean;
  isLoadingMembers: boolean;
};

export default function InviteMemberForm({
  projectCode,
  canInvite,
  isLoadingMembers,
}: Readonly<InviteMemberFormProps>) {
  const [inviteMember] = useInviteProjectMemberMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { member_email: '', role: 'member' },
    mode: 'onSubmit',
  });

  const role = watch('role');
  const roleLabel = role === 'admin' ? 'Admin' : 'Member';

  const onSubmit = async (values: InviteMemberFormValues) => {
    try {
      const response = await inviteMember({
        projectCode,
        member_email: values.member_email,
        role: values.role,
      }).unwrap();

      toast.success(response.message ?? 'Invitation sent successfully');
      reset();
    } catch (error) {
      const apiError = getApiError(error);
      if (apiError) {
        setError('member_email', { message: apiError.text });
      }
    }
  };

  const renderContent = () => {
    if (isLoadingMembers) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-4" />
          Checking permissions...
        </div>
      );
    }

    if (!canInvite) {
      return (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <Shield className="size-4 mt-0.5 shrink-0" />
          Only project admins can invite members.
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="member_email">Email address</FieldLabel>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="member_email"
                type="email"
                autoComplete="email"
                placeholder="member@example.com"
                disabled={isSubmitting}
                aria-invalid={!!errors.member_email}
                className="pl-9"
                {...register('member_email')}
              />
            </div>
            {errors.member_email?.message && (
              <span className="text-sm text-destructive">
                {errors.member_email.message}
              </span>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="invite_role">Role</FieldLabel>
            <Select
              value={role}
              disabled={isSubmitting}
              onValueChange={(value) =>
                setValue('role', value as 'member' | 'admin', {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="invite_role" aria-invalid={!!errors.role}>
                <SelectValue placeholder="Select role">{roleLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.role?.message && (
              <span className="text-sm text-destructive">
                {errors.role.message}
              </span>
            )}
          </Field>

          <Field>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Spinner className="size-4" />
                  Sending invite...
                </>
              ) : (
                'Send Invite'
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Member</CardTitle>
        <CardDescription>
          Send an invitation to add someone to this project.
        </CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
