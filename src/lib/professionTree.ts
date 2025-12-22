// Medical Career Profession Tree - Gamified Version with Lucide Icons
// Redesigned with reduced level requirements for faster progression

export interface ProfessionNode {
    id: string;
    label: string;
    description?: string;
    parentId?: string;
    levelRequired: number;
    icon?: string; // Lucide icon name
    color?: string;
    children?: ProfessionNode[];
}

// Career areas with colors
export const CAREER_AREAS = {
    clinica: { name: 'Clínica Médica', color: 'red', icon: 'Stethoscope', bgColor: 'bg-red-500' },
    cirurgia: { name: 'Cirurgia', color: 'blue', icon: 'Scissors', bgColor: 'bg-blue-500' },
    pediatria: { name: 'Pediatria', color: 'emerald', icon: 'Baby', bgColor: 'bg-emerald-500' },
    mulher: { name: 'Saúde da Mulher', color: 'pink', icon: 'Heart', bgColor: 'bg-pink-500' },
    neuro: { name: 'Neurociências', color: 'purple', icon: 'Brain', bgColor: 'bg-purple-500' },
    diagnostico: { name: 'Diagnóstico', color: 'amber', icon: 'Microscope', bgColor: 'bg-amber-500' },
    intensiva: { name: 'Intensiva/Emergência', color: 'orange', icon: 'Siren', bgColor: 'bg-orange-500' },
    preventiva: { name: 'Preventiva/Trabalho', color: 'teal', icon: 'ClipboardList', bgColor: 'bg-teal-500' },
} as const;

