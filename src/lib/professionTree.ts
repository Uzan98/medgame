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
                        levelRequired: 10,
                        children: [
                            { id: 'hemodinamica', label: 'Hemodinâmica / Intervencionista', levelRequired: 15 },
                            { id: 'eletrofisiologia', label: 'Eletrofisiologia', levelRequired: 15 },
                            { id: 'ic-avancada', label: 'Insuficiência Cardíaca Avançada', levelRequired: 15 },
                            { id: 'marcapasso', label: 'Marcapasso e Dispositivos', levelRequired: 15 },
                            { id: 'imagem-cardio', label: 'Imagem Cardiovascular Avançada', levelRequired: 15 },
                        ]
                    },
                    {
                        id: 'pneumologia',
                        label: 'Pneumologia',
                        levelRequired: 10,
                        children: [
                            { id: 'broncoscopia', label: 'Broncoscopia Avançada', levelRequired: 15 },
                            { id: 'sono-pneumo', label: 'Medicina do Sono', levelRequired: 15 },
                        ]
                    },
                    {
                        id: 'gastro',
                        label: 'Gastroenterologia',
                        levelRequired: 10,
                        children: [
                            { id: 'endoscopia', label: 'Endoscopia Digestiva Avançada', levelRequired: 15 },
                            { id: 'hepatologia', label: 'Hepatologia', levelRequired: 15 },
                            { id: 'motilidade', label: 'Motilidade Digestiva', levelRequired: 15 },
                        ]
                    },
                    {
                        id: 'endocrino',
                        label: 'Endocrinologia',
                        levelRequired: 10,
                        children: [
                            { id: 'diabetologia', label: 'Diabetologia Avançada', levelRequired: 15 },
                            { id: 'obesidade', label: 'Obesidade / Metabologia', levelRequired: 15 },
                        ]
                    },
                    { id: 'reumato', label: 'Reumatologia', levelRequired: 10 },
                    {
                        id: 'nefro',
                        label: 'Nefrologia',
                        levelRequired: 10,
                        children: [
                            { id: 'tx-renal', label: 'Transplante Renal', levelRequired: 15 },
                            { id: 'nefro-interv', label: 'Nefrologia Intervencionista', levelRequired: 15 },
                        ]
                    },
                    {
                        id: 'hemato',
                        label: 'Hematologia',
                        levelRequired: 10,
                        children: [
                            { id: 'tmo', label: 'Transplante de Medula Óssea', levelRequired: 15 },
                            { id: 'hemato-lab', label: 'Hematologia Laboratorial', levelRequired: 15 },
                        ]
                    },
                    {
                        id: 'infecto',
                        label: 'Infectologia',
                        levelRequired: 10,
                        children: [
                            { id: 'tropicais', label: 'Doenças Tropicais', levelRequired: 15 },
                            { id: 'ccih', label: 'Controle de Infecção', levelRequired: 15 },
                        ]
                    },
                    {
                        id: 'onco-clinica',
                        label: 'Oncologia Clínica',
                        levelRequired: 10,
                        children: [
                            { id: 'onco-torax', label: 'Oncologia Torácica', levelRequired: 15 },
                            { id: 'onco-gastro', label: 'Oncologia Gastrointestinal', levelRequired: 15 },
                            { id: 'onco-hemato', label: 'Onco-Hematologia', levelRequired: 15 },
                            { id: 'paliativos-onco', label: 'Cuidados Paliativos Oncológicos', levelRequired: 15 },
                        ]
                    },
                    { id: 'geriatria', label: 'Geriatria', levelRequired: 10 },
                    { id: 'alergia', label: 'Alergia e Imunologia', levelRequired: 10 },
                    { id: 'med-esporte', label: 'Medicina Esportiva', levelRequired: 10 },
                    { id: 'paliativos', label: 'Cuidados Paliativos', levelRequired: 10 },
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
                        levelRequired: 10,
                        children: [
                            { id: 'hpb', label: 'Cirurgia Hepatobiliopancreática', levelRequired: 15 },
                            { id: 'esofago', label: 'Cirurgia Esofagogástrica', levelRequired: 15 },
                            { id: 'bariatrica', label: 'Cirurgia Bariátrica', levelRequired: 15 },
                            { id: 'coloprocto', label: 'Coloproctologia', levelRequired: 15 },
                        ]
                    },
                    {
                        id: 'cir-vascular',
                        label: 'Cirurgia Vascular',
                        levelRequired: 10,
                        children: [
                            { id: 'endovascular', label: 'Endovascular Avançado', levelRequired: 15 },
                            { id: 'aneurismas', label: 'Aneurismas Complexos', levelRequired: 15 },
                            { id: 'carotidea', label: 'Cirurgia Carotídea', levelRequired: 15 },
                        ]
                    },
                    {
                        id: 'cir-toracica',
                        label: 'Cirurgia Torácica',
                        levelRequired: 10,
                        children: [
                            { id: 'onco-torax-cir', label: 'Oncologia Torácica', levelRequired: 15 },
                            { id: 'endoscopia-torax', label: 'Endoscopia Torácica', levelRequired: 15 },
                        ]
                    },
                    {
                        id: 'urologia',
                        label: 'Urologia',
                        levelRequired: 10,
                        children: [
                            { id: 'uro-onco', label: 'Uro-Oncologia', levelRequired: 15 },
                            { id: 'endourologia', label: 'Endourologia', levelRequired: 15 },
                            { id: 'andrologia', label: 'Andrologia', levelRequired: 15 },
                            { id: 'uro-reconst', label: 'Urologia Reconstrutora', levelRequired: 15 },
                        ]
                    },
                    {
                        id: 'cir-plastica',
                        label: 'Cirurgia Plástica',
                        levelRequired: 10,
                        children: [
                            { id: 'microcirurgia', label: 'Microcirurgia', levelRequired: 15 },
                            { id: 'cranio-maxilo', label: 'Crânio-Maxilofacial', levelRequired: 15 },
                            { id: 'mao', label: 'Cirurgia da Mão', levelRequired: 15 },
                            { id: 'queimados', label: 'Cirurgia de Queimados', levelRequired: 15 },
                            { id: 'estetica', label: 'Estética Avançada', levelRequired: 15 },
                        ]
                    },
                    { id: 'cir-onco', label: 'Cirurgia Oncológica', levelRequired: 10 },
                    {
                        id: 'transplante',
                        label: 'Transplante',
                        levelRequired: 10,
                        children: [
                            { id: 'tx-figado', label: 'Transplante Hepático', levelRequired: 15 },
                            { id: 'tx-cardio', label: 'Transplante Cardíaco', levelRequired: 15 },
                            { id: 'tx-rim', label: 'Transplante Renal', levelRequired: 15 },
                            { id: 'tx-pulmao', label: 'Transplante Pulmonar', levelRequired: 15 },
                        ]
                    }
                ]
            },
            {
                id: 'pediatria',
                label: 'Pediatria',
                levelRequired: 5,
                children: [
                    { id: 'neo', label: 'Neonatologia', levelRequired: 10 },
                    { id: 'cardio-ped', label: 'Cardiologia Pediátrica', levelRequired: 10 },
                    { id: 'neuro-ped', label: 'Neurologia Pediátrica', levelRequired: 10 },
                    { id: 'endocrino-ped', label: 'Endocrinopediatria', levelRequired: 10 },
                    { id: 'pneumo-ped', label: 'Pneumopediatria', levelRequired: 10 },
                    { id: 'nefro-ped', label: 'Nefropediatria', levelRequired: 10 },
                    { id: 'gastro-ped', label: 'Gastroenteropediatria', levelRequired: 10 },
                    { id: 'hemato-ped', label: 'Hematopediatria', levelRequired: 10 },
                    { id: 'onco-ped', label: 'Oncopediatria', levelRequired: 10 },
                    { id: 'reumato-ped', label: 'Reumatopediatria', levelRequired: 10 },
                    { id: 'alergia-ped', label: 'Alergopediatria', levelRequired: 10 },
                    { id: 'uti-ped', label: 'Terapia Intensiva Pediátrica', levelRequired: 10 },
                ]
            },
            {
                id: 'go',
                label: 'Ginecologia e Obstetrícia',
                levelRequired: 5,
                children: [
                    { id: 'fetal', label: 'Medicina Materno-Fetal', levelRequired: 10 },
                    { id: 'reproducao', label: 'Reprodução Humana', levelRequired: 10 },
                    { id: 'endoscopia-gine', label: 'Endoscopia Ginecológica', levelRequired: 10 },
                    { id: 'urogine', label: 'Uroginecologia', levelRequired: 10 },
                    { id: 'ptgi', label: 'Patologia Trato Genital Inf.', levelRequired: 10 },
                    { id: 'onco-gine', label: 'Oncoginecologia', levelRequired: 10 },
                ]
            },
            {
                id: 'psiquiatria',
                label: 'Psiquiatria',
                levelRequired: 5,
                children: [
                    { id: 'psiq-infancia', label: 'Infância e Adolescência', levelRequired: 10 },
                    { id: 'forense', label: 'Psiquiatria Forense', levelRequired: 10 },
                    { id: 'psicogeriatria', label: 'Psicogeriatria', levelRequired: 10 },
                    { id: 'psiq-hosp', label: 'Interconsulta / Hospitalar', levelRequired: 10 },
                ]
            },
            {
                id: 'neurologia',
                label: 'Neurologia',
                levelRequired: 5,
                children: [
                    { id: 'neuro-vasc', label: 'Neurologia Vascular', levelRequired: 10 },
                    { id: 'neuro-imuno', label: 'Neuroimunologia', levelRequired: 10 },
                    { id: 'epilepsia', label: 'Epilepsia', levelRequired: 10 },
                    { id: 'movimento', label: 'Distúrbios do Movimento', levelRequired: 10 },
                    { id: 'neuro-musc', label: 'Neuromuscular', levelRequired: 10 },
                    { id: 'cefaleias', label: 'Cefaleias', levelRequired: 10 },
                    { id: 'cognitiva', label: 'Cognitiva / Demências', levelRequired: 10 },
                ]
            },
            {
                id: 'neurocirurgia',
                label: 'Neurocirurgia',
                levelRequired: 5,
                children: [
                    { id: 'base-cranio', label: 'Base de Crânio', levelRequired: 10 },
                    { id: 'nc-vasc', label: 'Neurocirurgia Vascular', levelRequired: 10 },
                    { id: 'nc-func', label: 'Neurocirurgia Funcional', levelRequired: 10 },
                    { id: 'nc-onco', label: 'Oncologia Neurocirúrgica', levelRequired: 10 },
                    { id: 'nc-epi', label: 'Epilepsia Cirúrgica', levelRequired: 10 },
                    { id: 'coluna', label: 'Coluna / Neuro-Ortopedia', levelRequired: 10 },
                    { id: 'nc-ped', label: 'Neurocirurgia Pediátrica', levelRequired: 10 },
                ]
            },
            {
                id: 'ortopedia',
                label: 'Ortopedia e Traumatologia',
                levelRequired: 5,
                children: [
                    { id: 'coluna-orto', label: 'Coluna', levelRequired: 10 },
                    { id: 'ombro', label: 'Ombro e Cotovelo', levelRequired: 10 },
                    { id: 'joelho', label: 'Joelho', levelRequired: 10 },
                    { id: 'pe', label: 'Pé e Tornozelo', levelRequired: 10 },
                    { id: 'mao-orto', label: 'Mão', levelRequired: 10 },
                    { id: 'quadril', label: 'Quadril', levelRequired: 10 },
                    { id: 'trauma-orto', label: 'Traumato-Ortopedia', levelRequired: 10 },
                ]
            },
            {
                id: 'anestesia',
                label: 'Anestesiologia',
                levelRequired: 5,
                children: [
                    { id: 'dor', label: 'Dor', levelRequired: 10 },
                    { id: 'paliativos-anes', label: 'Cuidados Paliativos', levelRequired: 10 },
                    { id: 'cardio-anes', label: 'Anestesia Cardíaca', levelRequired: 10 },
                    { id: 'ped-anes', label: 'Anestesia Pediátrica', levelRequired: 10 },
                    { id: 'neuro-anes', label: 'Neuroanestesia', levelRequired: 10 },
                    { id: 'regional', label: 'Anestesia Regional', levelRequired: 10 },
                ]
            },
            {
                id: 'emergencia',
                label: 'Medicina de Emergência',
                levelRequired: 5,
                children: [
                    { id: 'eco-emerg', label: 'Ecografia em Emergências', levelRequired: 10 },
                    { id: 'trauma-emerg', label: 'Trauma', levelRequired: 10 },
                    { id: 'uti-emerg', label: 'Terapia Intensiva', levelRequired: 10 },
                ]
            },
            {
                id: 'uti',
                label: 'Terapia Intensiva',
                levelRequired: 5,
                children: [
                    { id: 'uti-adulto', label: 'Intensivista Adulto', levelRequired: 10 },
                    { id: 'uti-ped-espec', label: 'Intensivista Pediátrico', levelRequired: 10 },
                    { id: 'uti-neo', label: 'Intensivista Neonatal', levelRequired: 10 },
                ]
            },
            {
                id: 'radio',
                label: 'Radiologia',
                levelRequired: 5,
                children: [
                    { id: 'radio-interv', label: 'Radiologia Intervencionista', levelRequired: 10 },
                    { id: 'neuro-radio', label: 'Neurorradiologia', levelRequired: 10 },
                    { id: 'radio-musc', label: 'Musculoesquelética', levelRequired: 10 },
                    { id: 'mama', label: 'Radiologia de Mama', levelRequired: 10 },
                    { id: 'cardio-img', label: 'Cardiovascular', levelRequired: 10 },
                    { id: 'radio-abd', label: 'Abdominal', levelRequired: 10 },
                    { id: 'radio-torax', label: 'Tórax', levelRequired: 10 },
                ]
            },
            {
                id: 'patologia',
                label: 'Patologia',
                levelRequired: 5,
                children: [
                    { id: 'pato-cir', label: 'Patologia Cirúrgica', levelRequired: 10 },
                    { id: 'hemato-pato', label: 'Hematopatologia', levelRequired: 10 },
                    { id: 'pato-mol', label: 'Patologia Molecular', levelRequired: 10 },
                    { id: 'pato-for', label: 'Patologia Forense', levelRequired: 10 },
                ]
            },
            {
                id: 'med-nuclear',
                label: 'Medicina Nuclear',
                levelRequired: 5,
                children: [
                    { id: 'pet', label: 'PET-CT Avançado', levelRequired: 10 },
                    { id: 'radioisotopos', label: 'Radioisótopos Terapêuticos', levelRequired: 10 },
                    { id: 'onco-nuc', label: 'Onconuclear', levelRequired: 10 },
                ]
            },
            {
                id: 'prev',
                label: 'Preventiva e Social',
                levelRequired: 5,
                children: [
                    { id: 'epidemio', label: 'Epidemiologia', levelRequired: 10 },
                    { id: 'auditoria', label: 'Auditoria Médica', levelRequired: 10 },
                    { id: 'gestao', label: 'Gestão em Saúde', levelRequired: 10 },
                ]
            },
            {
                id: 'trabalho',
                label: 'Medicina do Trabalho',
                levelRequired: 5,
                children: [
                    { id: 'ergonomia', label: 'Ergonomia', levelRequired: 10 },
                    { id: 'pericias', label: 'Perícias Ocupacionais', levelRequired: 10 },
                ]
            },
            {
                id: 'dermato',
                label: 'Dermatologia',
                levelRequired: 5,
                children: [
                    { id: 'dermatoscopia', label: 'Dermatoscopia Avançada', levelRequired: 10 },
                    { id: 'cir-dermato', label: 'Cirurgia Dermatológica', levelRequired: 10 },
                    { id: 'cosmiatria', label: 'Cosmiatria', levelRequired: 10 },
                    { id: 'dermato-ped', label: 'Dermatopediatria', levelRequired: 10 },
                ]
            }
        ]
    }
];
