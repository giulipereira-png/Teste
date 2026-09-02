import { ImpactStat, Nucleo, Modality, TeamMember, AthleteStory } from '../types';

export const IMPACT_STATS: ImpactStat[] = [
  {
    id: 'conquistas',
    number: '',
    label: 'Medalhas e Pódios',
    description: 'Conquistas em Campeonatos Brasileiros da CBDI, Campeonato Paulista pela FAP, Torneios escolares e universitário , e mais...',
    iconName: 'Trophy',
  },
  {
    id: 'estilos',
    number: '',
    label: 'Formação Técnica',
    description: 'Aperfeiçoamento completo em Crawl, Costas, Peito e Borboleta, além de saídas e viradas olímpicas.',
    iconName: 'Waves',
  },
  {
    id: 'categorias',
    number: '',
    label: 'Classes Paralímpicas',
    description: 'Preparação competitiva e classificação funcional específica para Autismo, DI e Síndrome de Down.',
    iconName: 'Award',
  },
  {
    id: 'polo',
    number: '',
    label: 'Estrutura Internacional',
    description: 'Treinamentos nas piscinas oficiais aquecidas do Centro de Treinamento Paralímpico Brasileiro.',
    iconName: 'MapPin',
  },
];

export const NUCLEOS_DATA: Nucleo[] = [
  {
    id: 'cpb',
    name: 'Centro Paralímpico Brasileiro',
    fullName: 'Centro de Treinamento Paralímpico Brasileiro',
    type: 'Polo Oficial de Treinamento (Piscinas)',
    address: 'Rodovia dos Imigrantes, km 11,5 - Vila Guarani',
    neighborhood: 'Zona Sul',
    city: 'São Paulo - SP, CEP: 04329-000',
    description: 'A ACEDEP realiza todos os seus treinamentos no complexo do Centro Paralímpico Brasileiro, o maior centro de treinamento paradesportivo da América Latina. Nossos atletas de Iniciação Esportiva e Alto Rendimento utilizam exclusivamente o espaço das piscinas de padrão internacional.',
    highlights: [
      'Piscina Olímpica (50m) e Semiolímpica (25m) aquecidas e de padrão internacional',
      'Treinamentos das duas frentes: Iniciação Esportiva e Alto Rendimento',
      'Estrutura com 100% de acessibilidade e segurança para os atletas',
      'Ambiente de alta excelência e motivação para atletas com deficiência intelectual',
    ],
    modalities: [
      'Natação - Iniciação Esportiva (Aperfeiçoamento dos estilos)',
      'Natação - Alto Rendimento (Competições Estaduais e Campeonatos Brasileiros)',
    ],
    schedule: 'Segunda, quarta e sexta: 18:00 às 19:30 | Terça e quinta: 15:00 às 16:30',
    badge: 'Polo de Treinamento - Piscinas',
    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
    mapUrl: 'https://maps.google.com/?q=Centro+Paralimpico+Brasileiro+Rodovia+dos+Imigrantes+km+11.5+Sao+Paulo',
  },
];

export const MODALITIES_DATA: Modality[] = [
  {
    id: 'natacao-iniciacao',
    title: 'Iniciação Esportiva',
    category: 'Formação & Aperfeiçoamento',
    description: 'Aperfeiçoamento dos estilos de nado para atletas a partir de 12 anos que já possuem experiência prévia básica na água. Foco na melhora da respiração, resistência, postura e preparação para quem deseja competir.',
    targetAudience: 'Pessoas a partir de 12 anos com Deficiência Intelectual (Autismo, DI e Síndrome de Down) com experiência prévia básica em natação',
    benefits: [
      'Melhora dos 4 estilos de nado (Crawl, Costas, Peito e Borboleta)',
      'Treinos nas piscinas do Centro Paralímpico Brasileiro',
      'Mais autonomia, autoconfiança e novas amizades',
      'Oportunidade de subir para a equipe de competição',
    ],
    features: ['Piscinas do Centro Paralímpico', 'Mínimo 12 anos', 'Experiência prévia básica'],
    image: '/IMG_2382.jpeg',
  },
  {
    id: 'natacao-alto-rendimento',
    title: 'Natação - Alto Rendimento',
    category: 'Competição Oficial • Classes S14 e S21',
    description: 'Treinamento de alto rendimento nas piscinas do Centro Paralímpico Brasileiro para atletas com deficiência intelectual das classes funcionais S14 (Deficiência Intelectual e Autismo) e S21 (Síndrome de Down), visando tempos e índices para campeonatos oficiais.',
    targetAudience: 'Atletas a partir de 12 anos nas classes paradesportivas S14 e S21 (Síndrome de Down) com foco em competições',
    benefits: [
      'Treinos diários com foco em tempos, índices e medalhas',
      'Participação em Campeonatos Regionais, Brasileiros e Internacionais',
      'Atletas das classes paradesportivas S14 e S21 (Síndrome de Down)',
      'Orgulho em representar a ACEDEP nos pódios',
    ],
    features: ['Piscina Olímpica', 'Categorias S14 e S21 (Down)', 'Campeonatos Oficiais'],
    image: '/IMG_5625.jpeg',
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Enio Salvador Sanches',
    role: 'Coordenador Técnico',
    credentials: 'CREF: 118973-G/SP',
    experience: 'Coordenação técnica geral das equipes de natação da ACEDEP, planejamento esportivo e acompanhamento nos treinamentos e competições.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Giuliana Sousa',
    role: 'Técnica de Natação',
    credentials: 'CREF: 158743-G/SP',
    experience: 'Treinamento e preparação técnica dos atletas em desenvolvimento e alto rendimento.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Tatiana Farias',
    role: 'Técnica da Iniciação Esportiva',
    credentials: 'CREF: 132481-G/SP',
    experience: 'Responsável técnica pela formação esportiva, aprimoramento motor e iniciação de novos talentos a partir dos 12 anos.',
    image: 'https://images.unsplash.com/photo-1580894732488-874ff095f9c4?auto=format&fit=crop&w=500&q=80',
  },
];

