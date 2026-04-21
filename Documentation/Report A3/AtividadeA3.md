# Avaliação A3
**ISARVIT** Report on 21/05/2023

 1. [Elicitação de Requisitos](#1-elicitação-de-requisitos)
	 1. [Brainstorming](#11-brainstorming-e-cen%C3%A1rios-de-uso)
	 2. [Benchmarking](#12-benchmarking)
	 3. [Entrevistas (método principal)](#13-entrevistas)
	 4. [Requisitos](#14-requisitos)
 2. [Histórias](#2-hist%C3%B3rias)

## 1. Elicitação de Requisitos

Para a elicitação de requisitos desse projeto, decidimos utilizar 3 diferentes métodos: entrevistas, brainstorming e benchmarking. Cada um dos 3 métodos e seus resultados serão explicados abaixo.

### 1.1 Brainstorming e Cenários de uso:

Considere os seguintes cenários:

> - Eu, como médico, quero poder acessar um registro de exames do paciente sem precisar armazenar fisicamente ou solicitar ao paciente  que armazene os exames.
> - Eu, como médico, quero um modo seguro e prático de realizar um prontuário de um paciente.
> - Eu, como médico, quero um modo seguro e prático de analisar um exame de um paciente.

Como explicado anteriormente, o projeto começou baseado no artigo do do [ICIPEMIR](https://pubmed.ncbi.nlm.nih.gov/34042778/), que prevê um sistema de intercompatibilidade de prontuários médicos utilizando QR Codes.

A principal vantagem dessa abordagem é em que nenhum momento os dados do usuário ficarão guardados em um banco de dados (um dos principais entraves legais quando falamos de intercompatibilidade médica), mas com um leitor e escritor de QR Codes podemos rapidamente transmitir dados médicos para devices/prontuários impressos e reconstrui-los lendo-os novamente no sistema.

Outro objetivo do sistema é facilitar a criação de prontuários médicos a partir de consultas, especialmente imagens de radiologia. Essa parte será explicada mais a fundo na área de benchmarking.

Iniciamos nosso brainstorm pensando em como seria a interação entre os médicos e usuário:
```mermaid
sequenceDiagram
Patient  ->>  Doctor 1: Consults
Doctor 1 ->>  Program: Enters patient's imaging in system
Program  -->>  Doctor 1: Return correct form
Doctor 1 ->>  Program: Fills form with patient data
Program  -->>  Doctor 1: Returns report
Doctor 1 -->>  Patient: Delivers report
Patient  ->>  Doctor 2: Consults (with report)
Doctor 2 ->>  Program: Reads report QR Code
Program  -->>  Doctor 2: Returns patient data
``` 
**Diagrama 1.** Interação esperada entre o software, e seus usuários: o paciente e os médicos.

E abaixo, uma forma simplificada de como o sistema funcionaria
```mermaid
graph  TD
Patient("👨‍💼 Patient")--"consults"-->Radiologist
Radiologist("👨‍⚕️ Radiologist")-."can create".->Image
Radiologist-."can create".->Information
Information("📈 Consultation Information")--"is used to fill"-->Form
Form("📋 Consultation Form")--"is used to generate"-->Editable
Image("🫁 Radiology Image")--"uses AI to generate text"-->Editable
Editable("📝 Editable Medical Report")
```
**Diagrama 2.** Visão simplificada do uso do programa.

Ou seja, após uma consulta, o médico irá simplesmente preencher a informação do usuário (ou a imagem do exame de radiologia) no software e receberá um prontuário editável com um QR Code com as informações preenchidas. Uma versão mais completa do uso pode ser vista abaixo:

```mermaid
graph  TD
Patient("👨‍💼 Patient")--"consults"-->Radiologist
Radiologist("👨‍⚕️ Radiologist")-."can create".->Image
Radiologist-."can create".->Information
Radiologist--"Selects type and fills"---->Form
Radiologist--"Verifiies and prints"---->Editable
Information("📈 Consultation Information")--"is used to fill"-->Form
Form("📋 Consultation Form")--"is used to generate"-->Editable
Image("🫁 Radiology Image")--"uses AI to generate text"-->Editable
Editable("📝 Editable Medical Report")--"is used to generate"--->PDF
PDF("📄 Medical Report with QR Code")
Patient--"takes home"-->PDF
Database("🗄️ Forms database")--"is used to generate"--->Form
Radiologist-."can create new forms".->Database
Other("👨‍⚕️ Other Doctor")-."can reconstruct info via QR Code".->PDF
subgraph  Software
Database
Form
Editable
end
```
**Diagrama 3.** Visão completa do sistema

Idealmente, no brainstorm consideramos que para o usuário (radiologista), o programa poderia ser *stateless*, isto é, ele não necessitaria nem de login e bastaria clicar alguns botões para já ter o formulário disponível, mas devido à necessidade auto-imposta de um número mínimo de features como login e signup (devido aos requisitos da matéria de engenharia de Software), esse não é o caso.

Idealmente o software é dividido em duas partes quase inteiramente separadas: o módulo frontend e o módulo backend, de forma que diferentes consultórios pudessem fazer um deploy do backend customizado (por exemplo, se eles desejam ter um banco de dados de formulários único) sem a necessidade de alterar o frontend. Isso poderia ser feito por meio de uma configuração do usuário na chamada de API do frontend.

A idéia de ter uma IA geradora de textos médicos veio da pesquisa do benchmarking, mas ela ainda está sendo considerada como uma feature que não estará presente devido à falta de datasets para treina-la. Se ela vier a ser presente, será em uma forma reduzida.

### 1.2 Benchmarking
O primeiro passo da nossa pesquisa de benchmarking depende em esclarecer o objetivo do nosso software: _(i) criar um gerador automático de prontuários médicos_ **e** _(ii) ser capaz de escrever e ler informações de um paciente de forma fácil e digital, sem a necessidade de guardar as informações do paciente em uma base de dados centralizada._

Não encontramos nada muito parecido que satisfazesse a necessidade (ii), e para a necessidade (i) separamos em 2 partes: (a) estudos/frameworks que auxiliam nesse objetivo e (b) softwares off-the-shelf que oferecem automação de prontuários médicos.

Para o caso (a) sabemos que [openEHR](https://openehr.org/) e [HL7](https://www.hl7.org/) oferecem standards para informática médica - enquanto há vários estudos sobre o uso de [LSTMs](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0262209) e outros [modelos de IA](https://paperswithcode.com/paper/automated-radiology-report-generation-using) para geração de texto a partir de imagems de radiologia (porém, nenhum desses estudos apresenta um software para radiologistas usarem) e até mesmo um estudo sobre como automatizar [a leitura de prontuários médicos](http://koreascience.or.kr/article/JAKO201211666470459.pdf). Para os estudos, este [link](https://paperswithcode.com/task/medical-report-generation) possui uma lista de artigos úteis.

Para o ponto (b), foram poucos os softwares que de fato foram capazes de satisfazer os critérios de busca, e não achamos nenhum que fóssemos capaz de experimentar sem precisar comprar o software. Por exemplo:
-  [TheFormTool](https://www.theformtool.com/lp/medical/) diz ser capaz criar prontuários médicos e "acelerar em 70%" a papelada, no entando não achamos nem imagens claras de como ele poderia ser usado para isso.
- [Care2Report](https://care2report.nl/) é uma iniciativa da universidade de Utrecht de automatizar relatórios médicos, tomando em conta também vídeos, áudios e outras entradas para a geração de formulários, no entando eles não providenciam uma plataforma para usar essas tecnologias.
- [Jotform](https://www.jotform.com/form-templates/health/medical-surveys-and-questionnaires) e outras plataformas similares são o equivalente a um Google Forms avançado, e apesar deles serem amigáveis ao usuário, eles não são de fato feitos para esse tipo de trabalho.

Devido à esses fatores, acabamos por não fazer todos os passos do benchmarking (como capturar screenshots), portanto o benchmarking 
acaba por ficar "incompleto". Em conclusões gerais, percebemos a falta de um software simples e fácil capaz de cumprir a automação de formulários médicos, principalmente de um _Software Livre[*](https://en.wikipedia.org/wiki/Free_software)_

### 1.3 Entrevistas:

Para este projeto, usamos entrevistas como uma técnica de listagem de requisitos. Como infelizmente não conseguimos marcar com nenhum médico atuante, decidimos entrevistar Prof. André Santanché, pesquisador e professor da Universidade Estadual de Campinas - cuja pesquisa é focada principalmente em e-Saúde e Engenharia de Software aplicada à saúde - ([link para o áudio da entrevista](https://drive.google.com/file/d/1CnRjaXXXcn0A8ORXIMo-f7BFV3Npeht2/view?usp=share_link)*) e Pedro Merrotti, aluno de radiologia da UTFPR. Também tivemos uma troca de idéias por email com um dos autores do artigo: Dr. Arthur Lauriot dit Prevost.

A estrutura das entrevistas foram feitas de uma forma de indução: primeiro começamos abordando o que de fato para contextualização e perguntamos de forma bem geral sobre o campo de automação de prontuários médicos, para depois voltar à especializar as perguntas para o projeto.

*OBS: Só lembramos de gravar o áudio após um tempo de entrevista, então algumas informações iniciais foram perdidas.

**Tabela 1.** Perguntas planejadas para as entrevistas. Devido ao tempo, nem todas as perguntas foram feitas nas entrevistas.
| **Fase** | **Tipo** | **Pergunta** |
|---|---|---|
| Introdução | Explicação | [Começamos com uma leve explicação de que estamos fazendo um projeto de automação de prontuários médicos] |
| Introdução | Subjetiva | O que você entende por automação de prontuários médicos? |
| Introdução | Subjetiva | Quais são as maiores dificuldades encontradas na análise de exames prescritos aos pacientes? |
| Introdução | Subjetiva | Você acredita que um software de automação de prontuários médicos adicionaria valor na área? |
| Introdução | Subjetiva | Quais os principais problemas enfrentados na área de intercompatibilidade médica? |
| Introdução | Subjetiva | Na sua visão, quais seriam as soluções para intercompatibilidade de prontuários médicos? |
| Introdução | Aprofundamento | [Perguntas de aprofundamento nas respostas dadas pelo entrevistado, como por exemplo, se aprofundar nos problemas] |
| Aprofundamento | Explicação | [Aqui há uma explicação mais detalhada do sistema, como mostrado com os diagramas acima] |
| Aprofundamento | Objetiva | Quanto tempo é gasto na geração de prontuários médicos? |
| Aprofundamento | Objetiva | Quanto tempo é gasto na leitura e extração de prontuários médicos? |
| Aprofundamento | Objetiva | Para pacientes recorrentes, quanto tempo é gasto adquirindo as mesmas informações já adquiridas em outras consultas? |
| Aprofundamento | Objetiva | Para pacientes novos, quanto tempo é gasto adquirindo informações básicas e outras consultas de outros médicos? |
| Aprofundamento | Objetiva | Quem seriam os principais usuários de um sistema desse? |
| Aprofundamento | Objetiva | A proposta do sistema de ser Libre e Open-Source adiciona valor para a comunidade? |
| Aprofundamento | Objetiva | O uso de algoritmos para pré-geração de prontuários adiciona valor para os consultórios que o utilizariam? |
| Aprofundamento | Objetiva | Você usaria um sistema de geração de prontuários com Inteligência Artificial?  |
| Feedback | Subjetiva | Quais os cenários de uso que você vê para uma ferramenta como essa? |
| Feedback | Subjetiva | Quais as principais vantagens de uma ferramenta como essa? |
| Feedback | Subjetiva | Quais as principais desvantagens de uma ferramenta como essa? |
| Feedback | Subjetiva | Quais outros métodos você vê como soluções para a geração e intercompatibilidade de prontuários médicos? |
| Feedback | Objetiva | [Outras perguntas objetivas, dependendo do nível de conhecimento do entrevistado em determinado assunto da área] |
| Feedback | Aprofundamento | [Outras perguntas de aprofundamento, dependendo da resposta do usuário anteriormente] |
| Conclusão | Subjetiva | Há mais algum ponto do assunto que você acha importante que seja adicionado no projeto? |
| Conclusão | Objetiva | Há outras pessoas que você recomendaria que fossem entrevistadas? |
| Conclusão | Subjetiva | Na sua opinião, quais os passos seguintes no projeto? |

### 1.4 Requisitos
Após as entrevistas, fizemos a seguinte lista exaustida de requisitos funcionais e não-funcionais. Os requisitos marcados com *x* em "Considerado" são aqueles que consideramos dentro do escopo do projeto da matéria e que serão abordados nos épicos e nas histórias, enquanto aqueles marcados como *~* são aqueles que consideramos úteis para um sistema real mas não são prioridades, enquanto os vazios são aqueles que consideramos que não adicionam valor ao projeto no momento.

| Tipo | Requisito | Considerado | Motivador |
|---|---|:---:|---|
| Funcional | Um usuário pode criar e logar em sua conta, configurar informações básicas (que serão usadas para preencher os dados do médico no prontuário) | x | - |
| Funcional | Um usuário pode criar, alterar e deletar um formulário médico para ser preenchido com as informações de um paciente. | x | - |
| Funcional | Um formulário preenchido deve ser capaz de gerar um relatório editável com um texto sobre as informações dadas e um QR Code com as informações preenchidas | x | - |
| Funcional | Um médico pode ler qualquer QR Code e reconstruir as informações do paciente e do formulário que foi preenchido. | x | - |
| Funcional | O sistema deve criar imagens em SVG do sistema analisado, dada às informações preenchidas no formulário. |  | O artigo inicial prevê a criação de imagens em SVG. |
| Funcional | Ao invés de entrar com os dados da consulta, o médico poderia usar apenas a imagem da radiografia como input |  | Extraido a partir dos artigos com IA. Não acatado ainda devido à complexidade do problema. |
| Funcional | O sistema deve permitir "loop" de perguntas dado uma informação prévia (explicação: Repetir um set de perguntas sobre um hematona N vezes, se N foi o número de hematomas informados anteriormente no formulário)  | ~ | Email do Dr. Prevost |
| Não-Funcional Produto | O sistema deve ser open-source e livre para facilitar a auditoria. | x | Email do Dr. Prevost |
| NF Produto | O sistema deve possuir um deploy "único", de modo que o usuário não precise instalar nada em seu computador nem em seu consultório. | x | Email do Dr. Prevost |
| NF Produto | O sistema deve ser facilmente portável se o usuário decidir fazer deploy (por quaisquer razões) | x | Email do Dr. Prevost |
| NF Produto | O sistema deve ser capaz de possuir como entrada um schema JSON das perguntas. | x | Email do Dr. Prevost / Artigo base |
| NF Produto | O sistema pode ser capaz de utilizar IA para a geração de textos médicos |  | Extraido a partir dos artigos |
| NF Externo | O sistema não pode salvar informações de um paciente em sua base de dados. | x | Razões éticas / Artigo base |
| NF Externo | O sistema deve ser compatível com protocolos HL7 e OpenEHR | ~ | Entrevista com o Santanché / Artigo base |

## 2. Histórias

Dada a elicitação de requisitos, imaginamos as seguintes histórias e épicos de usuários e suas seguintes histórias. As histórias de cada um estão linkadas na issue de cada épico:

- **[Epic 1:](https://github.com/AndreisPurim/ISARVIT/issues/49)** As a doctor, I want to be capable of registering myself in the application, not only my personal information but also other information that might be relevant to creating a medical report (such as the clinic I work on). I also want to be capable of editing or deleting said information
- **[Epic 2:](https://github.com/AndreisPurim/ISARVIT/issues/53)** As a doctor, I want to create and administer online forms within the web app, allowing me to efficiently manage the collection and organization of patient records for other doctors
- **[Epic 3:](https://github.com/AndreisPurim/ISARVIT/issues/57)** As a doctor, I want to be capable of reading a patient's information from his QR Code (thus recreating any information he might have inputted), or adding information about a patient in a forms and generating a pre-written medical report to be given to the patient.


Épicos e histórias antigas (descartadas):
-  ~~**EPIC 1:** As a doctor, I want to access de web app so that I can input all my infos [#41](https://github.com/AndreisPurim/ISARVIT/issues/41)~~
	-   ~~As a doctor, I want to input my medical information during my initial use of the web app, so my credentials and relevant details are stored for future logins and identification purposes.[#42](https://github.com/AndreisPurim/ISARVIT/issues/42)~~
	-   ~~As a doctor, I want to visualize my medical information, so I can check and edit those informations [#43](https://github.com/AndreisPurim/ISARVIT/issues/43)~~
-  ~~**EPIC 2:** As a doctor, I want to create a forms, so I can send them to my patients  [#38](https://github.com/AndreisPurim/ISARVIT/issues/38):~~
	-   ~~As a doctor, I want to input my patients' information in online formularies, including specific details for different computer radiography (CR) exams, so I can generate accurate and tailored QR Codes representing computer radiography for each patient. [#44](https://github.com/AndreisPurim/ISARVIT/issues/44)~~
	-   ~~As an admin medical professional, I want to acess the forms answers to compare them [#40](https://github.com/AndreisPurim/ISARVIT/issues/40)~~
	-  ~~As a medical admin professional I want to browse existent forms to reuse them or to know which forms are there [#39](https://github.com/AndreisPurim/ISARVIT/issues/39)~~

-  ~~**EPIC 3:** As an admin medical professional, I want to create customizable models for different CR exams within the web app, enabling radiologists to select the appropriate formulary based on the specific exam requirements and ensure standardized data collection. [#32](https://github.com/AndreisPurim/ISARVIT/issues/32)~~
	- ~~As an admin i want to send the forms, so the doctor can use it [#35](https://github.com/AndreisPurim/ISARVIT/issues/35)~~
	- ~~As an admin i want to have predefined fields models, so the doctor can use standardize data [#36](https://github.com/AndreisPurim/ISARVIT/issues/36)~~
	- ~~As a radiologist, I want a dedicated page in the web app where I can easily access and view the patient forms, providing a centralized location for managing and reviewing the required information. [#45](https://github.com/AndreisPurim/ISARVIT/issues/45)~~
