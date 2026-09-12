# SafePlaca ⚡

> **Sistema de Gestão de Módulos de Carga, Esquemas Eletrônicos, Modo Projetor de Bancada e Proteção Ativa com Marca d'Água.**

O **SafePlaca** foi desenvolvido para técnicos de eletrônica, engenheiros de hardware e entusiastas de bancada organizarem e inspecionarem circuitos e esquemas elétricos com facilidade, incluindo placas populares como **módulos de carga TP4056 (Type-C / 1S Li-ion com proteção DW01A/FS8205A)**, **BMS 3S 12.6V**, **reguladores Buck/Boost** e projetos customizados.

---

## 🚀 Principais Recursos

- 🔋 **Foco em Placas de Carga & Bateria**:
  - Módulos TP4056 Type-C com proteção completa contra sobrecarga, subtensão e sobrecorrente.
  - Módulos BMS (3S 12.6V com balanceamento por célula).
  - Conversores Buck Step-Down CC/CV para recarga controlada de baterias.
  - Tabela interativa de cálculo de corrente pelo resistor programador ($R_{prog}$).

- 📽️ **Modo Projetor de Bancada**:
  - Visualização em tela cheia de alto contraste para projetores e monitores secundários.
  - Zoom fluido (50% a 350%) e Pan com mouse.
  - **Pontos de Teste (Test Points) Interativos**: Guia de multímetro em tempo real com tensões esperadas, tolerâncias, sinal normal e sintomas de falha.
  - Gaveta retrátil de pinagem com identificação de cores de cabos e tensões nominais.

- 🔒 **Proteção de Propriedade Intelectual & Marca d'Água Automática**:
  - **Marca d'água dinâmica e automática** integrada sobre todos os esquemas e no Modo Projetor.
  - **Bloqueio de downloads diretos de PDF e imagens** para proteção de esquemas e projetos de bancada.
  - Bloqueio de atalhos (`Ctrl+S`, `Ctrl+P`, `Ctrl+U`) e menu de contexto (botão direito).
  - Alerta modal com registro de tentativas de cópia.

- 🛠️ **Cadastro e Customização**:
  - Adicione novos esquemas, placas e projetos diretamente pela interface com persistência local (`localStorage`).

---

## 💻 Como Rodar o Projeto

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento local
npm run dev

# 3. Compilar versão de produção
npm run build
```

---

## 📌 Repositório Oficial

- **GitHub**: [git@github.com:Cristoander/SafePlaca.git](https://github.com/Cristoander/SafePlaca)
