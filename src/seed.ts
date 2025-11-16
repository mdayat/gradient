import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

const prisma = new PrismaClient();

async function main() {
  const result = dotenv.config();
  if (result.error) {
    throw new Error("failed to load env", { cause: result.error });
  }

  const quizzes = await Promise.all([
    prisma.quiz.create({
      data: {
        name: "Turunan Implisit & Analisis Statik",
        duration_in_sec: 100,
      },
    }),
    prisma.quiz.create({
      data: {
        name: "Turunan Parsial - Matematika Ekonomi dan Bisnis",
        duration_in_sec: 90,
      },
    }),
  ]);

  await Promise.all([
    prisma.question.create({
      data: {
        content: JSON.stringify([
          {
            insert: {
              image: "https://media.tenor.com/8y8AZXCvJWAAAAAi/ddg-huh.gif",
            },
          },
          { insert: `${quizzes[0].name} - Soal 1\n\n` },
          { insert: { formula: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" } },
          { insert: " \n" },
        ]),
        solution: JSON.stringify([
          {
            insert: {
              image: "https://media.tenor.com/8y8AZXCvJWAAAAAi/ddg-huh.gif",
            },
          },
          { insert: `${quizzes[0].name} - Solution 1\n\n` },
          { insert: { formula: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" } },
          { insert: " \n" },
        ]),
        type: "multiple_choice",
        quizzes: { create: { quiz_id: quizzes[0].id } },
        answers: {
          createMany: {
            data: [
              {
                content: JSON.stringify([
                  { insert: { formula: "x^2 + y^2 = z^2" } },
                  { insert: " \n" },
                ]),
                is_correct: true,
              },
              {
                content: JSON.stringify([
                  {
                    insert: {
                      formula: "a = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
                    },
                  },
                  { insert: " \n" },
                ]),
                is_correct: false,
              },
              {
                content: JSON.stringify([
                  { insert: { formula: "(a + b)^2 = a^2 + 2ab + b^2" } },
                  { insert: " \n" },
                ]),
                is_correct: false,
              },
              {
                content: JSON.stringify([
                  { insert: { formula: "\\frac{d}{dx}(x^n) = nx^{n-1}" } },
                  { insert: " \n" },
                ]),
                is_correct: false,
              },
            ],
          },
        },
      },
    }),
    prisma.question.create({
      data: {
        content: JSON.stringify([
          {
            insert: {
              image: "https://media1.tenor.com/m/5nykGZHNDikAAAAC/huh-cat.gif",
            },
          },
          { insert: `\n${quizzes[0].name} - Soal 2\n\n` },
          { insert: { formula: "a^2 + b^2 = c^2" } },
          { insert: "\n" },
        ]),
        solution: JSON.stringify([
          {
            insert: {
              image: "https://media1.tenor.com/m/5nykGZHNDikAAAAC/huh-cat.gif",
            },
          },
          { insert: `\n${quizzes[0].name} - Solution 2\n\n` },
          { insert: { formula: "a^2 + b^2 = c^2" } },
          { insert: "\n" },
        ]),
        type: "multiple_answer",
        quizzes: { create: { quiz_id: quizzes[0].id } },
        answers: {
          createMany: {
            data: [
              {
                content: JSON.stringify([
                  { insert: { formula: "\\int_{a}^{b} f(x)dx = F(b) - F(a)" } },
                  { insert: " \n" },
                ]),
                is_correct: true,
              },
              {
                content: JSON.stringify([
                  {
                    insert: {
                      formula: "\\lim_{x \\to \\infty} \\frac{1}{x} = 0",
                    },
                  },
                  { insert: " \n" },
                ]),
                is_correct: false,
              },
              {
                content: JSON.stringify([
                  {
                    insert: {
                      formula: "\\sin^2(\\theta) + \\cos^2(\\theta) = 1",
                    },
                  },
                  { insert: " \n" },
                ]),
                is_correct: false,
              },
              {
                content: JSON.stringify([
                  { insert: { formula: "e^{i\\pi} + 1 = 0" } },
                  { insert: " \n" },
                ]),
                is_correct: false,
              },
            ],
          },
        },
      },
    }),
    prisma.question.create({
      data: {
        content: JSON.stringify([
          {
            insert: {
              image: "https://media.tenor.com/8y8AZXCvJWAAAAAi/ddg-huh.gif",
            },
          },
          { insert: `${quizzes[1].name} - Soal 1\n\n` },
          { insert: { formula: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" } },
          { insert: " \n" },
        ]),
        solution: JSON.stringify([
          {
            insert: {
              image: "https://media.tenor.com/8y8AZXCvJWAAAAAi/ddg-huh.gif",
            },
          },
          { insert: `${quizzes[1].name} - Solution 1\n\n` },
          { insert: { formula: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" } },
          { insert: " \n" },
        ]),
        type: "multiple_choice",
        quizzes: { create: { quiz_id: quizzes[1].id } },
        answers: {
          createMany: {
            data: [
              {
                content: JSON.stringify([
                  {
                    insert: {
                      formula: "\\mu = \\frac{1}{n}\\sum_{i=1}^{n} x_i",
                    },
                  },
                  { insert: " \n" },
                ]),
                is_correct: true,
              },
              {
                content: JSON.stringify([
                  {
                    insert: {
                      formula:
                        "\\sigma = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(x_i - \\mu)^2}",
                    },
                  },
                  { insert: " \n" },
                ]),
                is_correct: false,
              },
              {
                content: JSON.stringify([
                  {
                    insert: {
                      formula:
                        "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} ax + by \\\\ cx + dy \\end{bmatrix}",
                    },
                  },
                  { insert: " \n" },
                ]),
                is_correct: false,
              },
              {
                content: JSON.stringify([
                  { insert: { formula: "\\det(A) = ad - bc" } },
                  { insert: " \n" },
                ]),
                is_correct: false,
              },
            ],
          },
        },
      },
    }),
    prisma.question.create({
      data: {
        content: JSON.stringify([
          {
            insert: {
              image: "https://media1.tenor.com/m/5nykGZHNDikAAAAC/huh-cat.gif",
            },
          },
          { insert: `\n${quizzes[1].name} - Soal 2\n\n` },
          { insert: { formula: "a^2 + b^2 = c^2" } },
          { insert: "\n" },
        ]),
        solution: JSON.stringify([
          {
            insert: {
              image: "https://media1.tenor.com/m/5nykGZHNDikAAAAC/huh-cat.gif",
            },
          },
          { insert: `\n${quizzes[1].name} - Solution 2\n\n` },
          { insert: { formula: "a^2 + b^2 = c^2" } },
          { insert: "\n" },
        ]),
        type: "multiple_answer",
        quizzes: { create: { quiz_id: quizzes[1].id } },
        answers: {
          createMany: {
            data: [
              {
                content: JSON.stringify([
                  { insert: { formula: "E = mc^2" } },
                  { insert: " \n" },
                ]),
                is_correct: true,
              },
              {
                content: JSON.stringify([
                  { insert: { formula: "F = ma = m\\frac{dv}{dt}" } },
                  { insert: " \n" },
                ]),
                is_correct: false,
              },
              {
                content: JSON.stringify([
                  {
                    insert: {
                      formula:
                        "\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}",
                    },
                  },
                  { insert: " \n" },
                ]),
                is_correct: false,
              },
              {
                content: JSON.stringify([
                  {
                    insert: {
                      formula:
                        "\\oint_C \\vec{F} \\cdot d\\vec{r} = \\iint_S (\\nabla \\times \\vec{F}) \\cdot d\\vec{S}",
                    },
                  },
                  { insert: " \n" },
                ]),
                is_correct: false,
              },
            ],
          },
        },
      },
    }),
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(new Error("failed to seed database", { cause: error }));
    await prisma.$disconnect();
    process.exit(1);
  });
