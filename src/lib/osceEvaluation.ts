import type {
    DiagnosticHypothesis,
    PrescriptionItem,
    OsceCaseExtended
} from './osceTypes';

/**
 * Extended evaluation for the new OSCE phases:
 * - Diagnostic hypotheses
 * - Exam selection
 * - Prescription
 */

interface ExtendedEvaluationInput {
    osceCase: OsceCaseExtended;
    hypotheses: DiagnosticHypothesis[];
    requestedExams: string[];
    prescription: PrescriptionItem[];
}

interface ExtendedEvaluationResult {
    scoreDiagnostico: number;
    scoreExames: number;
    scorePrescricao: number;

    diagnosticoFeedback: {
        acertos: string[];
        erros: string[];
        faltou: string[];
    };

    examesFeedback: {
        adequados: string[];
        desnecessarios: string[];
        faltantes: string[];
    };

    prescricaoFeedback: {
        corretos: string[];
        incorretos: string[];
        faltantes: string[];
    };
}

/**
 * Normalize text for comparison (lowercase, remove accents)
 */
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

/**
 * Check if two strings are similar enough (fuzzy match)
 */
function isSimilar(a: string, b: string): boolean {
    const normA = normalizeText(a);
    const normB = normalizeText(b);

    // Exact match
    if (normA === normB) return true;

    // One contains the other
    if (normA.includes(normB) || normB.includes(normA)) return true;

    // Split into words and check for significant overlap
    const wordsA = normA.split(/\s+/).filter(w => w.length > 2);
    const wordsB = normB.split(/\s+/).filter(w => w.length > 2);

    let matches = 0;
    for (const wordA of wordsA) {
        for (const wordB of wordsB) {
            if (wordA === wordB || wordA.includes(wordB) || wordB.includes(wordA)) {
                matches++;
                break;
            }
        }
    }

    // If more than 50% of words match, consider it similar
    const minWords = Math.min(wordsA.length, wordsB.length);
    return minWords > 0 && matches / minWords >= 0.5;
}

/**
 * Evaluate diagnostic hypotheses
 */
function evaluateDiagnoses(
    hypotheses: DiagnosticHypothesis[],
    expected: { primary: string; differentials: string[] } | undefined
): { score: number; acertos: string[]; erros: string[]; faltou: string[] } {
    if (!expected || !expected.primary) {
        return { score: 100, acertos: [], erros: [], faltou: [] }; // No expected = auto pass
    }

    const acertos: string[] = [];
    const erros: string[] = [];
    const faltou: string[] = [];

    // Check if user identified the primary diagnosis
    const userDiagnoses = hypotheses.map(h => h.diagnosis);
    let foundPrimary = false;

    for (const hyp of hypotheses) {
        if (isSimilar(hyp.diagnosis, expected.primary)) {
            foundPrimary = true;
            if (hyp.probability === 'alta') {
                acertos.push(`✓ Acertou o diagnóstico principal: ${expected.primary}`);
            } else {
                acertos.push(`Identificou "${expected.primary}" mas com probabilidade ${hyp.probability} (esperado: alta)`);
            }
            break;
        }
    }

    if (!foundPrimary) {
        faltou.push(`Não identificou o diagnóstico principal: ${expected.primary}`);
    }

    // Check differentials
    let diffFound = 0;
    for (const diff of expected.differentials) {
        const found = userDiagnoses.some(d => isSimilar(d, diff));
        if (found) {
            diffFound++;
            acertos.push(`✓ Diferencial correto: ${diff}`);
        }
    }

    if (expected.differentials.length > 0 && diffFound < expected.differentials.length) {
        for (const diff of expected.differentials) {
            if (!userDiagnoses.some(d => isSimilar(d, diff))) {
                faltou.push(`Faltou diferencial: ${diff}`);
            }
        }
    }

    // Check for incorrect diagnoses
    for (const hyp of hypotheses) {
        const isExpected = isSimilar(hyp.diagnosis, expected.primary) ||
            expected.differentials.some(d => isSimilar(hyp.diagnosis, d));
        if (!isExpected) {
            erros.push(`Diagnóstico incorreto: ${hyp.diagnosis}`);
        }
    }

    // Calculate score
    let score = 0;
    if (foundPrimary) score += 50;
    if (hypotheses.find(h => isSimilar(h.diagnosis, expected.primary))?.probability === 'alta') score += 20;
    if (expected.differentials.length > 0) {
        score += (diffFound / expected.differentials.length) * 30;
    } else {
        score += 30; // No differentials expected
    }

    // Penalty for wrong diagnoses
    score -= erros.length * 10;

    return { score: Math.max(0, Math.min(100, Math.round(score))), acertos, erros, faltou };
}

/**
 * Evaluate exam selection
 */
function evaluateExams(
    requestedExams: string[],
    availableExams: { id: string; name: string }[] | undefined,
    expectedExamIds: string[] | undefined
): { score: number; adequados: string[]; desnecessarios: string[]; faltantes: string[] } {
    // If no expected exams configured, consider all exams as adequate
    if (!expectedExamIds || expectedExamIds.length === 0) {
        return {
            score: 100,
            adequados: requestedExams,
            desnecessarios: [],
            faltantes: []
        };
    }

    const adequados: string[] = [];
    const desnecessarios: string[] = [];
    const faltantes: string[] = [];

    // Find exam names for display
    const getExamName = (id: string) =>
        availableExams?.find(e => e.id === id)?.name || id;

    // Check requested exams
    for (const examId of requestedExams) {
        if (expectedExamIds.includes(examId)) {
            adequados.push(getExamName(examId));
        } else {
            desnecessarios.push(getExamName(examId));
        }
    }

    // Check for missing exams
    for (const expectedId of expectedExamIds) {
        if (!requestedExams.includes(expectedId)) {
            faltantes.push(getExamName(expectedId));
        }
    }

    // Calculate score
    const expectedCount = expectedExamIds.length;
    const foundCount = adequados.length;
    const unnecessaryCount = desnecessarios.length;

    let score = (foundCount / expectedCount) * 100;
    score -= unnecessaryCount * 5; // Small penalty for unnecessary exams

    return {
        score: Math.max(0, Math.min(100, Math.round(score))),
        adequados,
        desnecessarios,
        faltantes
    };
}

