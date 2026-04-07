import prisma from './prisma';

// Cost per 1k tokens for claude-sonnet-4-6 (update if model changes)
const COSTS: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-6':     { input: 0.003,  output: 0.015 },
  'claude-opus-4-6':       { input: 0.015,  output: 0.075 },
  'claude-haiku-4-5-20251001': { input: 0.0008, output: 0.004 },
};

export async function logAiUsage(params: {
  userId: number;
  feature: string; // 'flashcard', 'quiz_gen', 'summary', 'tutor', 'examiner', 'ocr', 'explain'
  model: string;
  inputTokens: number;
  outputTokens: number;
}): Promise<void> {
  try {
    const costRates = COSTS[params.model] ?? { input: 0.003, output: 0.015 };
    const costUsd =
      (params.inputTokens / 1000) * costRates.input +
      (params.outputTokens / 1000) * costRates.output;

    const p = prisma as any;

    await p.aiUsageLog.create({
      data: {
        userId: params.userId,
        feature: params.feature,
        model: params.model,
        inputTokens: params.inputTokens,
        outputTokens: params.outputTokens,
        totalTokens: params.inputTokens + params.outputTokens,
        costUsd,
      },
    });

    // Update daily + monthly token budget
    const budget = await p.aiTokenBudget.findUnique({ where: { userId: params.userId } });
    const now = new Date();

    if (budget) {
      const lastDaily = new Date(budget.lastResetDaily);
      const lastMonthly = new Date(budget.lastResetMonthly);
      const isNewDay = lastDaily.toDateString() !== now.toDateString();
      const isNewMonth = lastMonthly.getMonth() !== now.getMonth() || lastMonthly.getFullYear() !== now.getFullYear();

      await p.aiTokenBudget.update({
        where: { userId: params.userId },
        data: {
          tokensUsedToday: isNewDay ? params.inputTokens + params.outputTokens : { increment: params.inputTokens + params.outputTokens },
          tokensUsedThisMonth: isNewMonth ? params.inputTokens + params.outputTokens : { increment: params.inputTokens + params.outputTokens },
          lastResetDaily: isNewDay ? now : undefined,
          lastResetMonthly: isNewMonth ? now : undefined,
        },
      });
    } else {
      // Create budget record for this user
      const user = await p.user.findUnique({ where: { id: params.userId }, select: { subscriptionTier: true } });
      const tier = user?.subscriptionTier ?? 'free';
      const limits: Record<string, { daily: number; monthly: number }> = {
        free:     { daily: 10000,  monthly: 100000  },
        premium:  { daily: 50000,  monthly: 500000  },
        school:   { daily: 100000, monthly: 1000000 },
      };
      const { daily, monthly } = limits[tier] ?? limits.free;

      await p.aiTokenBudget.create({
        data: {
          userId: params.userId,
          subscriptionTier: tier,
          dailyTokenLimit: daily,
          monthlyTokenLimit: monthly,
          tokensUsedToday: params.inputTokens + params.outputTokens,
          tokensUsedThisMonth: params.inputTokens + params.outputTokens,
        },
      });
    }
  } catch (err) {
    // Non-fatal — never break the main request
    console.error('[logAiUsage]', err);
  }
}
