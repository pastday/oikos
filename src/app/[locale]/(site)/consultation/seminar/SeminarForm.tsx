"use client";

import { useActionState, useMemo, useState } from "react";
import {
  CheckboxField,
  SpamGuardFields,
  TextAreaField,
  TextField,
} from "@/components/form/Fields";
import {
  FormAlert,
  SubmitButton,
  SuccessPanel,
} from "@/components/form/FormFeedback";
import type { SeminarContent } from "@/content/pages";
import type { Locale } from "@/i18n/config";
import { MAX_ATTENDEES, MIN_ATTENDEES } from "@/lib/validation/inquiry";
import { submitSeminarApplication, type SeminarFormState } from "../actions";

const INITIAL_STATE: SeminarFormState = { status: "idle" };

const EMPTY_VALUES = {
  name: "",
  phone: "",
  email: "",
  preferredSession: "",
  attendeeCount: String(MIN_ATTENDEES),
  memo: "",
};

/**
 * 설명회 신청 폼.
 *
 * 입학상담 폼과 구조는 같지만 입력 항목의 의미가 다르므로 하나의 범용 폼으로 합치지 않는다.
 * 공통되는 부분은 `@/components/form` 의 입력 컴포넌트로만 공유한다. (CLAUDE.md 21항)
 */
export function SeminarForm({
  locale,
  content,
  basePath = "",
}: {
  locale: Locale;
  /**
   * 성공 화면의 안내 링크가 가리킬 사이트. 기본값은 A안(빈 문자열)이다.
   * 디자인 B안이 같은 폼을 그대로 쓰면서 "/design-b" 를 넘긴다. (13단계)
   */
  basePath?: string;
  content: SeminarContent["form"];
}) {
  const action = useMemo(
    () => submitSeminarApplication.bind(null, locale),
    [locale],
  );
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  const [values, setValues] = useState(EMPTY_VALUES);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const { fields, text } = content;
  const fieldErrors = state.status === "invalid" ? state.fieldErrors : {};
  const set = (key: keyof typeof EMPTY_VALUES) => (value: string) =>
    setValues((previous) => ({ ...previous, [key]: value }));

  if (state.status === "success") {
    return (
      <SuccessPanel
        locale={locale}
        basePath={basePath}
        title={text.success.title}
        description={text.success.description}
        links={content.successLinks}
      />
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      {state.status === "invalid" && <FormAlert message={text.invalidAlert} />}
      {state.status === "error" && <FormAlert message={text.serverError} />}

      <SpamGuardFields />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          name="name"
          label={fields.name.label}
          placeholder={fields.name.placeholder}
          autoComplete="name"
          maxLength={60}
          value={values.name}
          onChange={set("name")}
          error={fieldErrors.name && text.errors[fieldErrors.name]}
          required
          requiredMark={text.requiredMark}
          optionalMark={text.optionalMark}
          disabled={isPending}
        />

        <TextField
          name="phone"
          type="tel"
          inputMode="tel"
          label={fields.phone.label}
          placeholder={fields.phone.placeholder}
          hint={fields.phone.hint}
          autoComplete="tel"
          maxLength={30}
          value={values.phone}
          onChange={set("phone")}
          error={fieldErrors.phone && text.errors[fieldErrors.phone]}
          required
          requiredMark={text.requiredMark}
          optionalMark={text.optionalMark}
          disabled={isPending}
        />

        <TextField
          name="email"
          type="email"
          inputMode="email"
          label={fields.email.label}
          placeholder={fields.email.placeholder}
          autoComplete="email"
          maxLength={160}
          value={values.email}
          onChange={set("email")}
          error={fieldErrors.email && text.errors[fieldErrors.email]}
          required
          requiredMark={text.requiredMark}
          optionalMark={text.optionalMark}
          disabled={isPending}
        />

        <TextField
          name="attendeeCount"
          type="number"
          inputMode="numeric"
          min={MIN_ATTENDEES}
          max={MAX_ATTENDEES}
          label={fields.attendeeCount.label}
          hint={fields.attendeeCount.hint}
          value={values.attendeeCount}
          onChange={set("attendeeCount")}
          error={
            fieldErrors.attendeeCount && text.errors[fieldErrors.attendeeCount]
          }
          required
          requiredMark={text.requiredMark}
          optionalMark={text.optionalMark}
          disabled={isPending}
        />
      </div>

      <TextField
        name="preferredSession"
        label={fields.preferredSession.label}
        placeholder={fields.preferredSession.placeholder}
        hint={fields.preferredSession.hint}
        maxLength={200}
        value={values.preferredSession}
        onChange={set("preferredSession")}
        error={
          fieldErrors.preferredSession &&
          text.errors[fieldErrors.preferredSession]
        }
        requiredMark={text.requiredMark}
        optionalMark={text.optionalMark}
        disabled={isPending}
      />

      <TextAreaField
        name="memo"
        label={fields.memo.label}
        placeholder={fields.memo.placeholder}
        rows={5}
        maxLength={2000}
        value={values.memo}
        onChange={set("memo")}
        error={fieldErrors.memo && text.errors[fieldErrors.memo]}
        requiredMark={text.requiredMark}
        optionalMark={text.optionalMark}
        disabled={isPending}
      />

      <CheckboxField
        name="privacyAgreed"
        label={text.privacy.label}
        checked={privacyAgreed}
        onChange={setPrivacyAgreed}
        error={
          fieldErrors.privacyAgreed && text.errors[fieldErrors.privacyAgreed]
        }
        disabled={isPending}
        description={
          <>
            <p>{text.privacy.summary}</p>
            <p className="mt-1.5">{text.privacy.pendingNotice}</p>
          </>
        }
      />

      <div>
        <SubmitButton
          label={text.submit}
          pendingLabel={text.submitting}
          pending={isPending}
        />
      </div>
    </form>
  );
}
