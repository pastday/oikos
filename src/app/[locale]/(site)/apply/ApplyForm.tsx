"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CheckboxField,
  SelectField,
  SpamGuardFields,
  TextAreaField,
  TextField,
} from "@/components/form/Fields";
import { FormAlert, SubmitButton } from "@/components/form/FormFeedback";
import { SignaturePad } from "@/components/admission/SignaturePad";
import {
  getAdmissionContent,
  type AdmissionContent,
} from "@/content/admission";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { localePath } from "@/lib/navigation";
import {
  acceptAttribute,
  ADMISSION_STEP_COUNT,
  admissionUploadSlots,
  formatFileSize,
  MAX_CAREER_ROWS,
  MAX_EDUCATION_ROWS,
  MAX_TOTAL_UPLOAD_BYTES,
  type AdmissionFieldErrors,
  type UploadSlotField,
} from "@/lib/admission/form-config";
import {
  admissionDocumentList,
  type AdmissionDocumentKey,
} from "@/lib/admission/documents";
import {
  submitAdmissionApplication,
  type AdmissionFormState,
} from "./actions";

/**
 * 온라인 입학신청 폼. (18단계)
 *
 * ## 왜 STEP 을 URL 이 아니라 화면 안에서 나누는가
 *
 * 임시저장이 없어 **모든 입력이 한 번에 제출**되어야 한다. (지시 19·20항)
 * STEP 마다 페이지를 나누면 이동할 때 값을 어딘가 보관해야 하고, 그러면
 * 결국 임시저장을 만드는 셈이 된다. 그래서 `<form>` 은 하나이고
 * 보이지 않는 단계는 `display:none` 으로 숨긴다. **숨겨진 입력도 함께 제출된다.**
 * (`disabled` 가 아니라 숨기는 것이므로 값이 빠지지 않는다)
 *
 * ## 서버가 오류를 돌려주면
 *
 * 액션이 오류가 있는 첫 STEP 번호를 함께 돌려주고 폼이 그 단계로 이동한다.
 * 폼은 다시 마운트되지 않으므로 **선택해 둔 파일도 그대로 남는다.**
 *
 * ## 검증
 *
 * 여기서 하는 확인은 편의 기능이다. 저장 여부는 서버만 결정한다.
 * 다만 **첨부파일 합계 용량만은 미리 막는다.** 그 한도를 넘으면 요청이 서버 검증에
 * 닿기도 전에 끊겨(413) 사용자에게 원인을 알려줄 수 없기 때문이다.
 */

const INITIAL_STATE: AdmissionFormState = { status: "idle" };

type TextValues = {
  program: string;
  admissionYear: string;
  admissionTerm: string;
  nameKo: string;
  nameEn: string;
  residentNumber: string;
  birthDate: string;
  gender: string;
  nationality: string;
  birthplace: string;
  addressKo: string;
  addressEn: string;
  phone: string;
  email: string;
  usCitizen: string;
  maritalStatus: string;
  driversLicenseNumber: string;
  driversLicenseIssuedAt: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  emergencyAddress: string;
  personalIntroduction: string;
  motivation: string;
  studyPlan: string;
};

const EMPTY_VALUES: TextValues = {
  program: "",
  admissionYear: "",
  admissionTerm: "",
  nameKo: "",
  nameEn: "",
  residentNumber: "",
  birthDate: "",
  gender: "",
  nationality: "",
  birthplace: "",
  addressKo: "",
  addressEn: "",
  phone: "",
  email: "",
  usCitizen: "",
  maritalStatus: "",
  driversLicenseNumber: "",
  driversLicenseIssuedAt: "",
  emergencyName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
  emergencyAddress: "",
  personalIntroduction: "",
  motivation: "",
  studyPlan: "",
};

type EducationRow = {
  schoolName: string;
  schoolAddress: string;
  period: string;
  degreeName: string;
};

type CareerRow = { organization: string; period: string; position: string };

const EMPTY_EDUCATION: EducationRow = {
  schoolName: "",
  schoolAddress: "",
  period: "",
  degreeName: "",
};

const EMPTY_CAREER: CareerRow = { organization: "", period: "", position: "" };

