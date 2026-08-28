import type { AdmissionFileType } from "@/generated/prisma/enums";

/**
 * 입학신청 시 확인·서명해야 하는 학교 확인서 3종. (18단계)
 *
 * ## 원문 출처
 *
 * `docs/source/입학서류/` 의 다음 파일에서 그대로 옮겼다.
 *   - 4.institutional_purpose 한글 목적-2.hwp
 *   - 3.Code of Conduct 한글-2.hwp
 *   - 7.Statement of Faith  한글-2.hwp
 *
 * ## 왜 한국어 번역이 없는가
 *
 * **원본 파일명에는 "한글" 이 들어 있으나 본문은 세 문서 모두 영문뿐이다.**
 * 번역본이 존재하지 않으므로 만들지 않는다. (CLAUDE.md 23항 — 자료에 없는 내용을 만들지 않는다)
 * 한국어 화면에서도 본문은 영문 원문을 그대로 보여주고, 그 사실만 안내한다.
 * 공식 번역본이 확정되면 여기에 추가한다.
 *
 * ## 왜 DB 가 아니라 코드 상수인가
 *
 * 이번 단계는 확인서 version 관리를 만들지 않는다. (지시 2항)
 * 본문이 코드에 있으면 배포 이력(git)이 곧 변경 이력이 되고, CMS 화면을 하나 덜 만든다.
 *
 * ## 표기를 손댄 곳
 *
 * 원본 제목이 `STATEMENT OF INSTITUITONAL PURPOSE` 로 철자가 잘못돼 있어
 * `Institutional` 로 바로잡았다. 의미가 바뀌지 않는 명백한 오타만 정리한다.
 * (docs/decisions.md 5단계 "원본 표기 오류 중 정리한 것" 과 같은 기준)
 */

export const admissionDocumentKeys = [
  "institutionalPurpose",
  "codeOfConduct",
  "statementOfFaith",
] as const;

export type AdmissionDocumentKey = (typeof admissionDocumentKeys)[number];

/** 본문 한 덩이. 소제목이 있는 것, 문단만 있는 것, 목록인 것이 섞여 있다. */
export type AdmissionDocumentBlock = {
  heading?: string;
  paragraphs?: string[];
  items?: string[];
};

export type AdmissionDocument = {
  key: AdmissionDocumentKey;
  title: string;
  blocks: AdmissionDocumentBlock[];
  /** 서명 바로 위에 오는 확인 문장. 원문 그대로다. */
  attestation: string;
  /** 이 문서의 서명 이미지가 저장될 파일 종류 */
  signatureFileType: AdmissionFileType;
};

export const admissionDocuments: Record<
  AdmissionDocumentKey,
  AdmissionDocument