export const professionTree: ProfessionNode[] = [
    {
        id: 'academic',
        label: 'Acadêmico',
        levelRequired: 1,
        icon: 'BookOpen',
        color: 'slate',
        description: 'Estudante de Medicina',
        children: [
            // ========== CLÍNICA MÉDICA ==========
            {
                id: 'clinica-medica',
                label: 'Clínica Médica',
                levelRequired: 3,
                icon: 'Stethoscope',
                color: 'red',
                children: [
                    {
                        id: 'cardiologia', label: 'Cardiologia', levelRequired: 8, icon: 'HeartPulse', color: 'red',
                        children: [
                            { id: 'hemodinamica', label: 'Hemodinâmica', levelRequired: 15, icon: 'Activity' },
                            { id: 'eletrofisiologia', label: 'Eletrofisiologia', levelRequired: 15, icon: 'Zap' },
                            { id: 'ic-avancada', label: 'Insuf. Cardíaca', levelRequired: 15, icon: 'Heart' },
                        ]
                    },
                    {
                        id: 'pneumologia', label: 'Pneumologia', levelRequired: 8, icon: 'Wind', color: 'red',
                        children: [
                            { id: 'broncoscopia', label: 'Broncoscopia', levelRequired: 15, icon: 'Search' },
                            { id: 'sono-pneumo', label: 'Medicina do Sono', levelRequired: 15, icon: 'Moon' },
                        ]
                    },
                    {
                        id: 'gastro', label: 'Gastroenterologia', levelRequired: 8, icon: 'UtensilsCrossed', color: 'red',
                        children: [
                            { id: 'endoscopia', label: 'Endoscopia', levelRequired: 15, icon: 'ScanLine' },
                            { id: 'hepatologia', label: 'Hepatologia', levelRequired: 15, icon: 'Pill' },
                        ]
                    },
                    { id: 'endocrino', label: 'Endocrinologia', levelRequired: 8, icon: 'Sparkles', color: 'red' },
                    { id: 'nefro', label: 'Nefrologia', levelRequired: 8, icon: 'Droplets', color: 'red' },
                    { id: 'hemato', label: 'Hematologia', levelRequired: 8, icon: 'Droplet', color: 'red' },
                    { id: 'infecto', label: 'Infectologia', levelRequired: 8, icon: 'Bug', color: 'red' },
                    { id: 'reumato', label: 'Reumatologia', levelRequired: 8, icon: 'Bone', color: 'red' },
                    { id: 'geriatria', label: 'Geriatria', levelRequired: 8, icon: 'PersonStanding', color: 'red' },
                    { id: 'onco-clinica', label: 'Oncologia', levelRequired: 8, icon: 'Ribbon', color: 'red' },
                ]
            },

            // ========== CIRURGIA ==========
            {
                id: 'cirurgia-geral',
                label: 'Cirurgia Geral',
                levelRequired: 3,
                icon: 'Scissors',
                color: 'blue',
                children: [
                    {
                        id: 'cir-digestivo', label: 'Cir. Digestiva', levelRequired: 8, icon: 'Slice', color: 'blue',
                        children: [
                            { id: 'bariatrica', label: 'Bariátrica', levelRequired: 15, icon: 'Scale' },
                            { id: 'coloprocto', label: 'Coloproctologia', levelRequired: 15, icon: 'Scan' },
                        ]
                    },
                    { id: 'cir-vascular', label: 'Cir. Vascular', levelRequired: 8, icon: 'GitBranch', color: 'blue' },
                    { id: 'cir-toracica', label: 'Cir. Torácica', levelRequired: 8, icon: 'Wind', color: 'blue' },
                    { id: 'urologia', label: 'Urologia', levelRequired: 8, icon: 'Droplets', color: 'blue' },
                    { id: 'cir-plastica', label: 'Cir. Plástica', levelRequired: 8, icon: 'Sparkle', color: 'blue' },
                    { id: 'transplante', label: 'Transplante', levelRequired: 8, icon: 'HeartHandshake', color: 'blue' },
                ]
            },

            // ========== PEDIATRIA ==========
            {
                id: 'pediatria',
                label: 'Pediatria',
                levelRequired: 3,
                icon: 'Baby',
                color: 'emerald',
                children: [
                    { id: 'neo', label: 'Neonatologia', levelRequired: 8, icon: 'Baby', color: 'emerald' },
                    { id: 'cardio-ped', label: 'Cardioped.', levelRequired: 8, icon: 'HeartPulse', color: 'emerald' },
                    { id: 'neuro-ped', label: 'Neuroped.', levelRequired: 8, icon: 'Brain', color: 'emerald' },
                    { id: 'uti-ped', label: 'UTI Ped.', levelRequired: 8, icon: 'Hospital', color: 'emerald' },
                ]
            },

            // ========== SAÚDE DA MULHER ==========
            {
                id: 'go',
                label: 'Ginecologia/Obstetrícia',
                levelRequired: 3,
                icon: 'Heart',
                color: 'pink',
                children: [
                    { id: 'fetal', label: 'Medicina Fetal', levelRequired: 8, icon: 'Baby', color: 'pink' },
                    { id: 'reproducao', label: 'Reprodução', levelRequired: 8, icon: 'Dna', color: 'pink' },
                    { id: 'onco-gine', label: 'Oncogine', levelRequired: 8, icon: 'Ribbon', color: 'pink' },
                ]
            },

            // ========== NEUROCIÊNCIAS ==========
            {
                id: 'neurologia',
                label: 'Neurologia',
                levelRequired: 3,
                icon: 'Brain',
                color: 'purple',
                children: [
                    { id: 'neuro-vasc', label: 'Neuro Vascular', levelRequired: 8, icon: 'GitBranch', color: 'purple' },
                    { id: 'epilepsia', label: 'Epilepsia', levelRequired: 8, icon: 'Zap', color: 'purple' },
                    { id: 'movimento', label: 'Mov./Parkinson', levelRequired: 8, icon: 'Move', color: 'purple' },
                    { id: 'cognitiva', label: 'Demências', levelRequired: 8, icon: 'BrainCircuit', color: 'purple' },
                ]
            },
            {
                id: 'neurocirurgia',
                label: 'Neurocirurgia',
                levelRequired: 3,
                icon: 'BrainCog',
                color: 'purple',
                children: [
                    { id: 'coluna', label: 'Coluna', levelRequired: 8, icon: 'Bone', color: 'purple' },
                    { id: 'base-cranio', label: 'Base Crânio', levelRequired: 8, icon: 'Skull', color: 'purple' },
                ]
            },
            {
                id: 'psiquiatria',
                label: 'Psiquiatria',
                levelRequired: 3,
                icon: 'Smile',
                color: 'purple',
                children: [
                    { id: 'psiq-infancia', label: 'Infância/Adol.', levelRequired: 8, icon: 'Users', color: 'purple' },
                    { id: 'forense', label: 'Forense', levelRequired: 8, icon: 'Scale', color: 'purple' },
                ]
            },

            // ========== ORTOPEDIA ==========
            {
                id: 'ortopedia',
                label: 'Ortopedia',
                levelRequired: 3,
                icon: 'Bone',
                color: 'gray',
                children: [
                    { id: 'coluna-orto', label: 'Coluna', levelRequired: 8, icon: 'Bone', color: 'gray' },
                    { id: 'joelho', label: 'Joelho', levelRequired: 8, icon: 'CircleDot', color: 'gray' },
                    { id: 'ombro', label: 'Ombro', levelRequired: 8, icon: 'Dumbbell', color: 'gray' },
                    { id: 'trauma-orto', label: 'Trauma', levelRequired: 8, icon: 'Wrench', color: 'gray' },
                ]
            },

            // ========== DIAGNÓSTICO ==========
            {
                id: 'radio',
                label: 'Radiologia',
                levelRequired: 3,
                icon: 'ScanLine',
                color: 'amber',
                children: [
                    { id: 'radio-interv', label: 'Intervencionista', levelRequired: 8, icon: 'Syringe', color: 'amber' },
                    { id: 'neuro-radio', label: 'Neuroradio', levelRequired: 8, icon: 'Brain', color: 'amber' },
                    { id: 'mama', label: 'Mamografia', levelRequired: 8, icon: 'Scan', color: 'amber' },
                ]
            },
            {
                id: 'patologia',
                label: 'Patologia',
                levelRequired: 3,
                icon: 'Microscope',
                color: 'amber',
                children: [
                    { id: 'pato-cir', label: 'Cirúrgica', levelRequired: 8, icon: 'Scissors', color: 'amber' },
                    { id: 'pato-mol', label: 'Molecular', levelRequired: 8, icon: 'Dna', color: 'amber' },
                ]
            },

            // ========== INTENSIVA/EMERGÊNCIA ==========
            {
                id: 'emergencia',
                label: 'Emergência',
                levelRequired: 3,
                icon: 'Siren',
                color: 'orange',
                children: [
                    { id: 'trauma-emerg', label: 'Trauma', levelRequired: 8, icon: 'Bandage', color: 'orange' },
                    { id: 'eco-emerg', label: 'POCUS/US', levelRequired: 8, icon: 'Radio', color: 'orange' },
                ]
            },
            {
                id: 'uti',
                label: 'Terapia Intensiva',
                levelRequired: 3,
                icon: 'HeartPulse',
                color: 'orange',
                children: [
                    { id: 'uti-adulto', label: 'UTI Adulto', levelRequired: 8, icon: 'BedDouble', color: 'orange' },
                    { id: 'uti-neo', label: 'UTI Neonatal', levelRequired: 8, icon: 'Baby', color: 'orange' },
                ]
            },
            {
                id: 'anestesia',
                label: 'Anestesiologia',
                levelRequired: 3,
                icon: 'Syringe',
                color: 'orange',
                children: [
                    { id: 'dor', label: 'Dor Crônica', levelRequired: 8, icon: 'Frown', color: 'orange' },
                    { id: 'cardio-anes', label: 'Cardíaca', levelRequired: 8, icon: 'HeartPulse', color: 'orange' },
                ]
            },

            // ========== OUTRAS ==========
            {
                id: 'dermato',
                label: 'Dermatologia',
                levelRequired: 3,
                icon: 'Paintbrush',
                color: 'rose',
                children: [
                    { id: 'cosmiatria', label: 'Cosmiatria', levelRequired: 8, icon: 'Sparkles', color: 'rose' },
                    { id: 'cir-dermato', label: 'Cirúrgica', levelRequired: 8, icon: 'Scissors', color: 'rose' },
                ]
            },
            {
                id: 'prev',
                label: 'Med. Preventiva',
                levelRequired: 3,
                icon: 'BarChart3',
                color: 'teal',
                children: [
                    { id: 'epidemio', label: 'Epidemiologia', levelRequired: 8, icon: 'TrendingUp', color: 'teal' },
                    { id: 'gestao', label: 'Gestão', levelRequired: 8, icon: 'ClipboardList', color: 'teal' },
                ]
            },
            {
                id: 'trabalho',
                label: 'Med. Trabalho',
                levelRequired: 3,
                icon: 'HardHat',
                color: 'teal',
                children: [
                    { id: 'ergonomia', label: 'Ergonomia', levelRequired: 8, icon: 'Armchair', color: 'teal' },
                    { id: 'pericias', label: 'Perícias', levelRequired: 8, icon: 'FileText', color: 'teal' },
                ]
            },
        ]
    }
];

// Helper to flatten tree for easier access
export const flattenTree = (nodes: ProfessionNode[], parentId?: string): ProfessionNode[] => {
    return nodes.reduce<ProfessionNode[]>((acc, node) => {
        const nodeWithParent = { ...node, parentId };
        acc.push(nodeWithParent);
        if (node.children) {
            acc.push(...flattenTree(node.children, node.id));
        }
        return acc;
    }, []);
};

export const allProfessions = flattenTree(professionTree);
