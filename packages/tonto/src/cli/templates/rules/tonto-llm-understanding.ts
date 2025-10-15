export const tontoLLMUnderstanding = 
`
# LLM Guidance for Understanding and Summarizing Tonto (Textual Ontologies)

## 1. Guidance for Summarizing Tonto Ontologies

When asked to summarize a Tonto ontology or a specific package, your goal is to provide a concise yet informative overview that helps a user quickly understand its main theme, scope, and key structural elements.

**1.1. General Approach to Summarization**

*   **Identify the Scope:** Determine if the request is for a single package or the entire ontology (which may span multiple packages).
*   **Focus on Abstraction:** Avoid getting lost in the minutiae of every attribute or secondary class. Highlight the most significant concepts and relationships.
*   **Use Ontological Terminology Correctly:** Refer to classes by their UFO stereotypes (e.g., "the \`kind\` Person", "the \`relator\` Employment").
*   **Be Objective:** The summary should reflect the structure and content of the ontology as defined in the Tonto code.

**1.2. Summarizing a Single Tonto Package**

When summarizing a single \`.tonto\` package, focus on:

1.  **Package Purpose (if discernible):**
    *   Briefly state the main theme or domain of the package. This might be inferred from the package name, prominent class names, or comments if available.
    *   Example: "The \`Persons\` package defines core concepts related to individuals and their basic properties."

2.  **Key Classes:**
    *   List the most important classes defined *within* this package.
    *   Prioritize **Ultimate Sortals** (\`kind\`, \`collective\`, \`quantity\`, \`quality\`, \`mode\`, \`relator\`, \`event\`, \`situation\`) as they often represent foundational concepts.
    *   Mention significant \`subkind\`s, \`phase\`s, or \`role\`s if they are central to the package's purpose.
    *   Example: "Key classes include the \`kind\` \`Person\`, the \`phases\` \`Child\` and \`Adult\` specializing \`Person\`, and the \`role\` \`Employee\`."

3.  **Core Relationships:**
    *   Describe the most important relationships where at least one end is a class defined in this package.
    *   Specify relation stereotypes (\`@componentOf\`, \`@mediation\`, \`@memberOf\`, etc.) and cardinalities if they are particularly informative.
    *   Distinguish between internal and external relations if relevant.
    *   Example: "The \`Person\` kind has a \`[1]\` to \`[1]\` \`componentOf\` relation \`hasHeart\` to the \`Heart\` kind. The \`Employee\` role is mediated by an \`EmploymentContract\` relator connecting to an \`Organization\`."

4.  **Important Generalization Sets:**
    *   If the package defines any \`genset\`s, describe them, noting if they are \`disjoint\` and/or \`complete\`, and list the superclass and key subclasses.
    *   Example: "A \`disjoint complete genset\` named \`PersonLifecycle\` categorizes \`Person\` into \`Child\`, \`Teenager\`, and \`Adult\` phases."

5.  **Key Datatypes or Enumerations (if central):**
    *   Mention any custom \`datatype\`s or \`enum\`s defined in the package if they are fundamental to understanding the package's domain.
    *   Example: "The package defines a \`datatype\` \`Address\` and an \`enum\` \`EyeColor\`."

**1.3. Summarizing an Entire Tonto Ontology (Multiple Packages)**

When summarizing an entire ontology, which might consist of several inter-related packages:

1.  **Overall Domain and Purpose:**
    *   Start with a high-level statement about what the entire ontology is about.
    *   Example: "This ontology models the domain of a university, covering its organizational structure, personnel, students, and academic activities."

2.  **Modular Structure (Key Packages):**
    *   Identify the main packages and briefly describe their respective roles or sub-domains.
    *   Mention how these packages relate to each other (e.g., through imports and cross-package relations).
    *   Example: "The ontology is structured into three main packages: \`UniversityOrgStructure\` (defining departments, faculties), \`Personnel\` (defining employees, roles like Professor), and \`AcademicLife\` (defining courses, enrollments, student phases)."

3.  **Central Concepts (Across Packages):**
    *   Highlight the most fundamental \`kind\`s, \`relator\`s, or other ultimate sortals that are central to the entire ontology. These might be defined in core packages and reused in others.
    *   Example: "Core concepts across the ontology include \`University\` (kind), \`Person\` (kind), \`Employment\` (relator), and \`CourseOffering\` (event)."

4.  **Key Relationship Patterns:**
    *   Describe common types of relationships or significant patterns observed across the ontology (e.g., extensive use of parthood, mediations for contractual relations, characterizations for qualities).
    *   Example: "The ontology makes significant use of \`@componentOf\` relations to model the structure of the \`University\` and its \`Departments\`. Many social relationships are modeled using \`relator\`s like \`Enrollment\` and \`Supervision\`."

5.  **Major Taxonomies and Generalization Sets:**
    *   Summarize the most important generalization hierarchies, especially those that span multiple specialized classes or are foundational to the domain.
    *   Example: "A key taxonomy is built around \`Person\`, which is specialized into various roles (\`Student\`, \`Employee\`) and phases (\`Undergraduate\`, \`Graduate\`)."

6.  **Ontological Profile:**
    *   Briefly characterize the types of entities predominantly modeled (e.g., "The ontology focuses heavily on substantials (objects, collectives) and their roles, with some events capturing academic processes.").

**1.4. What to Avoid in Summaries**

*   **Excessive Detail:** Do not list every single class, attribute, or relation end name.
*   **Syntax Recitation:** Do not just re-state the Tonto code. Explain the meaning.
*   **Assumptions:** Do not infer information not present in the Tonto definitions.
*   **Lengthy Explanations:** Keep the summary concise and to the point.

By following these guidelines, an LLM can be effectively guided to understand Tonto and assist in summarizing ontologies in a well-founded manner. 
`;