> = {
  institutionalPurpose: {
    key: "institutionalPurpose",
    title: "Statement of Institutional Purpose",
    signatureFileType: "SIGNATURE_INSTITUTIONAL_PURPOSE",
    blocks: [
      {
        heading: "Mission Statement",
        paragraphs: [
          "The Mission of Oikos University is to educate men and women to be the leaders to serve the church, local communities, and the world by using their learned skills and professions.",
        ],
      },
      {
        heading: "Institutional Objectives",
        items: [
          "To demonstrate a comprehensive knowledge of the Bible and an understanding of Christian doctrine",
          "To develop an appreciation for the immigrant church denomination heritage including its knowledge, history and distinct.",
          "To instill a desire for lifelong commitment to personal spiritual growth through daily Bible study and prayer.",
          "To develop attitudes of service and commitment to the local church and world missions.",
          "To equip students with competitive knowledge, skills and attitude for success and enable students to manifest their perspectives.",
          "To provide students with competitive knowledge, skills and attitude for success in their profession.",
          "To prepare students for Christian service and vocation in the Church and society.",
          "To instill a missionary vision to word-wide outreach and increase ethical standards in personal lifestyle.",
        ],
      },
      {
        heading: "Institutional Outcomes",
        paragraphs: [
          "In alignment with the mission and institutional objectives of the university, Oikos expects certain outcomes to be demonstrate in its graduates. Students graduating from Oikos will be evidenced by;",
        ],
        items: [
          "Demonstration of a comprehensive knowledge of the Bible and Christian doctrine",
          "Description of Korean and Korean-American Church history",
          "Demonstration of personal spiritual growth and service to the local church or world mission",
          "Demonstration of critical thinking skills to solve problem",
          "Demonstration of knowledge and skills in their major field",
          "Ability to share their faith through effective communication",
        ],
      },
    ],
    attestation:
      "I have read this statement and I certify that I will abide by its provisions.",
  },

  codeOfConduct: {
    key: "codeOfConduct",
    title: "Student Code of Conduct",
    signatureFileType: "SIGNATURE_CODE_OF_CONDUCT",
    blocks: [
      {
        paragraphs: [
          "Oikos University encourages a close and edifying relationship between faculty and students, one that will deepen the spiritual growth of each and stimulate a vigorous intellectual life in the University community. In order to accomplish these aims, it is imperative that Oikos University faculty, staff and students conduct themselves in a Christ-like and professional manner and maintain an exemplary and involved lifestyle.",
          "Regular church attendance and participation in the activities of the Oikos University community are encouraged for students and expected for faculty and staff.",
          "Oikos University requires members of the University community—faculty, staff and students—to refrain from the illegal use of drugs and the abuse of addictive substances controlled by law. Oikos University also forbids the use of alcohol, illicit drugs and tobacco on campus and prohibits the abuse of these substances by the Oakland community.",
          "The Apostle Paul exhorted the body of Christ that, if they truly loved their fellow man, they would set aside their personal freedom by refraining from behavior that might be a stumbling block to their weaker brother. Oikos University encourages members of the University community to exercise their personal responsibility and, guided by Paul's admonition, appropriately set aside their personal freedom and refrain from the use of alcohol, illicit drugs and tobacco.",
        ],
      },
    ],
    attestation:
      "I read the above code of conduct and adhere to the standards.",
  },

  statementOfFaith: {
    key: "statementOfFaith",
    title: "Statement of Faith",
    signatureFileType: "SIGNATURE_STATEMENT_OF_FAITH",
    blocks: [
      {
        paragraphs: [
          "Oikos University subscribes to the following statement of faith:",
          "We believe that the Bible is made by the unique divine inspiration given for the faith of the believing community. It is infallibly and uniquely authoritative and free from error of any sort in all matters.",
          "We believe in God the Father, the first person of the Divine Trinity, perfect in holiness, wisdom, power and love. We believe in God the father, an infinite Spirit-sovereign, eternal, and unchangeable in all His attributes. He is worthy of honor, adoration, and obedience.",
          "We believe that the Son is the Perfect, sinless humanity and the absolute, full deity of the Lord Jesus Christ, indissolubly united in one divine-human person since His unique incarnation by miraculous conception and virgin birth.",
          "We believe that the Holy Spirit is the third person of the Triune Godhead. He as been and will continue to be active throughout eternity. He convicts, regenerates, indwells, seals all believers in Christ, and fills those who yield to Him. The Holy Spirit gives spiritual gifts to all believers; however, the manifestation of any particular gift is not required as evidence of salvation.",
          "We believe the full historicity and perspicuity of the biblical record of the primeval history, including the literal existence of Adam and Eve as the progenitors of all people, the literal fall and resultant divine curse on the creation, the worldwide cataclysmic deluge, and the origin of nations and languages at the tower of Babel.",
          "We believe the realities of heaven and hell.",
          "We believe the redemptive grace of God though the substitutionary work of Jesus Christ who paid the full redemptive price for the sin of the world, through His literal physical death, burial, and resurrection, followed by His bodily ascension into heaven.",
          "We believe the personal salvation from the eternal penalty of sin provided solely by the grace of God on the basis of the atoning death and resurrection of Christ. We believe that salvation is only appropriated by a person placing his faith in the finished work of Christ.",
          "We believe in the personal and visible return of the Lord Jesus Christ to earth and the establishment of His kingdom. We believe in the resurrection of the body, the final judgment, the eternal felicity of the righteous and the fulfillment of His purposes in the works of creation and redemption with eternal rewards and punishments.",
          "We believe biblical account of creation as a historical and theological record of God's creation. And we believe that the universe with all that is in it was created by God. God's creation includes and is not limited to the existing space-time universe and all its basic systems and kinds of organisms in the six literal days of the creation week.",
          "We believe the existence of a personal, malevolent being called Satan who acts as tempter and accuser, for whom the place of eternal punishment was prepared, where all who die outside of Christ shall be confined in conscious torment for eternity. He can be resisted by the believer through faith and reliance on the power of the Holy Spirit.",
        ],
      },
    ],
    attestation:
      "I do hereby fully subscribe to the above doctrinal statement and fully understand that at any time it is determined by the designated administrative authority of Oikos University that I no longer conform to the school's doctrinal tenets that all contracts between myself and Oikos University can be immediately declared null and void.",
  },
};

/** 화면에 그릴 순서대로. */
export const admissionDocumentList: AdmissionDocument[] =
  admissionDocumentKeys.map((key) => admissionDocuments[key]);

/**
 * 확인서 key → `AdmissionApplication` 의 컬럼 이름.
 *
 * 서버 액션·상세 화면·인쇄 화면이 같은 표를 보게 해서 한쪽만 고쳐지는 일을 막는다.
 * 키가 늘면 컴파일 단계에서 드러난다.
 */
export const admissionDocumentColumns = {
  institutionalPurpose: {
    agreed: "institutionalPurposeAgreed",
    signedName: "institutionalPurposeSignedName",
    signedAt: "institutionalPurposeSignedAt",
  },
  codeOfConduct: {
    agreed: "codeOfConductAgreed",
    signedName: "codeOfConductSignedName",
    signedAt: "codeOfConductSignedAt",
  },
  statementOfFaith: {
    agreed: "statementOfFaithAgreed",
    signedName: "statementOfFaithSignedName",
    signedAt: "statementOfFaithSignedAt",
  },
} as const satisfies Record<
  AdmissionDocumentKey,
  { agreed: string; signedName: string; signedAt: string }
>;
