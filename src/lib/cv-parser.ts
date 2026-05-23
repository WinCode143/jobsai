import { GoogleGenerativeAI, SchemaType, type ObjectSchema } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export interface ParsedProfile {
  name: string | null;
  title: string | null;
  summary: string;
  skills: string[];
  languages: string[];
  yearsOfExperience: number | null;
  industries: string[];
  education: string[];
  preferredRoles: string[];
  salaryExpectationUSD: number | null;
}

const profileSchema: ObjectSchema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING, nullable: true },
    title: { type: SchemaType.STRING, nullable: true },
    summary: { type: SchemaType.STRING },
    skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    languages: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    yearsOfExperience: { type: SchemaType.NUMBER, nullable: true },
    industries: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    education: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    preferredRoles: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    salaryExpectationUSD: { type: SchemaType.NUMBER, nullable: true },
  },
  required: ["summary", "skills", "languages", "industries", "education", "preferredRoles"],
};

export async function parseCVText(cvText: string): Promise<ParsedProfile> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite-preview-06-17",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: profileSchema,
    },
  });

  const prompt = `Extract structured information from this CV/resume text.
Be thorough with skills — include both hard and soft skills.
For preferredRoles, infer 3-5 job titles this person would be a good fit for.
If salary expectation is mentioned convert it to annual USD.
If years of experience is not explicit, estimate from work history dates.

CV TEXT:
${cvText.slice(0, 8000)}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text()) as ParsedProfile;
}

export function profileToEmbeddingText(profile: ParsedProfile): string {
  return [
    profile.title ? `Current role: ${profile.title}` : "",
    `Summary: ${profile.summary}`,
    `Skills: ${profile.skills.join(", ")}`,
    `Industries: ${profile.industries.join(", ")}`,
    `Languages: ${profile.languages.join(", ")}`,
    `Preferred roles: ${profile.preferredRoles.join(", ")}`,
    profile.yearsOfExperience ? `Years of experience: ${profile.yearsOfExperience}` : "",
    `Education: ${profile.education.join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}
