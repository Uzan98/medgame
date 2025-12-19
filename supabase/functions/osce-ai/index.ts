// Supabase Edge Function: OSCE AI Proxy
// This function handles all AI interactions for the OSCE mini-game
// It proxies requests to Groq API to keep the API key secure

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'openai/gpt-oss-20b'

// CORS headers for browser requests
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Types for the request/response
interface PatientRequest {
    action: 'ask_patient'
    caseId: string
    question: string
    chatHistory: Array<{ role: string; content: string }>
    trustLevel: number
    systemPrompt?: string // Allow frontend to send the full prompt
    config?: {
        temperature?: number
        max_tokens?: number
    }
}

interface EvaluateRequest {
    action: 'evaluate_anamnesis'
    caseId: string
    questionsAsked: string[]
    prontuario: Record<string, string>
    trustLevel: number
    timeUsed: number
}

interface SuggestRequest {
    action: 'suggest_question' | 'highlight_missing'
    caseId: string
    questionsAsked?: string[]
    prontuario?: Record<string, string>
}

type OsceRequest = PatientRequest | EvaluateRequest | SuggestRequest

// Import case data (we'll need to include the prompts here since Edge Functions are isolated)
// This is a simplified version - in production, you might want to fetch from database

async function callGroq(systemPrompt: string, userMessage: string, config?: { temperature?: number; max_tokens?: number }): Promise<string> {
    const apiKey = Deno.env.get('GROQ_API_KEY')

    if (!apiKey) {
        throw new Error('GROQ_API_KEY not configured')
    }

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            temperature: config?.temperature ?? 0.1, // LOW by default for fact adherence
            max_tokens: config?.max_tokens ?? 500,
            response_format: { type: 'json_object' }
        })
    })

    if (!response.ok) {
        const error = await response.text()
        console.error('Groq API error:', error)
        throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
}

