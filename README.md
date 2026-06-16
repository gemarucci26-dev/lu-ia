# LuIA 🖤

Uma assistente de inteligência artificial minimalista e exclusiva.

> *"Projeto criado para minha namorada. Ela sempre gostou muito de usar o ChatGPT para fazer suas pesquisas e tirar suas dúvidas, logo eu queria fazer algo que fosse só dela."*

---

## 🌟 Sobre o Projeto

A **LuIA** é uma interface de pesquisa inteligente construída do zero para ser rápida, direta e visualmente elegante. Em vez de uma interface cheia de botões e distrações, a LuIA foca apenas no que importa: a dúvida do usuário e a resposta organizada da IA.

O projeto utiliza a inteligência da API do **Google Gemini** rodando de forma segura através do Back-end da Vercel.

## ✨ Funcionalidades

- **Design Minimalista**: Interface limpa, modo escuro elegante e bastante respiro visual.
- **Micro-interações**: Animações suaves ao transitar entre a pesquisa e o chat.
- **Chat Focado**: Um ambiente isolado para focar totalmente na leitura da resposta.
- **Integração Real**: Conectada à API do Google Gemini-2.5-Flash para respostas inteligentes, rápidas e precisas.

## 🛠️ Tecnologias Utilizadas

- **Front-end**: HTML5, Vanilla CSS3 (Variáveis, Flexbox, Animations) e JavaScript puro.
- **Back-end**: Node.js (Vercel Serverless Functions).
- **IA**: Google Gemini API (`@google/genai` model endpoint).
- **Hospedagem**: [Vercel](https://vercel.com/)

## 🚀 Como Rodar e Fazer Deploy

1. Clone ou baixe este repositório.
2. Certifique-se de possuir o [Vercel CLI](https://vercel.com/docs/cli) instalado.
3. Configure a sua chave da API do Google Gemini:
   ```bash
   vercel env add GEMINI_API_KEY
   ```
4. Faça o deploy para a nuvem:
   ```bash
   vercel --prod
   ```

---
*Desenvolvido com carinho.*
