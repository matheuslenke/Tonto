<div id="top"></div>


<!-- [![Contributors][contributors-shield]][contributors-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url] -->


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/matheuslenke/Tonto">
    <img src="docs/images/TontoLogo.png" alt="Logo"  height="100" alt="Tonto Logo image, a blue background with TONTO written in it">
  </a>

  <h3 align="center">An DSL for Ontology models</h3>

</div>

<div height="200">
</div>

&nbsp;

<!-- TABLE OF CONTENTS -->


<div>
  <h1><summary>Table of Contents</summary></h1>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#prerequisites">Prerequisites</a></li>
  </ol>
</div>


<!-- ABOUT THE PROJECT -->
<div id="about-the-project"> </div>

## 📝 About The Project

Tonto is an acronym with the words Textual and Ontology, because it is a written way of writing Ontology models. It was developed using the `Langium` tool, with `Typescript`, and creates a Visual Studio Code Extension with a Language server. 

Tonto was designed as a friendly textual syntax for ontologies. It offers specialized support for constructs reflecting the UFO foundational ontology, which makes it possible to identify errors in the ontology that would otherwise pass unnoticed. The language was designed to allow transformation to a number of languages including UML (more specifically OntoUML), OWL (for gUFO-based ontologies), Alloy, Common Logic, and the TPTP syntax.

### The language supports:

- UFO-based annotations to facilitate error checking and meaning negotiation

- High-order types for multi-level taxomies

- Structured comments for documentation generation

- Constraints specification when extra precision is required

- Ontology testing/verification directives 

 

As a textual syntax, the language can benefit from source control tools such as git, and ontologies can be viewed and edited without special tools. This VS Code extension is provided with support for syntax verification, syntax highlight, content assist and ontology visualization preview. The extension is integrated with the [OntoUML](https://github.com/OntoUML/OntoUML) server, to benefit from services designed for the language, such as transformation to OWL and generation of database schemas.

<p align="right">(<a href="#top">back to top</a>)</p>


<div id="built-with"> </div>

### 🔨 Built With

Here are some of the languages, frameworks, tools and libraries used in development of this application:

* [Typescript](https://www.typescriptlang.org/)
* [Langium](https://langium.org/)

<p align="right">(<a href="#top">back to top</a>)</p>


<div id="getting-started"> </div>

<!-- GETTING STARTED -->
## ⌨️ Getting Started

This is the instructions on setting up your project locally. To get a local copy up and running follow these simple example steps:


<div id="prerequisites"> </div>

### Prerequisites

This is all the tools you need installed to run the project and the versions that are preferred
* nodejs - v16.9.1 or higher
* npm - 7.21.1 or higher
* Yarn - 1.22.18 (not mandatory, but really recommended)


### ⚙️ Initializing

 * Run `npm run langium:generate` to generate TypeScript code from the grammar definition.
 * Run `npm run build` to compile all TypeScript code or `npm run watch` if you want the compiler to work automatically everytime you update your files
 * Press `F5` to open a new window with your extension loaded.
 * Create a new file with a file name suffix matching your language.
 * Verify that syntax highlighting, validation, completion etc. are working as expected.


 ### Packaging the extension

> With these commands you can generate a .vsix file to install the extension in your VS Code or to send privately to other people to test it, without publishing it to the Marketplace

 ```bash
  # Run this to generate .vsix file
  vsce package --pre-release --baseContentUrl https://github.com/matheuslenke/Tonto

  # Installing the extension in your vscode (requires the code extension in path)
  code --install-extension tonto-x.x.x.vsix
 ```

<!-- LICENSE -->
## 🔐 License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

<div id="contact"> </div>

<!-- CONTACT -->
## ✉️ Contact


Matheus Lenke Coutinho - matheus.l.coutinho@edu.ufes.br - [Linkedin](https://www.linkedin.com/in/matheus-lenke-coutinho-492a4b15a/) - [Github](https://github.com/matheuslenke)

<div id="additional-tools"> </div>

<p align="right">(<a href="#top">back to top</a>)</p>