export function ApplyForm({
  locale,
  years,
}: {
  locale: Locale;
  /** 선택 가능한 입학 연도. 서버에서 계산해 넘긴다. */
  years: number[];
}) {
  // 문구에 함수가 있어 서버에서 props 로 넘기면 정적 생성이 실패한다.
  // 클라이언트에서 같은 소스를 읽는다.
  const content = getAdmissionContent(locale);
  const action = useMemo(
    () => submitAdmissionApplication.bind(null, locale),
    [locale],
  );
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  const [step, setStep] = useState(1);
  /** 마지막으로 반응한 제출 결과. 아래 "렌더 중 상태 조정" 에서 쓴다. */
  const [handledState, setHandledState] = useState<AdmissionFormState>(state);
  const [values, setValues] = useState<TextValues>(EMPTY_VALUES);
  const [educations, setEducations] = useState<EducationRow[]>([
    { ...EMPTY_EDUCATION },
  ]);
  const [careers, setCareers] = useState<CareerRow[]>([{ ...EMPTY_CAREER }]);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [agreements, setAgreements] = useState<
    Record<AdmissionDocumentKey, boolean>
  >({
    institutionalPurpose: false,
    codeOfConduct: false,
    statementOfFaith: false,
  });
  const [signedNames, setSignedNames] = useState<
    Record<AdmissionDocumentKey, string>
  >({
    institutionalPurpose: "",
    codeOfConduct: "",
    statementOfFaith: "",
  });
  const [fileSizes, setFileSizes] = useState<
    Partial<Record<UploadSlotField, number>>
  >({});

  const headingRef = useRef<HTMLDivElement>(null);

  const fieldErrors: AdmissionFieldErrors =
    state.status === "invalid" ? state.fieldErrors : {};

  /**
   * 서버가 오류를 돌려주면 그 단계로 이동한다.
   *
   * `useEffect` 대신 **렌더 중 상태 조정**을 쓴다. effect 로 하면 잘못된 단계를 한 번 그린 뒤
   * 다시 그리게 되고, React 도 이 방식을 권한다.
   * (react.dev — "You Might Not Need an Effect / 이전 렌더와 값이 달라졌을 때 조정하기")
   *
   * `handledState` 는 이미 반응한 제출 결과다. 그래서 사용자가 오류 안내를 보고
   * 다른 단계로 옮겨도 다시 끌려오지 않는다.
   */
  if (state !== handledState) {
    setHandledState(state);
    if (state.status === "invalid" && state.step !== step) {
      setStep(state.step);
    }
  }

  /** 단계를 옮기면 화면 맨 위 제목으로 초점을 보낸다. 긴 폼에서 위치를 잃지 않게 한다. */
  useEffect(() => {
    headingRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [step]);

  const totalBytes = Object.values(fileSizes).reduce(
    (sum, size) => sum + (size ?? 0),
    0,
  );
  const overTotalLimit = totalBytes > MAX_TOTAL_UPLOAD_BYTES;

  const set = (key: keyof TextValues) => (value: string) =>
    setValues((previous) => ({ ...previous, [key]: value }));

  const error = (key: keyof AdmissionFieldErrors) => {
    const code = fieldErrors[key];
    return code ? content.errors[code] : undefined;
  };

  const marks = {
    requiredMark: content.common.requiredMark,
    optionalMark: content.common.optionalMark,
  };

  // -------------------------------------------------------------------------
  // 제출 완료
  // -------------------------------------------------------------------------

  if (state.status === "success") {
    return (
      <SubmittedPanel
        locale={locale}
        content={content}
        applicationNo={state.applicationNo}
        program={state.program}
        name={state.name}
      />
    );
  }

  // -------------------------------------------------------------------------

  return (
    <form action={formAction} noValidate className="flex flex-col gap-8">
      <SpamGuardFields />

      <div ref={headingRef} className="scroll-mt-28">
        <StepIndicator
          steps={content.steps}
          current={step}
          label={content.common.stepLabel(step, ADMISSION_STEP_COUNT)}
        />
      </div>

      {state.status === "invalid" && (
        <FormAlert message={content.alerts.invalid} />
      )}
      {state.status === "error" && (
        <FormAlert
          message={
            state.reason === "totalTooLarge"
              ? content.alerts.totalTooLarge
              : content.alerts.server
          }
        />
      )}

      {/* ---------------------------------------------------------------- */}
      {/* STEP 1 — 기본정보                                                 */}
      {/* ---------------------------------------------------------------- */}
      <StepPanel
        active={step === 1}
        title={content.step1.title}
        description={content.step1.description}
      >
        <FieldGroup title={content.step1.programSection}>
          <div className="grid gap-6 sm:grid-cols-3">
            <SelectField
              name="program"
              label={content.step1.program.label}
              placeholder={content.common.selectPlaceholder}
              options={toOptions(content.step1.program.options)}
              value={values.program}
              onChange={set("program")}
              error={error("program")}
              required
              {...marks}
              disabled={isPending}
            />
            <SelectField
              name="admissionYear"
              label={content.step1.admissionYear.label}
              placeholder={content.common.selectPlaceholder}
              options={years.map((year) => ({
                value: String(year),
                label: String(year),
              }))}
              value={values.admissionYear}
              onChange={set("admissionYear")}
              error={error("admissionYear")}
              required
              {...marks}
              disabled={isPending}
            />
            <SelectField
              name="admissionTerm"
              label={content.step1.admissionTerm.label}
              placeholder={content.common.selectPlaceholder}
              options={toOptions(content.step1.admissionTerm.options)}
              value={values.admissionTerm}
              onChange={set("admissionTerm")}
              error={error("admissionTerm")}
              required
              {...marks}
              disabled={isPending}
            />
          </div>
        </FieldGroup>

        <FieldGroup title={content.step1.personalSection}>
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="nameKo"
              label={content.step1.nameKo.label}
              placeholder={content.step1.nameKo.placeholder}
              autoComplete="name"
              maxLength={60}
              value={values.nameKo}
              onChange={set("nameKo")}
              error={error("nameKo")}
              required
              {...marks}
              disabled={isPending}
            />
            <TextField
              name="nameEn"
              label={content.step1.nameEn.label}
              placeholder={content.step1.nameEn.placeholder}
              hint={content.step1.nameEn.hint}
              maxLength={60}
              value={values.nameEn}
              onChange={set("nameEn")}
              error={error("nameEn")}
              required
              {...marks}
              disabled={isPending}
            />
            <TextField
              name="residentNumber"
              label={content.step1.residentNumber.label}
              placeholder={content.step1.residentNumber.placeholder}
              hint={content.step1.residentNumber.hint}
              inputMode="numeric"
              autoComplete="off"
              maxLength={14}
              value={values.residentNumber}
              onChange={set("residentNumber")}
              error={error("residentNumber")}
              required
              {...marks}
              disabled={isPending}
            />
            <DateField
              name="birthDate"
              label={content.step1.birthDate.label}
              value={values.birthDate}
              onChange={set("birthDate")}
              error={error("birthDate")}
              {...marks}
              disabled={isPending}
            />
            <SelectField
              name="gender"
              label={content.step1.gender.label}
              placeholder={content.common.selectPlaceholder}
              options={toOptions(content.step1.gender.options)}
              value={values.gender}
              onChange={set("gender")}
              error={error("gender")}
              required
              {...marks}
              disabled={isPending}
            />
            <SelectField
              name="usCitizen"
              label={content.step1.usCitizen.label}
              placeholder={content.common.selectPlaceholder}
              options={toOptions(content.step1.usCitizen.options)}
              value={values.usCitizen}
              onChange={set("usCitizen")}
              error={error("usCitizen")}
              required
              {...marks}
              disabled={isPending}
            />
            <TextField
              name="nationality"
              label={content.step1.nationality.label}
              placeholder={content.step1.nationality.placeholder}
              maxLength={120}
              value={values.nationality}
              onChange={set("nationality")}
              error={error("nationality")}
              required
              {...marks}
              disabled={isPending}
            />
            <TextField
              name="birthplace"
              label={content.step1.birthplace.label}
              placeholder={content.step1.birthplace.placeholder}
              maxLength={120}
              value={values.birthplace}
              onChange={set("birthplace")}
              error={error("birthplace")}
              required
              {...marks}
              disabled={isPending}
            />
            <TextField
              name="phone"
              type="tel"
              inputMode="tel"
              label={content.step1.phone.label}
              placeholder={content.step1.phone.placeholder}
              autoComplete="tel"
              maxLength={30}
              value={values.phone}
              onChange={set("phone")}
              error={error("phone")}
              required
              {...marks}
              disabled={isPending}
            />
            <TextField
              name="email"
              type="email"
              inputMode="email"
              label={content.step1.email.label}
              placeholder={content.step1.email.placeholder}
              autoComplete="email"
              maxLength={160}
              value={values.email}
              onChange={set("email")}
              error={error("email")}
              required
              {...marks}
              disabled={isPending}
            />
          </div>

          <div className="mt-6 grid gap-6">
            <TextField
              name="addressKo"
              label={content.step1.addressKo.label}
              placeholder={content.step1.addressKo.placeholder}
              autoComplete="street-address"
              maxLength={300}
              value={values.addressKo}
              onChange={set("addressKo")}
              error={error("addressKo")}
              required
              {...marks}
              disabled={isPending}
            />
            <TextField
              name="addressEn"
              label={content.step1.addressEn.label}
              placeholder={content.step1.addressEn.placeholder}
              maxLength={300}
              value={values.addressEn}
              onChange={set("addressEn")}
              error={error("addressEn")}
              required
              {...marks}
              disabled={isPending}
            />
          </div>
        </FieldGroup>

        <FieldGroup title={content.step1.emergencySection}>
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              name="emergencyName"
              label={content.step1.emergencyName.label}
              maxLength={60}
              value={values.emergencyName}
              onChange={set("emergencyName")}
              error={error("emergencyName")}
              required
              {...marks}
              disabled={isPending}
            />
            <TextField
              name="emergencyRelationship"
              label={content.step1.emergencyRelationship.label}
              placeholder={content.step1.emergencyRelationship.placeholder}
              maxLength={120}
              value={values.emergencyRelationship}
              onChange={set("emergencyRelationship")}
              error={error("emergencyRelationship")}
              required
              {...marks}
              disabled={isPending}
            />
            <TextField
              name="emergencyPhone"
              type="tel"
              inputMode="tel"
              label={content.step1.emergencyPhone.label}
              placeholder={content.step1.emergencyPhone.placeholder}
              maxLength={30}
              value={values.emergencyPhone}
              onChange={set("emergencyPhone")}
              error={error("emergencyPhone")}
              required
              {...marks}
              disabled={isPending}
            />
            <TextField
              name="emergencyAddress"
              label={content.step1.emergencyAddress.label}
              maxLength={300}
              value={values.emergencyAddress}
              onChange={set("emergencyAddress")}
              error={error("emergencyAddress")}
              required
              {...marks}
              disabled={isPending}
            />
          </div>
        </FieldGroup>

        <FieldGroup title={content.step1.otherSection}>
          <div className="grid gap-6 sm:grid-cols-3">
            <SelectField
              name="maritalStatus"
              label={content.step1.maritalStatus.label}
              placeholder={content.common.selectPlaceholder}
              options={toOptions(content.step1.maritalStatus.options)}
              value={values.maritalStatus}
              onChange={set("maritalStatus")}
              error={error("maritalStatus")}
              {...marks}
              disabled={isPending}
            />
            <TextField
              name="driversLicenseNumber"
              label={content.step1.driversLicenseNumber.label}
              maxLength={120}
              value={values.driversLicenseNumber}
              onChange={set("driversLicenseNumber")}
              error={error("driversLicenseNumber")}
              {...marks}
              disabled={isPending}
            />
            <TextField
              name="driversLicenseIssuedAt"
              label={content.step1.driversLicenseIssuedAt.label}
              maxLength={120}
              value={values.driversLicenseIssuedAt}
              onChange={set("driversLicenseIssuedAt")}
              error={error("driversLicenseIssuedAt")}
              {...marks}
              disabled={isPending}
            />
          </div>
        </FieldGroup>
      </StepPanel>

      {/* ---------------------------------------------------------------- */}
      {/* STEP 2 — 학력 · 경력                                              */}
      {/* ---------------------------------------------------------------- */}
      <StepPanel
        active={step === 2}
        title={content.step2.title}
        description={content.step2.description}
      >
        <FieldGroup
          title={content.step2.educationTitle}
          hint={content.step2.educationHint}
          error={error("educations")}
        >
          <div className="flex flex-col gap-5">
            {educations.map((row, index) => (
              <RepeatRow
                key={`education-${index}`}
                label={content.step2.rowLabel(index + 1)}
                removeLabel={content.step2.removeRow}
                onRemove={
                  educations.length > 1
                    ? () =>
                        setEducations((rows) =>
                          rows.filter((_, i) => i !== index),
                        )
                    : undefined
                }
                disabled={isPending}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    name="educationSchoolName"
                    label={content.step2.schoolName.label}
                    maxLength={200}
                    value={row.schoolName}
                    onChange={(value) =>
                      setEducations((rows) =>
                        updateRow(rows, index, { schoolName: value }),
                      )
                    }
                    required
                    {...marks}
                    disabled={isPending}
                  />
                  <TextField
                    name="educationDegreeName"
                    label={content.step2.degreeName.label}
                    placeholder={content.step2.degreeName.placeholder}
                    maxLength={200}
                    value={row.degreeName}
                    onChange={(value) =>
                      setEducations((rows) =>
                        updateRow(rows, index, { degreeName: value }),
                      )
                    }
                    {...marks}
                    disabled={isPending}
                  />
                  <TextField
                    name="educationPeriod"
                    label={content.step2.period.label}
                    placeholder={content.step2.period.placeholder}
                    maxLength={200}
                    value={row.period}
                    onChange={(value) =>
                      setEducations((rows) =>
                        updateRow(rows, index, { period: value }),
                      )
                    }
                    {...marks}
                    disabled={isPending}
                  />
                  <TextField
                    name="educationSchoolAddress"
                    label={content.step2.schoolAddress.label}
                    maxLength={200}
                    value={row.schoolAddress}
                    onChange={(value) =>
                      setEducations((rows) =>
                        updateRow(rows, index, { schoolAddress: value }),
                      )
                    }
                    {...marks}
                    disabled={isPending}
                  />
                </div>
              </RepeatRow>
            ))}
          </div>

          <AddRowButton
            label={content.step2.addEducation}
            disabled={isPending || educations.length >= MAX_EDUCATION_ROWS}
            onClick={() =>
              setEducations((rows) => [...rows, { ...EMPTY_EDUCATION }])
            }
          />
        </FieldGroup>

        <FieldGroup
          title={content.step2.careerTitle}
          hint={content.step2.careerHint}
        >
          <div className="flex flex-col gap-5">
            {careers.map((row, index) => (
              <RepeatRow
                key={`career-${index}`}
                label={content.step2.rowLabel(index + 1)}
                removeLabel={content.step2.removeRow}
                onRemove={
                  careers.length > 1
                    ? () =>
                        setCareers((rows) => rows.filter((_, i) => i !== index))
                    : undefined
                }
                disabled={isPending}
              >
                <div className="grid gap-5 sm:grid-cols-3">
                  <TextField
                    name="careerOrganization"
                    label={content.step2.organization.label}
                    maxLength={200}
                    value={row.organization}
                    onChange={(value) =>
                      setCareers((rows) =>
                        updateRow(rows, index, { organization: value }),
                      )
                    }
                    {...marks}
                    disabled={isPending}
                  />
                  <TextField
                    name="careerPeriod"
                    label={content.step2.careerPeriod.label}
                    placeholder={content.step2.careerPeriod.placeholder}
                    maxLength={200}
                    value={row.period}
                    onChange={(value) =>
                      setCareers((rows) =>
                        updateRow(rows, index, { period: value }),
                      )
                    }
                    {...marks}
                    disabled={isPending}
                  />
                  <TextField
                    name="careerPosition"
                    label={content.step2.position.label}
                    maxLength={200}
                    value={row.position}
                    onChange={(value) =>
                      setCareers((rows) =>
                        updateRow(rows, index, { position: value }),
                      )
                    }
                    {...marks}
                    disabled={isPending}
                  />
                </div>
              </RepeatRow>
            ))}
          </div>

          <AddRowButton
            label={content.step2.addCareer}
            disabled={isPending || careers.length >= MAX_CAREER_ROWS}
            onClick={() => setCareers((rows) => [...rows, { ...EMPTY_CAREER }])}
          />
        </FieldGroup>
      </StepPanel>

      {/* ---------------------------------------------------------------- */}
      {/* STEP 3 — 자기소개                                                 */}
      {/* ---------------------------------------------------------------- */}
      <StepPanel
        active={step === 3}
        title={content.step3.title}
        description={content.step3.description}
      >
        <div className="grid gap-6">
          <TextAreaField
            name="personalIntroduction"
            label={content.step3.personalIntroduction.label}
            placeholder={content.step3.personalIntroduction.placeholder}
            maxLength={4000}
            rows={7}
            value={values.personalIntroduction}
            onChange={set("personalIntroduction")}
            error={error("personalIntroduction")}
            required
            {...marks}
            disabled={isPending}
          />
          <TextAreaField
            name="motivation"
            label={content.step3.motivation.label}
            placeholder={content.step3.motivation.placeholder}
            maxLength={4000}
            rows={7}
            value={values.motivation}
            onChange={set("motivation")}
            error={error("motivation")}
            required
            {...marks}
            disabled={isPending}
          />
          <TextAreaField
            name="studyPlan"
            label={content.step3.studyPlan.label}
            placeholder={content.step3.studyPlan.placeholder}
            maxLength={4000}
            rows={7}
            value={values.studyPlan}
            onChange={set("studyPlan")}
            error={error("studyPlan")}
            required
            {...marks}
            disabled={isPending}
          />
        </div>
      </StepPanel>

      {/* ---------------------------------------------------------------- */}
      {/* STEP 4 — 확인서 · 서명                                            */}
      {/* ---------------------------------------------------------------- */}
      <StepPanel
        active={step === 4}
        title={content.step4.title}
        description={content.step4.description}
      >
        <p className="rounded-md border border-dashed border-line bg-surface px-4 py-3 text-xs leading-relaxed text-muted">
          {content.notices.documentLanguage}
        </p>

        <div className="mt-6 flex flex-col gap-8">
          {admissionDocumentList.map((document) => (
            <section
              key={document.key}
              className="rounded-lg border border-line bg-background"
            >
              <header className="border-b border-line px-5 py-4">
                <h3 className="font-serif text-lg font-bold text-navy">
                  {document.title}
                </h3>
              </header>

              {/* 원문은 우리가 만든 상수다. HTML 로 렌더링하지 않는다. */}
              <div className="max-h-80 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-foreground/80">
                {document.blocks.map((block, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    {block.heading && (
                      <h4 className="mb-1.5 text-sm font-semibold text-navy">
                        {block.heading}
                      </h4>
                    )}
                    {block.paragraphs?.map((paragraph, position) => (
                      <p key={position} className="mb-2 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                    {block.items && (
                      <ul className="mt-1.5 list-disc space-y-1 pl-5">
                        {block.items.map((item, position) => (
                          <li key={position}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-5 border-t border-line bg-surface px-5 py-5">
                <p className="text-sm font-medium text-foreground/85">
                  {document.attestation}
                </p>

                <CheckboxField
                  name={`agreed_${document.key}`}
                  label={content.step4.agreeLabel}
                  checked={agreements[document.key]}
                  onChange={(checked) =>
                    setAgreements((previous) => ({
                      ...previous,
                      [document.key]: checked,
                    }))
                  }
                  error={error(document.key)}
                  disabled={isPending}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    name={`signedName_${document.key}`}
                    label={content.step4.signedNameLabel}
                    placeholder={content.step4.signedNamePlaceholder}
                    maxLength={60}
                    value={signedNames[document.key]}
                    onChange={(value) =>
                      setSignedNames((previous) => ({
                        ...previous,
                        [document.key]: value,
                      }))
                    }
                    required
                    {...marks}
                    disabled={isPending}
                  />

                  <div className="flex items-end pb-1 text-xs text-muted">
                    {content.step4.dateNotice}
                  </div>
                </div>

                <SignaturePad
                  name={`signature_${document.key}`}
                  label={content.step4.signatureLabel}
                  hint={content.step4.signatureHint}
                  clearLabel={content.step4.signatureClear}
                  doneLabel={content.step4.signatureDone}
                  disabled={isPending}
                />
              </div>
            </section>
          ))}
        </div>
      </StepPanel>

      {/* ---------------------------------------------------------------- */}
      {/* STEP 5 — 서류 · 제출                                              */}
      {/* ---------------------------------------------------------------- */}
      <StepPanel
        active={step === 5}
        title={content.step5.title}
        description={content.step5.description}
      >
        <FieldGroup
          title={content.step5.requiredTitle}
          hint={content.step5.fileHint}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {admissionUploadSlots
              .filter((slot) => slot.required)
              .map((slot) => (
                <FileField
                  key={slot.field}
                  slot={slot}
                  text={content.step5.files[slot.field]}
                  marks={marks}
                  error={error(slot.field)}
                  disabled={isPending}
                  onSize={(size) =>
                    setFileSizes((previous) => ({
                      ...previous,
                      [slot.field]: size,
                    }))
                  }
                />
              ))}
          </div>
        </FieldGroup>

        <FieldGroup
          title={content.step5.optionalTitle}
          hint={content.step5.totalLimitHint}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {admissionUploadSlots
              .filter((slot) => !slot.required)
              .map((slot) => (
                <FileField
                  key={slot.field}
                  slot={slot}
                  text={content.step5.files[slot.field]}
                  marks={marks}
                  error={error(slot.field)}
                  disabled={isPending}
                  onSize={(size) =>
                    setFileSizes((previous) => ({
                      ...previous,
                      [slot.field]: size,
                    }))
                  }
                />
              ))}
          </div>

          <p
            className={cn(
              "mt-4 text-xs font-medium",
              overTotalLimit ? "text-[#b3261e]" : "text-muted",
            )}
          >
            {formatFileSize(totalBytes)} /{" "}
            {formatFileSize(MAX_TOTAL_UPLOAD_BYTES)}
          </p>
        </FieldGroup>

        <div className="mt-6">
          <CheckboxField
            name="privacyAgreed"
            label={content.step5.privacyLabel}
            checked={privacyAgreed}
            onChange={setPrivacyAgreed}
            error={error("privacyAgreed")}
            disabled={isPending}
            description={
              <>
                <p>{content.step5.privacySummary}</p>
                <p className="mt-1.5">{content.notices.privacyPending}</p>
              </>
            }
          />
        </div>

        {overTotalLimit && (
          <div className="mt-5">
            <FormAlert message={content.alerts.totalTooLarge} />
          </div>
        )}
      </StepPanel>

      {/* ---------------------------------------------------------------- */}

      <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(1, current - 1))}
          disabled={step === 1 || isPending}
          className="inline-flex rounded-md border border-line px-6 py-3 text-sm font-semibold text-muted transition-colors hover:border-navy hover:text-navy disabled:cursor-not-allowed disabled:opacity-50"
        >
          {content.common.previous}
        </button>

        {step < ADMISSION_STEP_COUNT ? (
          <button
            type="button"
            onClick={() =>
              setStep((current) => Math.min(ADMISSION_STEP_COUNT, current + 1))
            }
            disabled={isPending}
            className="inline-flex rounded-md bg-navy px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-soft disabled:cursor-not-allowed disabled:bg-muted"
          >
            {content.common.next}
          </button>
        ) : (
          <div className={overTotalLimit ? "pointer-events-none opacity-50" : ""}>
            <SubmitButton
              label={content.common.submit}
              pendingLabel={content.common.submitting}
              pending={isPending || overTotalLimit}
            />
          </div>
        )}
      </nav>

      <p className="text-xs leading-relaxed text-muted">
        <Link
          href={localePath(locale, "/consultation")}
          className="text-navy underline-offset-4 hover:underline"
        >
          {content.eligibility.cta}
        </Link>
      </p>
    </form>
  );
}

// ---------------------------------------------------------------------------
// 조각들
// ---------------------------------------------------------------------------

function toOptions(options: Record<string, string>) {
  return Object.entries(options).map(([value, label]) => ({ value, label }));
}

/** 배열 한 줄만 바꾸는 setState 업데이터. 세 곳에서 같은 모양이라 함수로 뽑았다. */
function updateRow<Row>(
  rows: Row[],
  index: number,
  patch: Partial<Row>,
): Row[] {
  return rows.map((row, position) =>
    position === index ? { ...row, ...patch } : row,
  );
}

function StepIndicator({
  steps,
  current,
  label,
}: {
  steps: readonly string[];
  current: number;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold tracking-[0.12em] text-gold uppercase">
        {label}
      </p>
      <ol className="flex flex-wrap gap-2">
        {steps.map((title, index) => {
          const number = index + 1;
          const state =
            number === current
              ? "border-navy bg-navy text-white"
              : number < current
                ? "border-navy/30 bg-navy-tint text-navy"
                : "border-line bg-surface text-muted";

          return (
            <li
              key={title}
              aria-current={number === current ? "step" : undefined}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium",
                state,
              )}
            >
              <span className="mr-1.5 font-semibold">{number}</span>
              {title}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * 단계 하나. **보이지 않을 때도 DOM 에 남는다.**
 * `display:none` 은 폼 제출에 영향을 주지 않으므로 숨은 단계의 입력도 함께 전송된다.
 */
function StepPanel({
  active,
  title,
  description,
  children,
}: {
  active: boolean;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className={active ? "flex flex-col gap-6" : "hidden"}>
      <header>
        <h2 className="font-serif text-xl font-bold text-navy">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {description}
        </p>
      </header>
      {children}
    </section>
  );
}

function FieldGroup({
  title,
  hint,
  error,
  children,
}: {
  title: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-line pt-6 first:border-t-0 first:pt-0">
      <div>
        <h3 className="text-sm font-semibold tracking-[0.08em] text-navy uppercase">
          {title}
        </h3>
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        {error && (
          <p className="mt-1.5 text-xs font-medium text-[#b3261e]" role="alert">
            {error}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function RepeatRow({
  label,
  removeLabel,
  onRemove,
  disabled,
  children,
}: {
  label: string;
  removeLabel: string;
  onRemove?: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">{label}</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="text-xs font-medium text-muted underline-offset-4 hover:text-[#b3261e] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {removeLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function AddRowButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="self-start rounded-md border border-dashed border-navy/40 px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-navy hover:bg-navy-tint disabled:cursor-not-allowed disabled:border-line disabled:text-muted"
    >
      {label}
    </button>
  );
}

/**
 * 날짜 입력.
 *
 * 공용 `TextField` 는 `type="date"` 를 받지 않는다. 두 폼에서만 쓰는 타입을
 * 공용 컴포넌트에 넣는 대신 여기서 한 칸만 따로 그린다. (CLAUDE.md 21항)
 */
function DateField({
  name,
  label,
  value,
  onChange,
  error,
  requiredMark,
  optionalMark,
  disabled,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  requiredMark: string;
  optionalMark: string;
  disabled?: boolean;
}) {
  void optionalMark;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold text-navy">
        {label}
        <span className="ml-1.5 text-xs font-medium text-gold">
          {requiredMark}
        </span>
      </label>
      <input
        id={name}
        name={name}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full rounded-md border bg-background px-3.5 py-2.5 text-[0.9375rem] text-foreground transition-colors",
          "disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted",
          error ? "border-[#b3261e]" : "border-line focus:border-navy-soft",
        )}
      />
      {error && (
        <p className="text-xs font-medium text-[#b3261e]">{error}</p>
      )}
    </div>
  );
}

function FileField({
  slot,
  text,
  marks,
  error,
  disabled,
  onSize,
}: {
  slot: (typeof admissionUploadSlots)[number];
  text: { label: string; hint?: string };
  marks: { requiredMark: string; optionalMark: string };
  error?: string;
  disabled?: boolean;
  onSize: (size: number) => void;
}) {
  const [selected, setSelected] = useState<{
    name: string;
    size: number;
  } | null>(null);

  const inputId = `file-${slot.field}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-navy">
        {text.label}
        <span
          className={cn(
            "ml-1.5 text-xs font-medium",
            slot.required ? "text-gold" : "text-muted",
          )}
        >
          {slot.required ? marks.requiredMark : marks.optionalMark}
        </span>
      </label>

      <input
        id={inputId}
        name={`file_${slot.field}`}
        type="file"
        accept={acceptAttribute(slot)}
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          setSelected(file ? { name: file.name, size: file.size } : null);
          onSize(file?.size ?? 0);
        }}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground",
          "file:mr-3 file:rounded file:border-0 file:bg-navy-tint file:px-3 file:py-1.5",
          "file:text-xs file:font-semibold file:text-navy",
          "disabled:cursor-not-allowed disabled:bg-surface",
          error ? "border-[#b3261e]" : "border-line",
        )}
      />

      {selected && (
        <p className="text-xs text-muted">
          {selected.name} · {formatFileSize(selected.size)}
        </p>
      )}
      {!selected && text.hint && (
        <p className="text-xs text-muted">{text.hint}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-[#b3261e]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** 제출 완료 화면. 폼을 이 화면으로 교체해 새로고침으로 다시 제출되지 않게 한다. */
function SubmittedPanel({
  locale,
  content,
  applicationNo,
  program,
  name,
}: {
  locale: Locale;
  content: AdmissionContent;
  applicationNo: string;
  program: string;
  name: string;
}) {
  return (
    <div
      role="status"
      className="rounded-lg border border-navy/15 bg-navy-tint px-6 py-10 sm:px-10"
    >
      <h2 className="text-center font-serif text-xl font-bold text-navy">
        {content.success.title}
      </h2>
      <p className="mt-3 text-center text-sm leading-relaxed text-foreground/75">
        {content.success.description}
      </p>

      <dl className="mx-auto mt-7 max-w-md rounded-md border border-navy/15 bg-background px-5 py-4">
        <div className="flex items-baseline justify-between border-b border-line py-2.5">
          <dt className="text-xs font-semibold text-muted">
            {content.success.applicationNoLabel}
          </dt>
          <dd className="font-serif text-lg font-bold text-navy">
            {applicationNo}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-b border-line py-2.5">
          <dt className="text-xs font-semibold text-muted">
            {content.success.programLabel}
          </dt>
          <dd className="text-sm font-semibold text-foreground/85">{program}</dd>
        </div>
        <div className="flex items-baseline justify-between py-2.5">
          <dt className="text-xs font-semibold text-muted">
            {content.success.nameLabel}
          </dt>
          <dd className="text-sm font-semibold text-foreground/85">{name}</dd>
        </div>
      </dl>

      <p className="mt-4 text-center text-xs text-muted">
        {content.success.note}
      </p>

      <ul className="mt-7 flex flex-wrap justify-center gap-3">
        {content.success.links.map((link) => (
          <li key={link.path}>
            <Link
              href={localePath(locale, link.path)}
              className="inline-flex rounded-md border border-navy/30 px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
