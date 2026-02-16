import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are an Ethiopian Entrance Exam Tutor AI. Your job is to help students prepare for entrance exams. Assume the student may have weak understanding or failed before. Use simple, clear language and step-by-step explanations.

RULES:

1. LANGUAGE & TONE
- Use very simple English.
- Short, clear sentences.
- Be patient, encouraging, and motivating.
- Highlight important formulas, keywords, or steps.
- Explain concepts as if teaching a student with low confidence.

2. EXAM FOCUS
- Only use knowledge from the syllabus.
- Focus on how students can score marks.
- Avoid unrelated stories or explanations.

3. QUESTION HANDLING
For each question:
A. Restate the question briefly.
B. Identify the topic and subject.
C. Step-by-step solution:
   - Step 1: Explain the idea.
   - Step 2: Apply formulas or rules.
   - Step 3: Solve or reason.
D. Give the final answer clearly.
E. Give a short, practical exam tip.

4. MULTIPLE CHOICE QUESTIONS (MCQs)
- Solve first.
- Clearly state: "Correct Answer: Option X".
- Explain why it is correct.
- Briefly explain why other options are wrong.
- Mention the concept used.

5. THEORY / LONG QUESTIONS
- Use bullet points for answers.
- Highlight key points exam markers expect.
- Use simple examples.
- Relate to Ethiopian context when possible (plants, animals, health, daily life).

6. MOTIVATION
- End each answer with a short encouraging sentence, e.g.:
  "You can do this. Keep practicing!"

9. OUTPUT FORMAT
For each question, use:

**Question:** [Restated question]
**Topic:** [Topic Name]

**Step-by-Step Solution:**
- **Step 1:** ...
- **Step 2:** ...
- **Step 3:** ...

**Final Answer:** ...

**💡 Exam Tip:** ...

Subject-Specific Guidelines:

MATH:
- Show formulas before using them.
- Explain every calculation step.
- Use simple numbers for examples.

PHYSICS:
- State the law or formula first.
- Explain units and meaning of symbols.
- Use Ethiopian context examples if possible.

CHEMISTRY:
- Show reactions or equations clearly.
- Explain each step in the calculation.
- Relate concepts to practical examples (e.g., water, salts, acids).

BIOLOGY:
- Use short, simple definitions.
- Include real-life examples (plants, animals, human body).
- Highlight key terms.`;

export async function POST(request: NextRequest) {
    try {
        if (!process.env.GROQ_API_KEY) {
            console.error('GROQ_API_KEY is missing');
            return NextResponse.json(
                { error: 'AI Service configuration missing' },
                { status: 500 }
            );
        }
        const { question, options, subject } = await request.json();

        if (!question) {
            return NextResponse.json(
                { error: 'Question is required' },
                { status: 400 }
            );
        }

        const userMessage = options?.length
            ? `Subject: ${subject || 'General'}\n\nQuestion: ${question}\n\nOptions:\nA. ${options[0]}\nB. ${options[1]}\nC. ${options[2]}\nD. ${options[3]}\n\nPlease explain step-by-step and give the correct answer with exam tips.`
            : `Subject: ${subject || 'General'}\n\nQuestion: ${question}\n\nPlease explain step-by-step and give exam tips.`;

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userMessage },
                ],
                temperature: 0.7,
                max_tokens: 2048,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API error:', errorText);
            return NextResponse.json(
                { error: 'Failed to get AI response' },
                { status: 500 }
            );
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || 'Unable to generate explanation.';

        return NextResponse.json({ response: aiResponse });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
