import {
  dbaFacts,
  exchangeRateBase,
  fees,
  formatIntake,
  formatKrw,
  mbaFacts,
} from "../program-facts";
import type { PageContent } from "./types";

const intakeEn = formatIntake("en");
const krw = (amount: number) => formatKrw(amount, "en");

/**
 * 영어 상세 페이지 콘텐츠.
 *
 * 한국어를 기계적으로 직역하지 않고 영어권 독자가 자연스럽게 읽을 수 있게 작성한다.
 * 다만 학교명·학위명·기관명·교과목명은 원본 자료의 표현을 유지하고,
 * 원본에 없는 행정적·법적 표현을 새로 만들지 않는다.
 */
export const pagesEn: PageContent = {
  // -------------------------------------------------------------------------
  about: {
    intro: {
      eyebrow: "Graduate School",
      title: "Oikos University Graduate School of Business",
      description:
        "An online graduate school of business opened for working professionals who pursue a degree alongside their careers.",
    },
    presidentNotice: {
      title: "Message from the President",
      body: "The president's message is currently being prepared and will be published here once confirmed.",
    },
    school: {
      title: "About the Graduate School",
      paragraphs: [
        "There are two kinds of doctoral degree: the professional practice doctorate and the research-oriented PhD. In Korea, most doctoral programs are research-oriented and designed for full-time students.",
        "This graduate school opened professional master's and doctoral programs in business for practitioners who work during the day and study in the evening.",
        "It is an interdisciplinary degree program that connects business studies with the professional knowledge and experience of the hotel, foodservice and wine management fields. Anyone interested in hospitality and tourism service management is also welcome.",
      ],
    },
    philosophy: {
      title: "Educational Philosophy",
      paragraphs: [
        "Hotel, Foodservice and Wine Management is an interdisciplinary major that provides advanced practical training in tourism industry management, grounded in business theory.",
        "As convergence across hotels, wine and foodservice accelerates, demand for hotel and tourism content is growing rapidly, yet integrated education at the master's and doctoral level has been limited.",
        "The program therefore centers on learning, practising and researching hotel, foodservice and wine management as the core of a service culture that is of the customer, by the customer and for the customer.",
      ],
    },
    goals: {
      title: "Educational Goals",
      items: [
        {
          title: "Developing professional leaders",
          description:
            "Grounded in a technical understanding of the hotel, foodservice and wine fields, the program aims to produce professional leaders for industry.",
        },
        {
          title: "Interdisciplinary expertise",
          description:
            "Students build expertise across hotel management, wine and foodservice, and the tourism industry.",
        },
        {
          title: "Applied to real industry",
          description:
            "Coursework covers professional capability, brand differentiation, and hotel and tourism marketing that can be applied in practice.",
        },
        {
          title: "Integrated education",
          description:
            "Integrated education covering tourism content as a whole, for people working across the industry.",
        },
      ],
    },
    university: {
      title: "About Oikos University",
      paragraphs: [
        "Oikos University was founded in 2004 as a branch campus of Shepherd University in Los Angeles by Pastor Jong-In Kim, a Korean-American, and became an independent university in 2007.",
        "It is a private educational institution located in Oakland, California.",
      ],
      facts: [
        { label: "Founded", value: "2004" },
        { label: "Independent university", value: "2007" },
        { label: "Location", value: "Oakland, California, USA" },
      ],
      degreeLinkLabel: "View approval & accreditation",
      officialSiteLabel: "University website",
    },
  },

  // -------------------------------------------------------------------------
  faculty: {
    intro: {
      eyebrow: "Faculty",
      title: "Faculty",
      description:
        "The faculty overseeing the curriculum of the Hotel, Foodservice & Wine Management major.",
    },
    chief: {
      sectionTitle: "Chief Professor",
      name: "Dong-Joon Kim",
      nameAlt: "김동준",
      initials: "DK",
      role: "Chief Professor",
      major: "Hotel, Foodservice & Wine Management",
      affiliation: "Online Graduate School of Business",
      details: [
        { label: "Position", value: "Chief Professor" },
        { label: "Major", value: "Hotel, Foodservice & Wine Management" },
        { label: "Korean name", value: "김동준" },
      ],
    },
    pendingNotice: {
      title: "Professors & Visiting Professors",
      body: "The list of professors and visiting professors is being prepared and will be published here once confirmed.",
    },
    contactNotice:
      "Individual faculty contact details are not published. Please use the consultation request for questions about the programs.",
  },

  // -------------------------------------------------------------------------
  mba: {
    intro: {
      eyebrow: "MBA",
      title: "Master of Business Administration (MBA)",
      description: `${mbaFacts.semesters} semesters · ${mbaFacts.totalCredits} credits · a fully online master's program centered on theory coursework.`,
    },
    overview: {
      title: "Program Overview",
      paragraphs: [
        "A professional master's program in business designed for practitioners who study alongside their careers.",
        "It is an interdisciplinary degree that connects business studies with professional knowledge and experience in hotel, foodservice and wine management, and is delivered primarily through theory coursework.",
      ],
    },
    summary: {
      title: "Duration & Credits",
      items: [
        { label: "Duration", value: `${mbaFacts.semesters} semesters` },
        {
          label: "Per semester",
          value: `${mbaFacts.coursesPerSemester} courses / ${mbaFacts.creditsPerSemester} credits`,
        },
        { label: "Total credits", value: `${mbaFacts.totalCredits}` },
        {
          label: "Credit breakdown",
          value: `${mbaFacts.majorCredits} major · ${mbaFacts.commonCredits} common`,
        },
        {
          label: "Chapel",
          value: `${mbaFacts.chapelCourses} courses`,
          note: "required separately from credits",
        },
        { label: "Format", value: "100% online" },
      ],
    },
    features: {
      title: "Program Features",
      items: [
        {
          title: "Theory-centered",
          description:
            "The master's program is built around theory coursework.",
        },
        {
          title: "Interdisciplinary curriculum",
          description:
            "A curriculum that connects hotel, foodservice and wine with business theory.",
        },
        {
          title: "Study while working",
          description:
            "Delivered online for practitioners who pursue a degree alongside their careers.",
        },
      ],
    },
    curriculum: {
      title: "Curriculum",
      description:
        "Major courses assigned to specific semesters, plus common courses.",
      semesterLabelTemplate: "Semester {n}",
      majorTitle: "Major courses",
      additionalTitle: "Additional major courses",
      additionalNote:
        "Listed in the source curriculum without a semester assignment.",
      commonTitle: "Common courses (business)",
      creditsUnit: "credits",
      creditsUnknown: "credits not stated",
      formatLabel: "Format",
      altTitleNote:
        "The source material records two different English titles for this course.",
      descriptionPending: "The course description is being prepared.",
      note: "Courses may change depending on semester circumstances.",
    },
    graduation: {
      title: "Graduation Requirements",
      items: [
        { label: "Total credits", value: `${mbaFacts.totalCredits}` },
        { label: "Major", value: `${mbaFacts.majorCredits} credits` },
        { label: "Common", value: `${mbaFacts.commonCredits} credits` },
        {
          label: "Chapel",
          value: `${mbaFacts.chapelCourses} courses (separate)`,
        },
      ],
    },
  },

  // -------------------------------------------------------------------------
  dba: {
    intro: {
      eyebrow: "DBA",
      title: "Doctor of Business Administration (DBA)",
      description: `${dbaFacts.semesters} semesters · ${dbaFacts.totalCredits} credits · a fully online professional doctoral program.`,
    },
    overview: {
      title: "Program Overview",
      paragraphs: [
        "There are two kinds of doctoral degree: the professional practice doctorate and the research-oriented PhD. This program is a professional doctorate in business for practitioners who work during the day and study in the evening.",
        "It is an interdisciplinary degree that connects business studies with professional knowledge and experience in hotel, foodservice and wine management.",
      ],
    },
    summary: {
      title: "Duration & Credits",
      items: [
        { label: "Duration", value: `${dbaFacts.semesters} semesters` },
        {
          label: "Per semester",
          value: `${dbaFacts.coursesPerSemester} courses / ${dbaFacts.creditsPerSemester} credits`,
        },
        { label: "Total credits", value: `${dbaFacts.totalCredits}` },
        {
          label: "Credit breakdown",
          value: `${dbaFacts.majorCredits} major · ${dbaFacts.commonCredits} common`,
        },
        {
          label: "Chapel",
          value: `${dbaFacts.chapelCourses} courses`,
          note: "required separately from credits",
        },
        {
          label: `Semester ${dbaFacts.thesisSemester}`,
          value: "Dissertation semester",
        },
      ],
    },
    features: {
      title: "Program Features",
      items: [
        {
          title: "Professional doctorate",
          description:
            "Unlike a research-oriented PhD, this is a professional doctorate for practitioners.",
        },
        {
          title: "Modular curriculum",
          description:
            "A staged curriculum running through foundation, core, research, project and dissertation modules.",
        },
        {
          title: "Dissertation semester",
          description: `Semester ${dbaFacts.thesisSemester} is dedicated to the dissertation.`,
        },
      ],
    },
    modules: {
      title: "Curriculum Structure",
      description:
        "From theory coursework through seminars, research methods and project work to the dissertation.",
      items: [
        {
          name: "Foundation module",
          summary: "Theory coursework",
          details: [
            "Hotel operations, foodservice marketing and service leadership",
            "Wine industry, tourism management and consumer behaviour",
          ],
        },
        {
          name: "Core module",
          summary: "Major seminars exploring dissertation topics",
          details: ["Seminars I · II", "Seminars III · IV", "Seminars V · VI"],
        },
        {
          name: "Research module",
          summary: "Research methodology coursework",
          details: [
            "Literature review",
            "Research methodology",
            "Statistical analysis",
          ],
        },
        {
          name: "Project module",
          summary:
            "Building and analysing databases in each field of practice",
          details: [
            "Preliminary research",
            "Project proposal",
            "Project execution",
            "Project review",
          ],
        },
        {
          name: "Dissertation module",
          summary: "Writing the dissertation based on project results",
          details: [
            "Dissertation analysis",
            "Dissertation synthesis",
            "Dissertation defense",
          ],
        },
      ],
    },
    curriculum: {
      title: "Curriculum",
      description:
        "Major courses assigned to specific semesters, plus common courses.",
      semesterLabelTemplate: "Semester {n}",
      majorTitle: "Major courses",
      additionalTitle: "Additional major courses",
      additionalNote:
        "Listed in the source curriculum without a semester assignment.",
      commonTitle: "Common courses (business)",
      creditsUnit: "credits",
      creditsUnknown: "credits not stated",
      formatLabel: "Format",
      altTitleNote:
        "The source material records two different English titles for this course.",
      descriptionPending: "The course description is being prepared.",
      note: "Courses may change depending on semester circumstances.",
    },
    graduation: {
      title: "Graduation Requirements",
      items: [
        { label: "Total credits", value: `${dbaFacts.totalCredits}` },
        { label: "Major", value: `${dbaFacts.majorCredits} credits` },
        { label: "Common", value: `${dbaFacts.commonCredits} credits` },
        {
          label: "Chapel",
          value: `${dbaFacts.chapelCourses} courses (separate)`,
        },
      ],
      note: `Semester ${dbaFacts.thesisSemester} is dedicated to the dissertation.`,
    },
  },

  // -------------------------------------------------------------------------
  degree: {
    intro: {
      eyebrow: "Degree & Accreditation",
      title: "Degree & Accreditation",
      description:
        "Information on the degrees offered and on Oikos University's approvals and accreditation.",
    },
    degrees: {
      title: "Degrees Offered",
      description: "Degree programs offered by the online graduate school of business.",
      items: [
        {
          code: "MBA",
          name: "Master of Business Administration",
          summary: `${mbaFacts.semesters} semesters · ${mbaFacts.totalCredits} credits`,
        },
        {
          code: "DBA",
          name: "Doctor of Business Administration",
          summary: `${dbaFacts.semesters} semesters · ${dbaFacts.totalCredits} credits`,
        },
      ],
    },
    foreignDoctorate: {
      title: "Korean Foreign Doctoral Degree Reporting System",
      paragraphs: [
        "Under Article 27 of the Korean Higher Education Act, a person who has obtained a doctoral degree abroad registers that fact in the 'foreign doctoral degree reporting' system.",
        "Its purpose is to understand how many Koreans hold doctoral degrees from foreign universities, and to make their dissertations publicly available, collecting baseline data for the use of national human resources and contributing academically to the next generation of researchers.",
      ],
      highlight:
        "This system does not verify the authenticity of a degree.",
      registrar:
        "USA OIKOS UNIVERSITY is a university registered for the foreign doctoral degree reporting system operated by the National Research Foundation of Korea, and recognised by the Foundation for that purpose.",
    },
    accreditation: {
      title: "Approval & Accreditation",
      description:
        "The following is presented as recorded in the university information provided.",
      items: [
        {
          name: "BPPE approval",
          body: "Oikos University is a private institution located in Oakland, California, approved by the California Bureau for Private Postsecondary Education.",
        },
        {
          name: "U.S. Department of Education",
          body: "Oikos University is currently included in the U.S. Department of Education's database of recognised postsecondary institutions and programs.",
        },
        {
          name: "TRACS accreditation",
          body: "Oikos University had its accreditation status reaffirmed as a Category IV institution by the Accreditation Commission of the Transnational Association of Christian Colleges and Schools (TRACS) on 12 April 2021. TRACS is recognised by the U.S. Department of Education (USDOE), the Council for Higher Education Accreditation (CHEA) and the International Network for Quality Assurance Agencies in Higher Education (INQAAHE).",
        },
        {
          name: "CHEA",
          body: "Oikos University is currently included in the database of institutions accredited by recognised U.S. accrediting organisations.",
        },
        {
          name: "SEVIS I-20",
          body: "Oikos University is approved by U.S. Citizenship and Immigration Services (USCIS) to admit and enroll international students, and issues the I-20 through the Student and Exchange Visitor Information System (SEVIS).",
        },
      ],
      note: "For the current status of any approval or accreditation, please refer to the official sources of each organisation.",
    },
    university: {
      title: "About the University",
      paragraphs: [
        "Oikos University was founded in 2004 as a branch campus of Shepherd University in Los Angeles by Pastor Jong-In Kim, a Korean-American, and became an independent university in 2007.",
        "It is located in Oakland, California.",
      ],
      officialSiteLabel: "University website",
    },
    faqLink: {
      title: "Frequently Asked Questions",
      description:
        "Common questions about the degrees and programs.",
      cta: "View FAQ",
    },
  },

  // -------------------------------------------------------------------------
  admission: {
    intro: {
      eyebrow: "Admissions",
      title: `Starting ${intakeEn}`,
      description:
        "Admissions overview, eligibility, tuition, application process and academic calendar.",
    },
    recruit: {
      title: "Admissions Overview",
      description:
        "Applications are open for the online graduate master's and doctoral programs.",
      items: [
        { label: "Starts", value: intakeEn },
        { label: "Format", value: "100% online" },
        { label: "MBA", value: `${mbaFacts.semesters} semesters` },
        { label: "DBA", value: `${dbaFacts.semesters} semesters` },
      ],
    },
    eligibility: {
      title: "Eligibility",
      paragraphs: [
        "The programs are designed to develop leading professionals in fields such as hotel, foodservice and wine management.",
        "They are interdisciplinary degrees connecting business studies with professional knowledge and experience, and anyone interested in hospitality and tourism service management is also welcome.",
      ],
      note: "Detailed requirements such as prior academic qualifications are provided through admissions consultation.",
    },
    tuition: {
      title: "Tuition & Fees",
      description: "Amounts as recorded in the material provided.",
      columns: [
        "Program",
        "Tuition",
        "Application review fee",
        "LMS fee",
        "Administrative fee",
      ],
      rows: [
        {
          program: "Doctor of Business Administration (DBA)",
          cells: [
            krw(dbaFacts.tuition),
            krw(fees.admissionReview),
            "-",
            krw(fees.administrative),
          ],
        },
        {
          program: "Master of Business Administration (MBA)",
          cells: [
            krw(mbaFacts.tuition),
            krw(fees.admissionReview),
            "-",
            krw(fees.administrative),
          ],
        },
      ],
      notes: [
        `Tuition is stated at the exchange rate used in the source material (USD 1 = KRW ${exchangeRateBase.toLocaleString("en-US")}).`,
        "No amount is stated for the LMS fee in the source material.",
        "Tuition is subject to change. Please confirm through admissions consultation before applying.",
      ],
    },
    steps: {
      title: "Application Process",
      description:
        "Both the master's and doctoral programs follow the same process.",
      items: [
        {
          title: "Submit application documents",
          description: "Application documents are submitted as PDF files.",
        },
        {
          title: "Pay the application review fee",
          description: `Pay the application review fee of ${krw(fees.admissionReview)}.`,
        },
        {
          title: "Admission decision",
          description: "Admission is granted after review.",
        },
        {
          title: "Pay tuition and administrative fee",
          description: `Pay tuition (DBA ${krw(dbaFacts.tuition)} / MBA ${krw(mbaFacts.tuition)}) and the administrative fee of ${krw(fees.administrative)}.`,
        },
        {
          title: "Semester begins · LMS",
          description:
            "The LMS is used from the start of the semester.",
        },
      ],
    },
    calendar: {
      title: "Academic Calendar",
      description: "The year runs on three semesters.",
      items: [
        { period: "February – April", label: "Semester 1", type: "semester" },
        { period: "May", label: "Break", type: "break" },
        { period: "June – August", label: "Semester 2", type: "semester" },
        { period: "September", label: "Break", type: "break" },
        { period: "October – December", label: "Semester 3", type: "semester" },
        { period: "January", label: "Break", type: "break" },
      ],
    },
  },

  // -------------------------------------------------------------------------
  faq: {
    intro: {
      eyebrow: "FAQ",
      title: "Frequently Asked Questions",
      description:
        "Common questions about the programs and degrees.",
    },
    items: [
      {
        question: "Are classes delivered online?",
        answer:
          "Yes. The master's and doctoral programs in Hotel, Foodservice & Wine Management are delivered 100% online. The LMS is used from the start of each semester.",
      },
      {
        question: "How many semesters is the MBA program?",
        answer: `The MBA runs for ${mbaFacts.semesters} semesters with a total of ${mbaFacts.totalCredits} credits (${mbaFacts.majorCredits} major, ${mbaFacts.commonCredits} common). ${mbaFacts.chapelCourses} chapel courses are required separately from credits.`,
      },
      {
        question: "How many semesters is the DBA program?",
        answer: `The DBA runs for ${dbaFacts.semesters} semesters with a total of ${dbaFacts.totalCredits} credits (${dbaFacts.majorCredits} major, ${dbaFacts.commonCredits} common). ${dbaFacts.chapelCourses} chapel courses are required separately, and semester ${dbaFacts.thesisSemester} is dedicated to the dissertation.`,
      },
      {
        question: "How many courses are taken each semester?",
        answer: `Both programs take ${mbaFacts.coursesPerSemester} courses and ${mbaFacts.creditsPerSemester} credits per semester.`,
      },
      {
        question: "When do semesters start?",
        answer:
          "Semester 1 runs February to April, semester 2 June to August, and semester 3 October to December. May, September and January are breaks.",
      },
      {
        question: "Can the course list change?",
        answer:
          "Courses may change depending on semester circumstances.",
      },
      {
        question:
          "What is the Korean foreign doctoral degree reporting system?",
        answer:
          "Under Article 27 of the Korean Higher Education Act, a person who obtained a doctoral degree abroad registers that fact in the 'foreign doctoral degree reporting' system. Its purpose is to understand how many Koreans hold foreign doctoral degrees and to make their dissertations publicly available as baseline data for the use of national human resources. It does not verify the authenticity of a degree.",
      },
      {
        question: "What is the FICB international wine knighthood?",
        answer:
          "Outstanding graduates may be given the opportunity to receive an international wine knighthood from FICB (Fédération Internationale des Confréries Bachiques).",
      },
    ],
    note: "For anything not covered here, please contact us through admissions consultation.",
  },

  // -------------------------------------------------------------------------
  consultation: {
    intro: {
      eyebrow: "Consultation",
      title: "Request a Consultation",
      description:
        "Tell us what you would like to know about choosing a program, eligibility, or the admissions process, and we will get back to you.",
    },
    guide: {
      title: "Before You Submit",
      description:
        "A few notes that help us give you a more accurate answer.",
      items: [
        {
          title: "What you can ask",
          description:
            "Anything about choosing a program, how classes are delivered, the curriculum, graduation requirements, tuition, or the admissions process.",
        },
        {
          title: "How we reply",
          description:
            "We reply using the phone number and email address you provide, so please make sure both are correct.",
        },
        {
          title: "When we reply",
          description:
            "We respond in the order requests are received. The expected response time will be posted here once it is confirmed.",
        },
      ],
    },
    channelNotice: {
      title: "Phone and messenger consultation",
      body: "Our main phone number and messenger channel are still being confirmed. They will be posted here once ready — until then, please use the online form below.",
    },
    form: {
      title: "Consultation Request",
      description: "Please complete every field marked as required.",
      fields: {
        name: { label: "Name", placeholder: "Your full name" },
        phone: {
          label: "Phone",
          placeholder: "+82 10 0000 0000",
          hint: "Digits and - + ( ) only. Please include your country code if you are outside Korea.",
        },
        email: { label: "Email", placeholder: "name@example.com" },
        interestedProgram: {
          label: "Program of interest",
          placeholder: "Please select",
          options: [
            { value: "MBA", label: "MBA (Master's)" },
            { value: "DBA", label: "DBA (Doctoral)" },
          ],
        },
        message: {
          label: "Your question",
          placeholder: "Please tell us what you would like to know.",
        },
      },
      text: {
        requiredMark: "Required",
        optionalMark: "Optional",
        submit: "Submit request",
        submitting: "Submitting…",
        privacy: {
          label: "I agree to the collection and use of my personal information.",
          summary:
            "Collected: name, phone, email, program of interest, and your question. Purpose: responding to your admissions inquiry.",
          pendingNotice:
            "The full privacy policy and retention period are still being prepared and will be published here once confirmed.",
        },
        invalidAlert: "Please review the highlighted fields.",
        serverError:
          "We could not submit your request. Please try again later.",
        success: {
          title: "Your consultation request has been submitted.",
          description: "We will contact you after reviewing your request.",
        },
        errors: {
          nameRequired: "Please enter your name.",
          nameTooLong: "This name is too long.",
          phoneRequired: "Please enter a phone number.",
          phoneInvalid: "Please check the phone number format.",
          emailRequired: "Please enter your email address.",
          emailInvalid: "Please enter a valid email address.",
          emailTooLong: "This email address is too long.",
          privacyRequired:
            "Please agree to the collection of your personal information.",
          programRequired: "Please select a program.",
          messageRequired: "Please enter your question.",
          messageTooShort: "Please tell us a little more.",
          messageTooLong: "This message is too long.",
        },
      },
      successLinks: [
        { path: "/admission", label: "View admissions" },
        { path: "/programs", label: "View MBA · DBA programs" },
      ],
    },
    seminarLink: {
      title: "Information session",
      description:
        "You can also register for an information session. Registrants are notified first once a date is confirmed.",
      cta: "Register for a session",
    },
  },

  // -------------------------------------------------------------------------
  seminar: {
    intro: {
      eyebrow: "Consultation",
      title: "Information Session",
      description:
        "Register in advance for a program information session. Registrants are notified first once a date is confirmed.",
    },
    scheduleNotice: {
      title: "Session schedule",
      body: "No session date has been confirmed yet. If you register now, we will contact you as soon as a date is set.",
    },
    form: {
      title: "Session Registration",
      description: "Please complete every field marked as required.",
      fields: {
        name: { label: "Name", placeholder: "Your full name" },
        phone: {
          label: "Phone",
          placeholder: "+82 10 0000 0000",
          hint: "Digits and - + ( ) only. Please include your country code if you are outside Korea.",
        },
        email: { label: "Email", placeholder: "name@example.com" },
        preferredSession: {
          label: "Session you would like to attend",
          placeholder: "e.g. an online session on a weekday evening",
          hint: "No dates are confirmed yet, so please describe the timing or format you would prefer.",
        },
        attendeeCount: {
          label: "Number of attendees",
          hint: "Between 1 and 10 people.",
        },
        memo: {
          label: "Notes",
          placeholder: "Anything you would like to know in advance.",
        },
      },
      text: {
        requiredMark: "Required",
        optionalMark: "Optional",
        submit: "Register",
        submitting: "Submitting…",
        privacy: {
          label: "I agree to the collection and use of my personal information.",
          summary:
            "Collected: name, phone, email, preferred session, number of attendees, and notes. Purpose: informing you about session dates.",
          pendingNotice:
            "The full privacy policy and retention period are still being prepared and will be published here once confirmed.",
        },
        invalidAlert: "Please review the highlighted fields.",
        serverError:
          "We could not submit your request. Please try again later.",
        success: {
          title: "Your registration has been submitted.",
          description:
            "We will contact you as soon as a session date is confirmed.",
        },
        errors: {
          nameRequired: "Please enter your name.",
          nameTooLong: "This name is too long.",
          phoneRequired: "Please enter a phone number.",
          phoneInvalid: "Please check the phone number format.",
          emailRequired: "Please enter your email address.",
          emailInvalid: "Please enter a valid email address.",
          emailTooLong: "This email address is too long.",
          privacyRequired:
            "Please agree to the collection of your personal information.",
          sessionTooLong: "This entry is too long.",
          attendeeCountInvalid:
            "Please enter a number of attendees between 1 and 10.",
          memoTooLong: "This note is too long.",
        },
      },
      successLinks: [
        { path: "/consultation", label: "Request a consultation" },
        { path: "/admission", label: "View admissions" },
      ],
    },
    consultationLink: {
      title: "Admissions consultation",
      description:
        "If you would rather not wait for a session, you can send us your question directly.",
      cta: "Request a consultation",
    },
  },

  // -------------------------------------------------------------------------
  related: {
    title: "See also",
    about: "Graduate School",
    admission: "Admissions",
    consultation: "Request Consultation",
    seminar: "Information Session",
    programs: "MBA · DBA Programs",
    mba: "MBA Program",
    dba: "DBA Program",
    degree: "Degree & Accreditation",
    faq: "FAQ",
    faculty: "Faculty",
  },
};
