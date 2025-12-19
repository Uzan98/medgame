export interface ProfessionNode {
    id: string;
    label: string;
    description?: string;
    parentId?: string;
    levelRequired: number;
    children?: ProfessionNode[];
}

export const professionTree: ProfessionNode[] = [
    {
        id: 'academic',
        label: 'Acadêmico',
        levelRequired: 1,
        description: 'Estudante de Medicina e Interno',
        children: [
            {
                id: 'clinica-medica',
                label: 'Clínica Médica',
                levelRequired: 5,
                children: [
                    {
                        id: 'cardiologia',
                        label: 'Cardiologia',
                        levelRequired: 15,
                        children: [
                            { id: 'hemodinamica', label: 'Hemodinâmica / Intervencionista', levelRequired: 30 },
                            { id: 'eletrofisiologia', label: 'Eletrofisiologia', levelRequired: 30 },
                            { id: 'ic-avancada', label: 'Insuficiência Cardíaca Avançada', levelRequired: 30 },
                            { id: 'marcapasso', label: 'Marcapasso e Dispositivos', levelRequired: 30 },
                            { id: 'imagem-cardio', label: 'Imagem Cardiovascular Avançada', levelRequired: 30 },
                        ]
                    },
                    {
                        id: 'pneumologia',
                        label: 'Pneumologia',
                        levelRequired: 15,
                        children: [
                            { id: 'broncoscopia', label: 'Broncoscopia Avançada', levelRequired: 30 },
                            { id: 'sono-pneumo', label: 'Medicina do Sono', levelRequired: 30 },
                        ]
                    },
                    {
                        id: 'gastro',
                        label: 'Gastroenterologia',
                        levelRequired: 15,
                        children: [
                            { id: 'endoscopia', label: 'Endoscopia Digestiva Avançada', levelRequired: 30 },
                            { id: 'hepatologia', label: 'Hepatologia', levelRequired: 30 },
                            { id: 'motilidade', label: 'Motilidade Digestiva', levelRequired: 30 },
                        ]
                    },
                    {
                        id: 'endocrino',
                        label: 'Endocrinologia',
                        levelRequired: 15,
                        children: [
                            { id: 'diabetologia', label: 'Diabetologia Avançada', levelRequired: 30 },
                            { id: 'obesidade', label: 'Obesidade / Metabologia', levelRequired: 30 },
                        ]
                    },
                    { id: 'reumato', label: 'Reumatologia', levelRequired: 15 },
                    {
                        id: 'nefro',
                        label: 'Nefrologia',
                        levelRequired: 15,
                        children: [
                            { id: 'tx-renal', label: 'Transplante Renal', levelRequired: 30 },
                            { id: 'nefro-interv', label: 'Nefrologia Intervencionista', levelRequired: 30 },
                        ]
                    },
                    {
                        id: 'hemato',
                        label: 'Hematologia',
                        levelRequired: 15,
                        children: [
                            { id: 'tmo', label: 'Transplante de Medula Óssea', levelRequired: 30 },
                            { id: 'hemato-lab', label: 'Hematologia Laboratorial', levelRequired: 30 },
                        ]
                    },
                    {
                        id: 'infecto',
                        label: 'Infectologia',
                        levelRequired: 15,
                        children: [
                            { id: 'tropicais', label: 'Doenças Tropicais', levelRequired: 30 },
                            { id: 'ccih', label: 'Controle de Infecção', levelRequired: 30 },
                        ]
                    },
                    {
                        id: 'onco-clinica',
                        label: 'Oncologia Clínica',
                        levelRequired: 15,
                        children: [
                            { id: 'onco-torax', label: 'Oncologia Torácica', levelRequired: 30 },
                            { id: 'onco-gastro', label: 'Oncologia Gastrointestinal', levelRequired: 30 },
                            { id: 'onco-hemato', label: 'Onco-Hematologia', levelRequired: 30 },
                            { id: 'paliativos-onco', label: 'Cuidados Paliativos Oncológicos', levelRequired: 30 },
                        ]
                    },
                    { id: 'geriatria', label: 'Geriatria', levelRequired: 15 },
                    { id: 'alergia', label: 'Alergia e Imunologia', levelRequired: 15 },
                    { id: 'med-esporte', label: 'Medicina Esportiva', levelRequired: 15 },
                    { id: 'paliativos', label: 'Cuidados Paliativos', levelRequired: 15 },
                ]
            },
            {
                id: 'cirurgia-geral',
                label: 'Cirurgia Geral',
                levelRequired: 5,
                children: [
                    {
                        id: 'cir-digestivo',
                        label: 'Cirurgia do Aparelho Digestivo',
                        levelRequired: 15,
                        children: [
                            { id: 'hpb', label: 'Cirurgia Hepatobiliopancreática', levelRequired: 30 },
                            { id: 'esofago', label: 'Cirurgia Esofagogástrica', levelRequired: 30 },
                            { id: 'bariatrica', label: 'Cirurgia Bariátrica', levelRequired: 30 },
                            { id: 'coloprocto', label: 'Coloproctologia', levelRequired: 30 },
                        ]
                    },
                    {
                        id: 'cir-vascular',
                        label: 'Cirurgia Vascular',
                        levelRequired: 15,
                        children: [
                            { id: 'endovascular', label: 'Endovascular Avançado', levelRequired: 30 },
                            { id: 'aneurismas', label: 'Aneurismas Complexos', levelRequired: 30 },
                            { id: 'carotidea', label: 'Cirurgia Carotídea', levelRequired: 30 },
                        ]
                    },
                    {
                        id: 'cir-toracica',
                        label: 'Cirurgia Torácica',
                        levelRequired: 15,
                        children: [
                            { id: 'onco-torax-cir', label: 'Oncologia Torácica', levelRequired: 30 },
                            { id: 'endoscopia-torax', label: 'Endoscopia Torácica', levelRequired: 30 },
                        ]
                    },
                    {
                        id: 'urologia',
                        label: 'Urologia',
                        levelRequired: 15,
                        children: [
                            { id: 'uro-onco', label: 'Uro-Oncologia', levelRequired: 30 },
                            { id: 'endourologia', label: 'Endourologia', levelRequired: 30 },
                            { id: 'andrologia', label: 'Andrologia', levelRequired: 30 },
                            { id: 'uro-reconst', label: 'Urologia Reconstrutora', levelRequired: 30 },
                        ]
                    },
                    {
                        id: 'cir-plastica',
                        label: 'Cirurgia Plástica',
                        levelRequired: 15,
                        children: [
                            { id: 'microcirurgia', label: 'Microcirurgia', levelRequired: 30 },
                            { id: 'cranio-maxilo', label: 'Crânio-Maxilofacial', levelRequired: 30 },
                            { id: 'mao', label: 'Cirurgia da Mão', levelRequired: 30 },
                            { id: 'queimados', label: 'Cirurgia de Queimados', levelRequired: 30 },
                            { id: 'estetica', label: 'Estética Avançada', levelRequired: 30 },
                        ]
                    },
                    { id: 'cir-onco', label: 'Cirurgia Oncológica', levelRequired: 15 },
                    {
                        id: 'transplante',
                        label: 'Transplante',
                        levelRequired: 15,
                        children: [
                            { id: 'tx-figado', label: 'Transplante Hepático', levelRequired: 30 },
                            { id: 'tx-cardio', label: 'Transplante Cardíaco', levelRequired: 30 },
                            { id: 'tx-rim', label: 'Transplante Renal', levelRequired: 30 },
                            { id: 'tx-pulmao', label: 'Transplante Pulmonar', levelRequired: 30 },
                        ]
                    }
                ]
            },
            {
                id: 'pediatria',
                label: 'Pediatria',
                levelRequired: 5,
                children: [
                    { id: 'neo', label: 'Neonatologia', levelRequired: 15 },
                    { id: 'cardio-ped', label: 'Cardiologia Pediátrica', levelRequired: 15 },
                    { id: 'neuro-ped', label: 'Neurologia Pediátrica', levelRequired: 15 },
                    { id: 'endocrino-ped', label: 'Endocrinopediatria', levelRequired: 15 },
                    { id: 'pneumo-ped', label: 'Pneumopediatria', levelRequired: 15 },
                    { id: 'nefro-ped', label: 'Nefropediatria', levelRequired: 15 },
                    { id: 'gastro-ped', label: 'Gastroenteropediatria', levelRequired: 15 },
                    { id: 'hemato-ped', label: 'Hematopediatria', levelRequired: 15 },
                    { id: 'onco-ped', label: 'Oncopediatria', levelRequired: 15 },
                    { id: 'reumato-ped', label: 'Reumatopediatria', levelRequired: 15 },
                    { id: 'alergia-ped', label: 'Alergopediatria', levelRequired: 15 },
                    { id: 'uti-ped', label: 'Terapia Intensiva Pediátrica', levelRequired: 15 },
                ]
            },
            {
                id: 'go',
                label: 'Ginecologia e Obstetrícia',
                levelRequired: 5,
                children: [
                    { id: 'fetal', label: 'Medicina Materno-Fetal', levelRequired: 15 },
                    { id: 'reproducao', label: 'Reprodução Humana', levelRequired: 15 },
                    { id: 'endoscopia-gine', label: 'Endoscopia Ginecológica', levelRequired: 15 },
                    { id: 'urogine', label: 'Uroginecologia', levelRequired: 15 },
                    { id: 'ptgi', label: 'Patologia Trato Genital Inf.', levelRequired: 15 },
                    { id: 'onco-gine', label: 'Oncoginecologia', levelRequired: 15 },
                ]
            },
            {
                id: 'psiquiatria',
                label: 'Psiquiatria',
                levelRequired: 5,
                children: [
                    { id: 'psiq-infancia', label: 'Infância e Adolescência', levelRequired: 15 },
                    { id: 'forense', label: 'Psiquiatria Forense', levelRequired: 15 },
                    { id: 'psicogeriatria', label: 'Psicogeriatria', levelRequired: 15 },
                    { id: 'psiq-hosp', label: 'Interconsulta / Hospitalar', levelRequired: 15 },
                ]
            },
            {
                id: 'neurologia',
                label: 'Neurologia',
                levelRequired: 5,
                children: [
                    { id: 'neuro-vasc', label: 'Neurologia Vascular', levelRequired: 15 },
                    { id: 'neuro-imuno', label: 'Neuroimunologia', levelRequired: 15 },
                    { id: 'epilepsia', label: 'Epilepsia', levelRequired: 15 },
                    { id: 'movimento', label: 'Distúrbios do Movimento', levelRequired: 15 },
                    { id: 'neuro-musc', label: 'Neuromuscular', levelRequired: 15 },
                    { id: 'cefaleias', label: 'Cefaleias', levelRequired: 15 },
                    { id: 'cognitiva', label: 'Cognitiva / Demências', levelRequired: 15 },
                ]
            },
            {
                id: 'neurocirurgia',
                label: 'Neurocirurgia',
                levelRequired: 5,
                children: [
                    { id: 'base-cranio', label: 'Base de Crânio', levelRequired: 15 },
                    { id: 'nc-vasc', label: 'Neurocirurgia Vascular', levelRequired: 15 },
                    { id: 'nc-func', label: 'Neurocirurgia Funcional', levelRequired: 15 },
                    { id: 'nc-onco', label: 'Oncologia Neurocirúrgica', levelRequired: 15 },
                    { id: 'nc-epi', label: 'Epilepsia Cirúrgica', levelRequired: 15 },
                    { id: 'coluna', label: 'Coluna / Neuro-Ortopedia', levelRequired: 15 },
                    { id: 'nc-ped', label: 'Neurocirurgia Pediátrica', levelRequired: 15 },
                ]
            },
            {
                id: 'ortopedia',
                label: 'Ortopedia e Traumatologia',
                levelRequired: 5,
                children: [
                    { id: 'coluna-orto', label: 'Coluna', levelRequired: 15 },
                    { id: 'ombro', label: 'Ombro e Cotovelo', levelRequired: 15 },
                    { id: 'joelho', label: 'Joelho', levelRequired: 15 },
                    { id: 'pe', label: 'Pé e Tornozelo', levelRequired: 15 },
                    { id: 'mao-orto', label: 'Mão', levelRequired: 15 },
                    { id: 'quadril', label: 'Quadril', levelRequired: 15 },
                    { id: 'trauma-orto', label: 'Traumato-Ortopedia', levelRequired: 15 },
                ]
            },
            {
                id: 'anestesia',
                label: 'Anestesiologia',
                levelRequired: 5,
                children: [
                    { id: 'dor', label: 'Dor', levelRequired: 15 },
                    { id: 'paliativos-anes', label: 'Cuidados Paliativos', levelRequired: 15 },
                    { id: 'cardio-anes', label: 'Anestesia Cardíaca', levelRequired: 15 },
                    { id: 'ped-anes', label: 'Anestesia Pediátrica', levelRequired: 15 },
                    { id: 'neuro-anes', label: 'Neuroanestesia', levelRequired: 15 },
                    { id: 'regional', label: 'Anestesia Regional', levelRequired: 15 },
                ]
            },
            {
                id: 'emergencia',
                label: 'Medicina de Emergência',
                levelRequired: 5,
                children: [
                    { id: 'eco-emerg', label: 'Ecografia em Emergências', levelRequired: 15 },
                    { id: 'trauma-emerg', label: 'Trauma', levelRequired: 15 },
                    { id: 'uti-emerg', label: 'Terapia Intensiva', levelRequired: 15 },
                ]
            },
            {
                id: 'uti',
                label: 'Terapia Intensiva',
                levelRequired: 5,
                children: [
                    { id: 'uti-adulto', label: 'Intensivista Adulto', levelRequired: 15 },
                    { id: 'uti-ped-espec', label: 'Intensivista Pediátrico', levelRequired: 15 },
                    { id: 'uti-neo', label: 'Intensivista Neonatal', levelRequired: 15 },
                ]
            },
            {
                id: 'radio',
                label: 'Radiologia',
                levelRequired: 5,
                children: [
                    { id: 'radio-interv', label: 'Radiologia Intervencionista', levelRequired: 15 },
                    { id: 'neuro-radio', label: 'Neurorradiologia', levelRequired: 15 },
                    { id: 'radio-musc', label: 'Musculoesquelética', levelRequired: 15 },
                    { id: 'mama', label: 'Radiologia de Mama', levelRequired: 15 },
                    { id: 'cardio-img', label: 'Cardiovascular', levelRequired: 15 },
                    { id: 'radio-abd', label: 'Abdominal', levelRequired: 15 },
                    { id: 'radio-torax', label: 'Tórax', levelRequired: 15 },
                ]
            },
            {
                id: 'patologia',
                label: 'Patologia',
                levelRequired: 5,
                children: [
                    { id: 'pato-cir', label: 'Patologia Cirúrgica', levelRequired: 15 },
                    { id: 'hemato-pato', label: 'Hematopatologia', levelRequired: 15 },
                    { id: 'pato-mol', label: 'Patologia Molecular', levelRequired: 15 },
                    { id: 'pato-for', label: 'Patologia Forense', levelRequired: 15 },
                ]
            },
            {
                id: 'med-nuclear',
                label: 'Medicina Nuclear',
                levelRequired: 5,
                children: [
                    { id: 'pet', label: 'PET-CT Avançado', levelRequired: 15 },
                    { id: 'radioisotopos', label: 'Radioisótopos Terapêuticos', levelRequired: 15 },
                    { id: 'onco-nuc', label: 'Onconuclear', levelRequired: 15 },
                ]
            },
            {
                id: 'prev',
                label: 'Preventiva e Social',
                levelRequired: 5,
                children: [
                    { id: 'epidemio', label: 'Epidemiologia', levelRequired: 15 },
                    { id: 'auditoria', label: 'Auditoria Médica', levelRequired: 15 },
                    { id: 'gestao', label: 'Gestão em Saúde', levelRequired: 15 },
                ]
            },
            {
                id: 'trabalho',
                label: 'Medicina do Trabalho',
                levelRequired: 5,
                children: [
                    { id: 'ergonomia', label: 'Ergonomia', levelRequired: 15 },
                    { id: 'pericias', label: 'Perícias Ocupacionais', levelRequired: 15 },
                ]
            },
            {
                id: 'dermato',
                label: 'Dermatologia',
                levelRequired: 5,
                children: [
                    { id: 'dermatoscopia', label: 'Dermatoscopia Avançada', levelRequired: 15 },
                    { id: 'cir-dermato', label: 'Cirurgia Dermatológica', levelRequired: 15 },
                    { id: 'cosmiatria', label: 'Cosmiatria', levelRequired: 15 },
                    { id: 'dermato-ped', label: 'Dermatopediatria', levelRequired: 15 },
                ]
            }
        ]
    }
];
