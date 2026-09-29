# Frame

Frame é um aplicativo mobile de diário visual criado com Expo e React Native para capturar momentos, organizar fotos e transformar a rotina em pequenas histórias com identidade pessoal.

A proposta do app é simples e direta: abrir a câmera, registrar um instante, adicionar uma legenda, explorar a galeria e revisitar memórias com filtros, edição e um mini desafio de adivinhação.

## Visão geral

O projeto combina:

- câmera nativa com captura de fotos;
- galeria interna para visualizar registros;
- edição de fotos com filtros visuais;
- legenda personalizada por memória;
- desafio de jogo para identificar a legenda correta;
- navegação fluida entre telas com Expo Router;
- armazenamento local do app para manter as memórias acessíveis.

## Funcionalidades

### 1. Captura de momentos

- acesso rápido à câmera diretamente pela home;
- troca entre câmera traseira e frontal;
- pré-visualização da foto após a captura;
- adição de legenda antes de salvar no fluxo do app.

### 2. Galeria pessoal

- lista de fotos salvas no app;
- visualização detalhada de cada registro;
- apresentação da legenda e data da memória;
- possibilidade de excluir fotos antigas ou irrelevantes.

### 3. Edição visual

- filtros em tons de amarelo, azul, rosa e verde;
- visualização em tempo real do resultado;
- edição de fotos já registradas na galeria.

### 4. Desafio entre amigos

- jogo que seleciona fotos e oferece opções de legendas;
- pontuação por acertos;
- experiência social e divertida para compartilhar memórias com outras pessoas.

### 5. Interface pensada para mobile

- visual limpo e acolhedor;
- paleta com tons terrosos e contrastes suaves;
- cards de ação com hierarquia visual clara;
- navegação amigável em telas curtas e focadas.

## Stack tecnológica

- Expo SDK 57
- React Native 0.86
- React 19
- TypeScript
- Expo Router
- Expo Camera
- AsyncStorage
- React Native Reanimated
- React Native Gesture Handler
- React Native Safe Area Context

## Estrutura do projeto

```text
.
├── app.json                  # configuração do app Expo
├── package.json              # dependências e scripts
├── tsconfig.json            # configuração TypeScript
├── src/
│   ├── app/
│   │   ├── camera.tsx       # fluxo de câmera
│   │   ├── edit.tsx         # edição e filtros
│   │   ├── gallery.tsx      # galeria de fotos
│   │   ├── game.tsx         # jogo de legendas
│   │   ├── index.tsx        # home do app
│   │   ├── photo.tsx        # detalhe da foto
│   │   └── _layout.tsx      # layout global
│   └── components/
├── assets/
├── example/
└── README.md
```

## Requisitos

Antes de iniciar, verifique se o ambiente atende ao mínimo do Expo SDK 57:

- Node.js 22.13.x ou superior
- npm ou yarn
- Expo CLI
- Android Studio / emulator ou iOS Simulator
- em alguns casos, um celular físico ou emulador para testes em desenvolvimento

## Como rodar o projeto

1. Instale as dependências:

```bash
npm install
```

2. Inicie o projeto:

```bash
npx expo start
```

3. Escolha uma opção de execução:

- Android emulator
- iOS simulator
- Expo Go
- desenvolvimento web, quando disponível

### Scripts disponíveis

```bash
npm start
npx expo start
npx expo start --android
npx expo start --ios
npx expo start --web
```

## Fluxo de uso

1. Abra a tela inicial do app;
2. acesse a câmera;
3. tire uma foto ou capture um momento;
4. adicione uma legenda inspirada no contexto;
5. veja a foto na galeria;
6. edite filtros ou detalhes da imagem;
7. acesse o desafio para testar a memória e os amigos.

## Status do projeto

Este projeto está em desenvolvimento ativo e concentra a experiência principal em:

- registrar momentos do cotidiano;
- dar personalidade às fotos;
- criar uma memória visual em formato de diário;
- oferecer interação além da simples visualização.

## Melhorias futuras

Algumas evoluções que deixam o produto mais completo incluem:

- organização por albums ou grupos;
- busca por legenda ou data;
- exportação de fotos para compartilhamento;
- suporte a múltiplos usuários/perfis;
- refinamento da experiência de gamificação;
- melhorias em acessibilidade e microinterações.

## Contribuição

Contribuições são bem-vindas. Para colaborar:

1. faça um fork do projeto;
2. crie uma branch para sua funcionalidade;
3. implemente a melhoria;
4. abra um pull request com descrição clara do que foi alterado.

## Licença

Este projeto está sob a licença MIT. Consulte o arquivo de licença do repositório para mais detalhes.

## Observação

O objetivo do Frame é transformar fotos em memórias com contexto, emoção e um toque mais pessoal. O app foi pensado como um diário visual leve, divertido e fácil de usar no dia a dia.