export const ATHLETE_STORIES: AthleteStory[] = [
  {
    name: 'Equipe ACEDEP - Campeonato Brasileiro',
    modality: 'Natação Paradesportiva',
    category: 'Alto Rendimento',
    achievement: 'Medalhas e pódios nos principais Campeonatos Brasileiros de Natação Paralímpica.',
    quote: 'Nossa equipe de cerca de 35 atletas treina diariamente com muita garra e união nas piscinas do Centro Paralímpico, levando as cores da ACEDEP com orgulho aos pódios do Brasil.',
    image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Turma de Iniciação Esportiva',
    modality: 'Natação para Deficiência Intelectual',
    category: 'Formação Aquática',
    achievement: 'Evolução técnica contínua e conquista da autonomia nas piscinas.',
    quote: 'A iniciação na ACEDEP proporciona desenvolvimento motor de alto nível para jovens a partir de 12 anos que já trazem vivência na água e sonham em competir.',
    image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=800&q=80',
  },
];

export const FAQS = [
  {
    question: 'Quem pode treinar na ACEDEP?',
    answer: 'A ACEDEP trabalha exclusivamente com Natação para pessoas com Deficiência Intelectual (como Autismo, Deficiência Intelectual e Síndrome de Down).',
  },
  {
    question: 'Quais são os requisitos para novos atletas?',
    answer: 'O atleta precisa ter a partir de 12 anos de idade e já saber nadar um pouco (saber flutuar e se locomover na água sozinho com segurança). Não ensinamos a nadar do zero.',
  },
  {
    question: 'Onde acontecem os treinos da ACEDEP?',
    answer: 'Todos os nossos treinos acontecem nas piscinas do Centro Paralímpico Brasileiro, na Rodovia dos Imigrantes, km 11,5 - São Paulo/SP.',
  },
  {
    question: 'A ACEDEP tem turmas para quem quer competir e para quem está começando?',
    answer: 'Sim! Temos a Iniciação Esportiva (para aperfeiçoamento dos estilos) e a equipe de Alto Rendimento para atletas das classes S14 (Deficiência Intelectual e Autismo) e S21 (Síndrome de Down) que disputam torneios e campeonatos oficiais.',
  },
  {
    question: 'Quantos atletas fazem parte da equipe?',
    answer: 'Nossa equipe conta com cerca de 35 atletas com deficiência intelectual, que treinam regularmente nas piscinas do Centro Paralímpico.',
  },
  {
    question: 'Como agendar um teste prático na piscina?',
    answer: 'Basta clicar no botão "Avaliação de Novos Atletas" ou "Entre em Contato" no site e preencher os dados. Nossa comissão técnica entrará em contato para marcar o teste na piscina.',
  },
  {
    question: 'Quais são os dias e horários dos treinos?',
    answer: 'Os treinos acontecem de Segunda, quarta e sexta (das 18h às 19h30) e de Terça e quinta (das 15h às 16h30).',
  },
  {
    question: 'Como apoiar ou patrocinar a ACEDEP?',
    answer: 'Empresas e pessoas podem ajudar através de patrocínio direto (uniformes, materiais, viagens) ou por doação livre, fortalecendo a equipe e ajudando nossos atletas.',
  },
];