/**
 * Evaluate prescription
 */
function evaluatePrescription(
    prescription: PrescriptionItem[],
    expected: {
        medicamentos?: string[];
        dieta?: string;
        repouso?: string;
        encaminhamentos?: string[];
        orientacoes?: string[];
    } | undefined
): { score: number; corretos: string[]; incorretos: string[]; faltantes: string[] } {
    if (!expected) {
        return { score: 100, corretos: [], incorretos: [], faltantes: [] };
    }

    const corretos: string[] = [];
    const incorretos: string[] = [];
    const faltantes: string[] = [];

    const userMeds = prescription.filter(p => p.type === 'medicamento').map(p => p.description);
    const userDieta = prescription.find(p => p.type === 'dieta')?.description;
    const userRepouso = prescription.find(p => p.type === 'repouso')?.description;
    const userEncaminhamentos = prescription.filter(p => p.type === 'encaminhamento').map(p => p.description);
    const userOrientacoes = prescription.filter(p => p.type === 'orientacao').map(p => p.description);

    // Check medications
    let medsScore = 0;
    if (expected.medicamentos && expected.medicamentos.length > 0) {
        let found = 0;
        for (const expMed of expected.medicamentos) {
            if (userMeds.some(m => isSimilar(m, expMed))) {
                found++;
                corretos.push(`✓ Medicamento: ${expMed}`);
            } else {
                faltantes.push(`Faltou medicamento: ${expMed}`);
            }
        }
        medsScore = (found / expected.medicamentos.length) * 40;
    } else {
        medsScore = 40;
    }

    // Check diet
    let dietScore = 0;
    if (expected.dieta) {
        if (userDieta && isSimilar(userDieta, expected.dieta)) {
            dietScore = 15;
            corretos.push(`✓ Dieta adequada`);
        } else {
            faltantes.push(`Faltou dieta: ${expected.dieta}`);
        }
    } else {
        dietScore = 15;
    }

    // Check rest
    let restScore = 0;
    if (expected.repouso) {
        if (userRepouso && isSimilar(userRepouso, expected.repouso)) {
            restScore = 15;
            corretos.push(`✓ Repouso adequado`);
        } else {
            faltantes.push(`Faltou repouso: ${expected.repouso}`);
        }
    } else {
        restScore = 15;
    }

    // Check referrals
    let refScore = 0;
    if (expected.encaminhamentos && expected.encaminhamentos.length > 0) {
        let found = 0;
        for (const expRef of expected.encaminhamentos) {
            if (userEncaminhamentos.some(e => isSimilar(e, expRef))) {
                found++;
                corretos.push(`✓ Encaminhamento: ${expRef}`);
            } else {
                faltantes.push(`Faltou encaminhamento: ${expRef}`);
            }
        }
        refScore = (found / expected.encaminhamentos.length) * 15;
    } else {
        refScore = 15;
    }

    // Check guidance
    let guidScore = 0;
    if (expected.orientacoes && expected.orientacoes.length > 0) {
        let found = 0;
        for (const expGuide of expected.orientacoes) {
            if (userOrientacoes.some(o => isSimilar(o, expGuide))) {
                found++;
                corretos.push(`✓ Orientação: ${expGuide}`);
            } else {
                faltantes.push(`Faltou orientação: ${expGuide}`);
            }
        }
        guidScore = (found / expected.orientacoes.length) * 15;
    } else {
        guidScore = 15;
    }

    const score = medsScore + dietScore + restScore + refScore + guidScore;

    return {
        score: Math.max(0, Math.min(100, Math.round(score))),
        corretos,
        incorretos,
        faltantes
    };
}

/**
 * Main extended evaluation function
 */
export function evaluateExtendedPhases(input: ExtendedEvaluationInput): ExtendedEvaluationResult {
    const diagEval = evaluateDiagnoses(
        input.hypotheses,
        input.osceCase.expectedDiagnoses
    );

    // Get expected exam IDs from exam results
    const expectedExamIds = input.osceCase.examResults?.map(r => r.examId) || [];

    const examsEval = evaluateExams(
        input.requestedExams,
        input.osceCase.availableExams,
        expectedExamIds
    );

    const rxEval = evaluatePrescription(
        input.prescription,
        input.osceCase.expectedPrescription
    );

    return {
        scoreDiagnostico: diagEval.score,
        scoreExames: examsEval.score,
        scorePrescricao: rxEval.score,

        diagnosticoFeedback: {
            acertos: diagEval.acertos,
            erros: diagEval.erros,
            faltou: diagEval.faltou
        },

        examesFeedback: {
            adequados: examsEval.adequados,
            desnecessarios: examsEval.desnecessarios,
            faltantes: examsEval.faltantes
        },

        prescricaoFeedback: {
            corretos: rxEval.corretos,
            incorretos: rxEval.incorretos,
            faltantes: rxEval.faltantes
        }
    };
}
