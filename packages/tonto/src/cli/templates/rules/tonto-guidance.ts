export const tontoGuidance = `
---
alwaysApply: true
---
# Tonto Project Guidance

This document provides a concise orientation for an LLM working with the Tonto project. Tonto is a Domain-Specific Language (DSL) for ontological modeling, built with the Langium framework.

## 1. Introduction to Tonto

Tonto is a textual modeling language specifically designed for creating well-founded ontologies based on the Unified Foundational Ontology (UFO). It serves as a textual counterpart to the graphical OntoUML modeling language, aiming to provide the rigor of UFO with the benefits of a textual syntax.

**Key Characteristics:**
- **UFO-Based:** Tonto constructs directly reflect the ontological distinctions of UFO (e.g., kinds, phases, roles, relators, events, modes, qualities). This ensures that models are ontologically well-founded.
- **Textual Syntax:** Offers advantages for version control (e.g., using Git, diffing changes), model editing with standard text editors, model merging, and automated processing.
- **Tool-Supported:** Designed for use within IDEs like VS Code, with features such as syntax highlighting, real-time validation, auto-completion, and transformation capabilities (e.g., to OntoUML JSON, OWL).
- **Modularization:** Supports breaking down ontologies into multiple packages and managing dependencies, fostering reuse and better organization.

The primary goal of Tonto is to facilitate the development of high-quality, precise conceptual models by leveraging the clear semantics of UFO in a user-friendly textual format.

## 2. Core Grammar and Syntax of Tonto

A Tonto ontology is defined in one or more \`.tonto\` files. Each file typically represents a single package. For precise grammar rules, refer to the Langium grammar files (e.g., \`terminals.langium\`, \`tonto.langium\`, \`relations.langium\`) within the Tonto language implementation.

**2.1. Comments**
- Single-line comments: \`// This is a comment\`
- Multi-line comments: \`/* This is a multi-line comment */\` (Supported as per \`terminals.langium\`).

**2.2. Package Declaration**
Every \`.tonto\` file starts with a package declaration. Packages define a namespace.
\`\`\`tonto
package MyOntologyPackage
// or for global accessibility (use sparingly):
// global package MyGlobalPackage

// ... declarations ...
\`\`\`

**2.3. Imports**
To use elements from other packages, import them:
\`\`\`tonto
import AnotherPackage
import YetAnotherPackage as YAG // Using an alias

package CurrentPackage
// ... declarations using elements from AnotherPackage and YAG ...
\`\`\`
Import *always*  come before the \`package\` declaration.

**2.4. Class Declarations**
Classes are the core building blocks. They represent types of individuals.
**General Syntax:**
\`<stereotype_keyword> <ClassName> (of <ontologicalNature1>, <ontologicalNature2>, ...)? (specializes <SuperClass1>, <SuperClass2>, ...)? (instanceOf <HigherOrderType>)? {
  (label { @<lang_code> "<text>" })?
  (description { @<lang_code> "<text>" })?
  // attributes
  // internal relations
}\`

**2.4.1. Stereotypes (Keywords for Classes):**
These keywords determine the ontological meta-properties of the class.

*   **Ultimate Sortals (provide identity principle):**
    *   \`kind\`: For substantial individuals that are functional complexes (e.g., \`kind Person\`, \`kind Car\`).
    *   \`collective\`: For collections of similar members (e.g., \`collective Flock\`).
    *   \`quantity\`: For amounts of matter (e.g., \`quantity WaterPortion\`).
    *   \`quality\`: For qualia, values in a conceptual space (e.g., \`quality Color\`, \`quality Weight\`).
    *   \`mode\`: For intrinsic, non-describable properties (e.g., \`mode Skill\`, \`mode Belief\`). Often specialized into:
        *   \`intrinsicMode\`
        *   \`extrinsicMode\`
    *   \`relator\`: For truth-makers of material relations, connecting multiple individuals (e.g., \`relator MarriageContract\`, \`relator Employment\`).
    *   \`type\` / \`powertype\`: For higher-order types (types whose instances are types). (e.g., \`type Species\`, \`powertype CarModelRange\`).

*   **Sortals (specializations of Kinds, inherit identity):**
    *   \`subkind\`: Rigid specialization of a kind (e.g., \`subkind Man specializes Person\`).
    *   \`phase\`: Contingent, intrinsic specialization of a kind (e.g., \`phase Child specializes Person\`).
    *   \`role\`: Contingent, relational specialization of a kind (e.g., \`role Student specializes Person\`).
    *   \`historicalRole\`: A role played in the context of an event (e.g., \`historicalRole 2023ConferenceAttendee specializes Person\`).

*   **Non-Sortals (classify instances of different Kinds):**
    *   \`category\`: Rigid, collecting essential properties (e.g., \`category LivingBeing\`).
    *   \`mixin\`: Semi-rigid (essential for some, accidental for others).
    *   \`phaseMixin\`: Anti-rigid, contingent intrinsic properties across kinds (e.g., \`phaseMixin InsuredAsset\`).
    *   \`roleMixin\`: Anti-rigid, contingent relational properties across kinds (e.g., \`roleMixin Customer\`).
    *   \`historicalRoleMixin\`: An anti-rigid role mixin played in an event.

*   **Neutral (use when undecided, editor will warn):**
    *   \`class\` (e.g., \`class TemporaryConcept\`).

*   **Perdurants (Events/Situations):**
    *   \`event\`: Represents happenings, occurrences (e.g., \`event Purchase\`).
    *   \`situation\`: Represents a state of affairs at a point in time (e.g., \`situation SystemOverload\`).
    *   \`process\`: (If distinguished from event, represents ongoing perdurants).

**2.4.2. Ontological Natures:**
Specifies the fundamental nature of instances for non-sortals or to further constrain sortals.
Syntax: \`of <nature1>, <nature2>, ...\`
Examples: \`category PhysicalObject of objects\`
Common natures: \`objects\` (shortcut for functional-complexes, collectives, quantities), \`functional-complexes\`, \`collectives\`, \`quantities\`, \`relators\`, \`intrinsic-modes\`, \`extrinsic-modes\`, \`qualities\`, \`events\`, \`situations\`, \`types\`, \`abstract-individuals\`.

**2.4.3. Specialization (Inheritance):**
Syntax: \`specializes <SuperClass1>, <SuperClass2>, ...\`
Example: \`phase Adult specializes Person\`

**2.4.4. Instantiation (for Higher-Order Types):**
Syntax: \`instanceOf <HigherOrderType>\`
Example: \`kind Dog instanceOf SpeciesType\`

**2.4.5. Class Body (\`{ ... }\`):**
Contains optional \`label\`, \`description\`, attributes, and internal relations.

*   **Label & Description:** For multilingual annotations.
    \`\`\`tonto
    label {
        @en "Person"
        @pt "Pessoa"
    }
    description {
        @en "Represents a human being."
    }
    \`\`\`

**2.5. Attributes**
Define properties of classes.
Syntax: \`<attributeName>: <DataTypeName> [<cardinality>]? { <meta-properties> }?\`

*   **DataTypeName:** Can be built-in or user-defined.
    *   Built-in: \`string\`, \`number\`, \`boolean\`, \`date\`, \`time\`, \`datetime\`.
*   **Cardinality:** Optional. Default is \`[1]\`.
    *   Examples: \`[1]\` (exactly one), \`[0..1]\` (optional), \`[*]\` (zero or more, same as \`[0..*]\`), \`[1..*]\` (one or more), \`[2..5]\` (between 2 and 5).
*   **Meta-properties:** Optional, enclosed in \`{}\`.
    *   \`ordered\`: Indicates the attribute values form an ordered sequence.
    *   \`const\`: The attribute value is immutable after creation.
    *   \`derived\`: The attribute value is derived from other information.
Example:
\`\`\`tonto
kind Person {
    name: string [1]
    age: number { derived }
    nicknames: string [*] { ordered }
    socialSecurityNumber: string [0..1] { const }
}
\`\`\`

**2.6. Datatypes and Enumerations**

*   **User-defined Datatypes (Complex Types):**
    Syntax: \`datatype <DatatypeName> (specializes <BaseDatatype>)? { <attributes> }\`
    Example:
    \`\`\`tonto
    datatype Address {
        street: string
        city: string
        zipCode: string [0..1]
    }
    datatype SecureString specializes string // Nominal typing
    \`\`\`

*   **Enumerations:**
    Syntax: \`enum <EnumName> (specializes <BaseDatatype>)? { <Literal1>, <Literal2>, ... }\`
    Example:
    \`\`\`tonto
    enum EyeColor { Blue, Green, Brown, Black }
    \`\`\`

**2.7. Relations (Associations)**
Define relationships between classes. Can be internal (defined within a class body) or external.

**2.7.1. Relation Stereotypes (OntoUML stereotypes):**
Prefix with \`@\`. Examples: \`@mediation\`, \`@componentOf\`, \`@memberOf\`, \`@subCollectionOf\`, \`@material\`, \`@formal\`, \`@characterization\`, \`@instantiation\`, \`@termination\`, \`@participational\`, \`@participation\`, \`@historicalDependence\`, \`@creation\`, \`@manifestation\`, \`@bringsAbout\`, \`@triggers\`.
(Refer to \`RelationStereotype\` in \`relations.langium\` for a full list).

**2.7.2. Connectors:**
*   \`--\`: General association.
*   \`<>--\`: Aggregation (shared part-whole). Source end has the diamond.
*   \`<o>--\`: Composition (exclusive part-whole). Source end has the filled diamond.
*   \`--<>\` / \`--<o>\`: Inverted connectors (diamond at the target end, less common in Tonto examples, but syntactically possible via \`RelationInvertedType\`).

**2.7.3. Cardinalities and End Names:**
Applied to both ends of the relation. End names are optional and enclosed in \`()\`.
Example: \`[1] (employer) -- employs -- [0..*] (employees) Employee\`

**2.7.4. Relation Meta-Attributes (at each end):**
Enclosed in \`({ ... } <endName>)\`.
Syntax: \`({ (ordered)?, (const)?, (derived)?, (subsets <OtherRelationName>)?, (redefines <OtherRelationName>)? } <endName>)\`
Example: \`({ ordered, subsets previousContracts } formerContracts)\`

**2.7.5. Internal Relation Syntax (within a class body):**
The class itself is the source of the relation.
\`(@<stereotype>)? (<firstEndMetaAttributes>)? [<firstEndCardinality>]? <connector> (<relationName>)? (--)? [<secondEndCardinality>]? (<secondEndMetaAttributes>)? <TargetClass> (specializes <OtherRelationName>)? (inverseOf <OtherRelationName>)?\`

Example (Person has an Address):
\`\`\`tonto
kind Person {
    // ... attributes ...
    [1] <>-- livesAt -- [1] Address
}
\`\`\`
Example (University has Departments):
\`\`\`tonto
kind University {
    @componentOf [1] <o>-- hasDepartments -- [1..*] Department
}
\`\`\`

**2.7.6. External Relation Syntax (outside class bodies):**
\`(@<stereotype>)? relation <SourceClass> (<firstEndMetaAttributes>)? [<firstEndCardinality>]? <connector> (<relationName>)? (--)? [<secondEndCardinality>]? (<secondEndMetaAttributes>)? <TargetClass> (specializes <OtherRelationName>)? (inverseOf <OtherRelationName>)?\`

Example (Employment relator mediating Employee and Employer):
\`\`\`tonto
relator EmploymentContract {
    @mediation [1..*] -- [1] Employee
    @mediation [1..*] -- [1] Employer
}
// Alternative external definition for one mediation:
// @mediation relation EmploymentContract [1..*] -- employeeEnd -- [1] Employee
\`\`\`

**2.8. Generalization Sets (Gensets)**
Group specializations and define properties like disjointness and completeness.

*   **Short Syntax:**
    \`(disjoint)? (complete)? genset <GensetName> where <Subclass1>, <Subclass2>, ... specializes <Superclass>\`
    Example:
    \`\`\`tonto
    disjoint complete genset PersonPhases where Child, Teenager, Adult specializes Person
    \`\`\`

*   **Expanded Syntax (allows categorizer):**
    \`(disjoint)? (complete)? genset <GensetName> {
        general <Superclass>
        (categorizer <HigherOrderType>)? // Optional higher-order type classifying the subclasses
        specifics <Subclass1>, <Subclass2>, ...
    }\`
    Example:
    \`\`\`tonto
    type PersonAgePhaseType
    disjoint complete genset PhasesOfPerson {
        general Person
        categorizer PersonAgePhaseType
        specifics Child, Teenager, Adult
    }
    \`\`\`
    *   \`disjoint\`: An instance of the superclass can be an instance of at most one of the subclasses in the set.
    *   \`complete\`: An instance of the superclass must be an instance of at least one of the subclasses in the set.


## 3. Multi-Level Modeling and the Powertype Pattern

[cite\_start]Multi-level modeling involves representing types whose instances are themselves types (e.g., "Species" is a type whose instances are "Dog", "Cat", etc., which are also types)[cite: 2028, 2035]. [cite\_start]In UFO and Tonto, this is achieved through **higher-order types**[cite: 1434, 2091]. [cite\_start]An individual (like Fido) is a 1st-order entity; a type of individual (\`kind Dog\`) is a 1st-order type; a type of type (\`type Species\`) is a 2nd-order type, and so on[cite: 2089, 2090].

The link between a type and its higher-order type is made with the \`instanceOf\` keyword:
\`kind Dog instanceOf Species\`

The "Powertype Pattern" is a central concept in multi-level modeling. [cite\_start]The literature reveals it's not a single pattern, but primarily two distinct relationships with precise semantics[cite: 2040, 2439, 2913].

### 3.1. The \`isPowertypeOf\` Relation (Strict Powertype)

[cite\_start]This is the strict, formal definition of a powertype, analogous to a mathematical powerset[cite: 2361, 2363].

  * [cite\_start]**Definition**: A higher-order type whose instances are **all possible specializations** of a base type, *including the base type itself*[cite: 2363]. [cite\_start]Each type has at most one powertype[cite: 2372].

  * **Tonto Keyword**: \`powertype ... of ...\`

  * **Purpose**: To represent the most general set of all subtypes for a given type.

  * **Example**:

    \`\`\`tonto
    // CarModel includes ALL specializations of Car (e.g., Sedan, SUV,
    // and even the generic Car type itself).
    powertype CarModel of Car

    // Specific car models are instances of this higher-order type.
    subkind Sedan specializes Car instanceOf CarModel
    subkind Suv specializes Car instanceOf CarModel
    \`\`\`

### 3.2. The \`categorizes\` Relation (Categorizer Type)

[cite\_start]This is the more common and practical pattern, which was informally called "powertype" by Odell[cite: 2435, 2436].

  * **Definition**: A higher-order type whose instances are a **subset of the proper specializations** of a base type, grouped by a specific classification criterion. [cite\_start]The base type is *not* an instance of the categorizer type[cite: 2443, 2444].

  * **Tonto Keyword**: \`type\` (or another class stereotype) used with \`instanceOf\` and typically as a \`categorizer\` in a \`genset\`.

  * **Purpose**: To define and constrain a specific taxonomy or set of subtypes for a base type.

  * **Example**:

    \`\`\`tonto
    // A general powertype (optional, but conceptually exists)
    powertype CarModel of Car

    // A type that categorizes Car models based on their propulsion system.
    [cite_start]// It is a specialization of the main powertype, CarModel. [cite: 2472, 2473]
    type PropulsionType specializes CarModel

    // The 'genset' is the primary way to use a categorizer.
    // It defines the specific subtypes and links them to their categorizer.
    disjoint complete genset CarPropulsion {
      general Car
      categorizer PropulsionType
      specifics ElectricCar, GasolineCar, HybridCar
    }

    // The specific types are instances of the categorizer.
    subkind ElectricCar specializes Car instanceOf PropulsionType
    subkind GasolineCar specializes Car instanceOf PropulsionType
    subkind HybridCar specializes Car instanceOf PropulsionType
    \`\`\`

The \`disjoint\` and \`complete\` properties of a \`genset\` correspond to formal variations of the \`categorizes\` relation: \`disjointlyCategorizes\` and \`completelyCategorizes\`. [cite\_start]When both are used, the higher-order type **\`partitions\`** the base type[cite: 2477, 2480, 2488].

### 3.3. Summary of Powertype Patterns

| Feature | \`powertype ... of ...\` (\`isPowertypeOf\`) | \`type\` as \`categorizer\` (\`categorizes\`) |
| :--- | :--- | :--- |
| **Definition** | [cite\_start]Includes **all** possible specializations of a base type. [cite: 2364] | [cite\_start]Includes a **specific subset** of specializations based on a criterion. [cite: 2443] |
| **Base Type Included?** | **Yes**. [cite\_start]The base type is considered an instance of its powertype. [cite: 2363] | **No**. [cite\_start]The base type is not an instance of the categorizer. [cite: 2444] |
| **Primary Use** | To define the universal set of subtypes. Often implicit, but can be explicit. | To define and constrain a specific, meaningful taxonomy (e.g., via a \`genset\`). |
| **Tonto Syntax** | \`powertype CarModel of Car\` | \`genset MyGenset { categorizer MyType ... }\` |

By clearly distinguishing these patterns, the LLM can generate more precise and well-founded Tonto models that correctly reflect the intended multi-level structure.

## 3. Best Practices with Tonto

*   **Modular Design:**
    *   Use separate \`.tonto\` files (packages) for distinct conceptual domains or modules of your ontology.
    *   Employ \`import\` statements to reuse elements from other packages, promoting a clean and organized project structure.
*   **Clear Naming:**
    *   Choose descriptive and unambiguous names for packages, classes, attributes, relations, and generalization sets. Common conventions include PascalCase for types (Classes, Datatypes, Enums) and camelCase for attributes and relation ends, although Tonto's grammar is flexible with \`ID\`. Adherence to UFO naming principles is also encouraged (e.g., relators often named as nouns representing the relationship, roles reflecting the role played).
*   **Accurate Stereotyping:**
    *   The choice of stereotype (e.g., \`kind\`, \`phase\`, \`role\`, \`relator\`) is crucial. It reflects the ontological nature of the concept according to UFO. Understand the UFO distinctions (rigidity, sortality, identity, dependence) to select the correct stereotype.
    *   Avoid overusing generic \`class\`. Specify the UFO stereotype as soon as the ontological nature is clear.
*   **Precise Cardinalities:**
    *   Define cardinalities for attributes and relation ends carefully to accurately represent the constraints of the domain.
*   **Ontological Natures for Non-Sortals:**
    *   When defining non-sortal types (\`category\`, \`mixin\`, \`phaseMixin\`, \`roleMixin\`), use the \`of <nature>\` clause to specify the allowed ontological natures of their instances if they are not universally applicable (e.g., \`category PhysicalEntity of objects\`).
*   **Relation Definitions:**
    *   Internal relations (defined within a class body) are suitable when a class is the primary owner or source of the relationship, especially for part-whole relations.
    *   External relations are useful for defining relationships between classes from different (potentially imported) packages or when a class has numerous relations, to keep the class body cleaner.
    *   Use OntoUML relation stereotypes (\`@mediation\`, \`@componentOf\`, etc.) to convey precise semantics.
*   **Meaningful Generalization Sets:**
    *   Use \`genset\` to structure taxonomies, explicitly stating criteria for specialization (e.g., by age, by function).
    *   Clearly indicate \`disjoint\` and \`complete\` properties to define partitions or coverings.
*   **Leverage Tooling:**
    *   Pay attention to real-time validation errors and warnings provided by the Tonto editor. They often highlight ontological inconsistencies or deviations from UFO principles.
    *   Use auto-complete and snippets to speed up development and reduce syntax errors.
*   **Consistency with UFO:**
    *   Continuously refer to UFO principles when modeling. Tonto is a syntax for these principles. For example, ensure that sortals ultimately specialize a unique kind (or other ultimate sortal type), and that rigidity constraints in inheritance hierarchies are respected.

## 5. Project Structure

A typical Tonto project has the following structure:

-   **\`tonto.json\`**: The manifest file, containing project metadata like name, version, and dependencies.
-   **\`src/\`**: The directory for all \`.tonto\` source files, which define the ontology.
-   **\`lib/\`**: Contains external ontologies or modules, managed by the Tonto Package Manager (\`tpm\`).
-   **\`generated/\`**: The default output directory for generated artifacts, such as JSON serializations or GUFO transformations.

## 6. Core Concepts

-   **Ontology as Code**: Tonto treats ontologies as code, allowing for versioning, modularity, and automated validation.
-   **Modularity**: Ontologies can be broken down into smaller, reusable modules and packages.
-   **Validation**: Tonto provides both local and API-based validation to ensure the semantic correctness of the ontology.
-   **Transformation**: Tonto models can be transformed into other formats, such as GUFO (General Upper-Level Foundational Ontology), for interoperability.

## 7. Command-Line Interface (CLI)

The \`tonto-cli\` is the primary tool for interacting with Tonto projects. The LLM can use it to perform various tasks.

### \`tonto-cli\` Commands:

-   **\`tonto-cli init\`**: Initializes a new Tonto project, creating the basic directory structure and a \`tonto.json\` manifest file.
-   **\`tonto-cli validate <directory>\`**: Validates a Tonto project.
    -   By default, it performs local checks for syntax and semantic errors.
    -   Use the \`--with-api\` flag to perform additional validation using the \`ontouml-js\` API.
    -   *Example*: \`tonto-cli validate .\`
-   **\`tonto-cli generate <directory>\`**: Generates a JSON representation of the Tonto project.
    -   Use the \`-d, --destination <dir>\` option to specify an output directory.
-   **\`tonto-cli transform <directory>\`**: Transforms the Tonto project into GUFO (in Turtle/TTL format) using the \`ontouml-js\` API.
-   **\`tonto-cli import <file.json>\`**: Generates \`.tonto\` files from a JSON file.
-   **\`tonto-cli generateSingle <file.tonto>\`**: Generates a JSON representation from a single \`.tonto\` file.
-   **\`tonto-cli importSingle <file.json>\`**: Generates a \`.tonto\` file from a single JSON file.

### Tonto Package Manager (\`tpm\`)

The \`tpm\` is a dependency manager for Tonto projects, used to install and manage external ontology packages.

-   **\`tpm install\`**: Installs the dependencies listed in the \`tonto.json\` file.
-   **\`tpm add <package>\`**: Adds a new dependency to the project and updates the manifest file.

## 8. General Workflow for the LLM

1.  **Analyze the User's Request**: Before taking any action, carefully analyze the user's request to understand their goal.

2.  **Consult the LLM Guidance Rule**: To determine the best course of action, refer to the \`@llm-guidance.mdc\` rule. This file will help you decide which specialized guidance file to use based on the user's intent.

3.  **Follow Specialized Guidance**: Once you have identified the appropriate guidance file (e.g., for creating new elements, analyzing terminology, or summarizing the model), follow the instructions within that file to complete the task.

4.  **Default to This Guidance for Basic Tasks**: If the user's request is for a basic task, such as running a CLI command or asking about the project structure, you can refer to the information in this file.

5. **Linter Errors**: You must always check for @Linter Errors to understand if the ontology is correct.

By following this workflow, you can ensure that you are always using the most relevant and detailed instructions to assist the user, leading to more accurate and helpful responses.
`;