// Handle patient questions (Phase 1)
async function handleAskPatient(req: PatientRequest): Promise<Response> {
    // Use frontend-provided systemPrompt if available, otherwise use fallback
    const systemPrompt = req.systemPrompt || `Você é um paciente em uma consulta médica.

REGRAS ABSOLUTAS:
1. Responda APENAS e EXATAMENTE o que foi perguntado. Nunca antecipe informações.
2. Use linguagem LEIGA (de paciente comum). Nunca use termos médicos.
3. NUNCA dê diagnóstico ou sugestões médicas.
4. Se não entender a pergunta, peça para o médico explicar melhor.
5. Se a pergunta não tiver relação com sua condição, diga que não sabe ou que está normal.

Nível de confiança atual: ${req.trustLevel}/100
${req.trustLevel < 40 ? 'Você está desconfiado ou irritado. Respostas curtas.' :
            req.trustLevel > 70 ? 'Você está confiante. Pode dar mais detalhes.' :
                'Você está relativamente tranquilo.'}

Histórico recente da conversa:
${req.chatHistory.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n')}

Responda SOMENTE no formato JSON:
{
  "resposta": "sua resposta como paciente",
  "emocao": "neutro|preocupado|ansioso|irritado|confiante|aliviado|triste",
  "confiancaDelta": número entre -10 e 10 baseado no tom da pergunta
}`

    try {
        const result = await callGroq(
            systemPrompt,
            `Pergunta do médico: "${req.question}"`,
            req.config // Pass temperature and max_tokens from frontend
        )
        const parsed = JSON.parse(result)

        return new Response(JSON.stringify(parsed), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error('Error in handleAskPatient:', error)
        console.error('Request details:', { question: req.question, hasSystemPrompt: !!req.systemPrompt })

        // Fallback response with error info - make it more natural
        return new Response(JSON.stringify({
            resposta: 'Hmm, não sei responder isso direito, doutor... pode perguntar de outro jeito?',
            emocao: 'neutro',
            confiancaDelta: 0
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
}

// Handle anamnesis evaluation (Phase 2)
async function handleEvaluateAnamnesis(req: EvaluateRequest): Promise<Response> {
    const systemPrompt = `Você é um avaliador clínico experiente em exames OSCE e também um especialista em redação médica.

Sua função é avaliar:
1. O CONTEÚDO da anamnese (dados coletados e registrados)
2. A QUALIDADE DA ESCRITA (terminologia, coesão, coerência, estrutura)

REGRAS PARA CONTEÚDO:
- NÃO invente informações não escritas pelo aluno.
- Avalie APENAS o que foi escrito no prontuário.
- PENALIZE se o aluno escreveu algo que NÃO perguntou na consulta.
- PENALIZE ausência de dados essenciais.

REGRAS PARA ESCRITA:
- Avalie o uso de TERMINOLOGIA MÉDICA correta (ex: "precordialgia" vs "dor no peito")
- Avalie COESÃO: uso de conectivos, fluidez entre ideias
- Avalie COERÊNCIA: ordem lógica, sequência temporal, organização
- Avalie ESTRUTURA: formatação, clareza, objetividade
- Dê EXEMPLOS CONCRETOS de como melhorar
- Sugira REESCRITA quando apropriado

EXEMPLOS DE TERMOS MÉDICOS:
- "dor no peito" → "precordialgia" ou "dor torácica"
- "falta de ar" → "dispneia"
- "inchaço" → "edema"
- "vômito" → "êmese"
- "dor de cabeça" → "cefaleia"
- "pressão alta" → "hipertensão arterial sistêmica (HAS)"
- "começou de repente" → "início súbito"
- "fuma 1 maço por dia há 20 anos" → "tabagista 20 anos-maço"

Perguntas que o aluno fez:
${req.questionsAsked.map((q, i) => `${i + 1}. "${q}"`).join('\n')}

Prontuário do aluno:
- Queixa Principal: ${req.prontuario.queixaPrincipal || '(vazio)'}
- HDA: ${req.prontuario.hda || '(vazio)'}
- Antecedentes: ${req.prontuario.antecedentes || '(vazio)'}
- Medicações: ${req.prontuario.medicacoes || '(vazio)'}
- Hábitos: ${req.prontuario.habitos || '(vazio)'}
- Revisão de Sistemas: ${req.prontuario.revisaoSistemas || '(vazio)'}

Nível de confiança: ${req.trustLevel}/100
Tempo: ${Math.floor(req.timeUsed / 60)} min

Responda SOMENTE no formato JSON:
{
  "scoreTotal": 0-100,
  "scoreColeta": 0-100,
  "scoreComunicacao": 0-100,
  "scoreProntuario": 0-100,
  "scoreSeguranca": 0-100,
  "scoreEscrita": 0-100,
  "avaliacao": {
    "queixaPrincipal": { "completude": 0-100, "faltou": [], "inventou": [], "pontuacao": 0-100 },
    "hda": { "completude": 0-100, "faltou": [], "inventou": [], "pontuacao": 0-100 },
    "antecedentes": { "completude": 0-100, "faltou": [], "inventou": [], "pontuacao": 0-100 },
    "medicacoes": { "completude": 0-100, "faltou": [], "inventou": [], "pontuacao": 0-100 },
    "habitos": { "completude": 0-100, "faltou": [], "inventou": [], "pontuacao": 0-100 },
    "revisaoSistemas": { "completude": 0-100, "faltou": [], "inventou": [], "pontuacao": 0-100 }
  },
  "perguntasEssenciaisFeitas": [],
  "perguntasEssenciaisFaltantes": [],
  "errosGraves": [],
  "feedbackEducacional": [],
  "qualidadeEscrita": {
    "scoreEscrita": 0-100,
    "terminologia": {
      "score": 0-100,
      "termosCorretos": ["termos bem usados"],
      "termosIncorretos": ["termo informal → termo técnico sugerido"],
      "sugestoes": ["dicas para terminologia"]
    },
    "coesao": {
      "score": 0-100,
      "pontosBons": ["conexões bem feitas"],
      "problemas": ["onde faltou conexão"],
      "sugestoes": ["como melhorar fluidez"]
    },
    "coerencia": {
      "score": 0-100,
      "pontosBons": ["sequência lógica"],
      "problemas": ["confusões"],
      "sugestoes": ["como organizar"]
    },
    "estrutura": {
      "score": 0-100,
      "pontosBons": ["boa formatação"],
      "problemas": ["problemas estruturais"],
      "sugestoes": ["melhorias"]
    },
    "dicasGerais": ["dica 1", "dica 2"],
    "exemploReescrita": "Exemplo de como reescrever um trecho de forma mais técnica"
  },
  "xpGanho": número,
  "coinsGanho": número
}`

    try {
        const result = await callGroq(systemPrompt, 'Avalie o prontuário incluindo qualidade da escrita.')
        const parsed = JSON.parse(result)

        return new Response(JSON.stringify(parsed), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error('Error in handleEvaluateAnamnesis:', error)

        // Return a basic evaluation on error
        return new Response(JSON.stringify({
            scoreTotal: 50, scoreColeta: 50, scoreComunicacao: 50, scoreProntuario: 50,
            scoreSeguranca: 100, scoreEscrita: 50,
            avaliacao: {
                queixaPrincipal: { completude: 50, faltou: [], inventou: [], pontuacao: 50 },
                hda: { completude: 50, faltou: [], inventou: [], pontuacao: 50 },
                antecedentes: { completude: 50, faltou: [], inventou: [], pontuacao: 50 },
                medicacoes: { completude: 50, faltou: [], inventou: [], pontuacao: 50 },
                habitos: { completude: 50, faltou: [], inventou: [], pontuacao: 50 },
                revisaoSistemas: { completude: 50, faltou: [], inventou: [], pontuacao: 50 }
            },
            perguntasEssenciaisFeitas: [],
            perguntasEssenciaisFaltantes: ['Erro ao processar'],
            errosGraves: [],
            feedbackEducacional: ['Erro na avaliação. Tente novamente.'],
            qualidadeEscrita: {
                scoreEscrita: 50,
                terminologia: { score: 50, termosCorretos: [], termosIncorretos: [], sugestoes: [] },
                coesao: { score: 50, pontosBons: [], problemas: [], sugestoes: [] },
                coerencia: { score: 50, pontosBons: [], problemas: [], sugestoes: [] },
                estrutura: { score: 50, pontosBons: [], problemas: [], sugestoes: [] },
                dicasGerais: ['Erro ao avaliar'],
                exemploReescrita: null
            },
            xpGanho: 100, coinsGanho: 50
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
}

// Handle suggestion requests
async function handleSuggestion(req: SuggestRequest): Promise<Response> {
    const isQuestion = req.action === 'suggest_question'

    const systemPrompt = isQuestion
        ? `Você é um tutor de semiologia médica. Sugira UMA pergunta importante de anamnese que o aluno ainda não fez.
       Perguntas já feitas: ${req.questionsAsked?.join(', ') || 'nenhuma'}
       Responda em JSON: { "suggestion": "pergunta sugerida" }`
        : `Você é um tutor de semiologia médica. Identifique UM item essencial que está faltando no prontuário.
       Prontuário atual: ${JSON.stringify(req.prontuario)}
       Responda em JSON: { "missing": "item que está faltando" }`

    try {
        const result = await callGroq(systemPrompt, 'Dê sua sugestão.')
        const parsed = JSON.parse(result)

        return new Response(JSON.stringify(parsed), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error('Error in handleSuggestion:', error)

        return new Response(JSON.stringify(
            isQuestion
                ? { suggestion: 'Pergunte sobre os antecedentes do paciente' }
                : { missing: 'Verifique se incluiu todos os sintomas associados' }
        ), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
}

// Main handler
serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body: OsceRequest = await req.json()

        switch (body.action) {
            case 'ask_patient':
                return await handleAskPatient(body as PatientRequest)

            case 'evaluate_anamnesis':
                return await handleEvaluateAnamnesis(body as EvaluateRequest)

            case 'suggest_question':
            case 'highlight_missing':
                return await handleSuggestion(body as SuggestRequest)

            default:
                return new Response(
                    JSON.stringify({ error: 'Unknown action' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
        }
    } catch (error) {
        console.error('Edge function error:', error)
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
