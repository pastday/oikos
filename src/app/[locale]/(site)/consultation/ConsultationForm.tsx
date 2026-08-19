"use client";

import { useActionState, useMemo, useState } from "react";
import {
  CheckboxField,
  SelectField,
  SpamGuardFields,
  TextAreaField,
  TextField,
} from "@/components/form/Fields";
import {
  FormAlert,
  SubmitButton,
  SuccessPanel,
} from "@/components/form/FormFeedback";
import type { ConsultationContent } from "@/content/pages";
import type { Locale } from "@/i18n/config";
import { submitConsultation, type ConsultationFormState } from "./actions";

const INITIAL_STATE: ConsultationFormState = { status: "idle" };

const EMPTY_VALUES = {
  name: "",
  phone: "",
  email: "",
  interestedProgram: "",
  message: "",
};

/**
 * 입학상담 신청 폼.
 *
 * 입력값을 state 로 들고 있는 이유는 서버가 오류를 돌려줬을 때 사용자가 적은 내용이
 * 그대로 남아 있게 하기 위해서다. 성공하면 폼 자체를 결과 화면으로 교체한다.
 * 검증 결과는 서버가 돌려준 오류 코드만 신뢰한다. 여기서는 문구로 바꿔 보여주기만 한다.
 */
export function ConsultationForm({
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
  content: ConsultationContent["form"];
}) {
  const action = useMemo(() => submitConsultation.bind(null, locale), [locale]);
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

        <SelectField
          name="interestedProgram"
          label={fields.interestedProgram.label}
          placeholder={fields.interestedProgram.placeholder}
          options={fields.interestedProgram.options}
          value={values.interestedProgram}
          onChange={set("interestedProgram")}
          error={
            fieldErrors.interestedProgram &&
            text.errors[fieldErrors.interestedProgram]
          }
          required
          requiredMark={text.requiredMark}
          optionalMark={text.optionalMark}
          disabled={isPending}
        />
      </div>

      <TextAreaField
        name="message"
        label={fields.message.label}
        placeholder={fields.message.placeholder}
        maxLength={2000}
        value={values.message}
        onChange={set("message")}
        error={fieldErrors.message && text.errors[fieldErrors.message]}
        required
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
