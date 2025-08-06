export const tontoLLMDocumentationGuide = 
`---
alwaysApply: true
---
# LLM Guidance: Writing Effective Ontology Documentation

This document provides guidelines for an LLM to create high-quality, informative, and user-friendly documentation for elements within a Tonto ontology. The goal is to produce documentation that is not only descriptive but also explains the underlying ontological choices based on OntoUML principles.

## 1. Core Principles

-   **Clarity and Conciseness**: Write in a clear, straightforward manner. Avoid jargon where possible, but when using technical terms (especially OntoUML stereotypes), explain them.
-   **User-Centricity**: Frame explanations from the user's perspective. The documentation should help them understand what a concept means and how it fits into the broader model.
-   **Ontological Rigor**: Ensure that the documentation accurately reflects the ontological commitments made by the chosen stereotype (e.g., \`kind\`, \`role\`, \`phase\`, \`relator\`).
-   **Consistency**: Apply these documentation standards uniformly across all ontology elements.

## 2. Guide to Writing Labels

Labels are the primary, human-readable identifiers for an element.

-   **Brevity**: A label should be a short, concise name for the concept. Typically one to three words.
-   **Capitalization**: Use PascalCase for class names (e.g., \`ClassFeature\`) and camelCase for attributes/relations (e.g., \`featureName\`).
-   **Multi-language Support**:
    -   Always provide labels in both English (\`@en\`) and Brazilian Portuguese (\`@pt-br\`).
    -   Ensure the translations are accurate and culturally appropriate.

**Example:**
\`\`\`tonto
label {
    @en "Class Feature"
    @pt-br "Característica de Classe"
}
\`\`\`

## 3. Guide to Writing Descriptions

Descriptions provide a summary of the element's meaning in the context of the domain (e.g., RPGs).

-   **Contextualize**: Explain what the concept is within its domain. For RPGs, referencing well-known games (like Dungeons & Dragons, Pathfinder, World of Warcraft) is an excellent way to provide context.
-   **Define the Concept**: The description should be a simple, clear definition. What is this thing? What is its purpose?
-   **Multi-language Support**: Provide descriptions in both \`@en\` and \`@pt-br\`, ensuring high-quality translation.

**Example:**
\`\`\`tonto
description {
    @en "A special ability, trait, or proficiency granted by an adventuring class, often at a specific level."
    @pt-br "Uma habilidade especial, traço ou proficiência concedida por uma classe de aventureiro, frequentemente em um nível específico."
}
\`\`\`

## 4. Guide to Writing JSDoc Block Comments

The JSDoc-style block comment (\`/** ... */\`) is crucial for explaining the *ontological* choices behind an element. This is where you explain the "why" to the user, not just the "what". **Do not repeat information already present in the labels or descriptions.**

**Structure of a JSDoc Comment:**

1.  **High-Level Summary (Optional but Recommended)**: A single sentence summarizing the element's purpose.
2.  **OntoUML Stereotype Explanation**:
    -   State the stereotype used (e.g., \`kind\`, \`subkind\`, \`phase\`, \`role\`, \`relator\`).
    -   Explain *why* that stereotype was chosen for this specific concept, referencing its OntoUML properties (e.g., identity, rigidity, dependency).
    -   Describe the implications of this choice.
3.  **Relationships and Constraints**: Briefly explain any critical relationships this element has with others.
4.  **Usage Example (Optional)**: A brief example of how this element would be used in practice.

---

### OntoUML Stereotype Cheatsheet for Documentation

-   **\`kind\`**: "This is a \`kind\` because it provides a principle of identity for its instances. An instance of \`X\` cannot stop being an \`X\` without ceasing to exist. For example, a \`Person\` is always a \`Person\`."
-   **\`subkind\`**: "This is a \`subkind\` because it represents a rigid specialization of a \`kind\`. An instance of \`Y\` (the subkind) is always and necessarily an instance of \`X\` (the kind). For example, a \`Man\` is always a \`Person\`."
-   **\`phase\`**: "This is a \`phase\` because it represents a contingent and temporary stage in the life of a \`kind\`. An instance can enter and leave this phase without losing its identity. For example, a \`Person\` can be a \`Child\` and later become an \`Adult\`."
-   **\`role\`**: "This is a \`role\` because it is a contingent classification that depends on a relationship with another entity. An instance plays this role only within a specific context. For example, a \`Person\` is only a \`Student\` in the context of being enrolled in a school."
-   **\`relator\`**: "This is a \`relator\` because it represents the truth-maker of a material relationship, connecting two or more entities. It is the relationship itself, reified as an object. For example, a \`MarriageContract\` is the relator that connects two \`Spouses\`."
-   **\`type\` / \`powertype\`**: "This is a \`type\` (or \`powertype\`) because its instances are themselves types (classes). It is a higher-order concept used for categorization. For example, \`Species\` is a type whose instances could be \`Dog\`, \`Cat\`, etc."
-   **\`category\`**: "This is a \`category\` because it is a rigid classification for instances of different kinds that share common properties. For example, \`LivingBeing\` could be a category for \`Person\` and \`Animal\`."

---

## 5. Examples

### Good Example

\`\`\`tonto
/**
* Represents the role a Character plays when formally enrolled in an educational institution.
*
* **OntoUML:** This is a \`role\` because a Character is only a \`Student\` while they maintain a relationship 
* (an enrollment) with a school. It is a temporary and context-dependent classification. 
* If the relationship ends, the Character ceases to be a \`Student\` but remains a \`Person\`.
*/
role Student specializes Person {
    label {
        @en "Student"
        @pt-br "Estudante"
    }
    description {
        @en "A person who is studying at a school or college."
        @pt-br "Uma pessoa que está estudando em uma escola ou faculdade."
    }
    // ... relations to a School relator
}
\`\`\`

### Bad Example (Redundant and Uninformative)

\`\`\`tonto
/**
* This is the Student role.
*/
role Student specializes Person {
    label {
        @en "Student"
        @pt-br "Estudante"
    }
    description {
        // Missing description
    }
}
\`\`\`

In this bad example, the comment is useless, and the description is missing. It fails to explain *why* \`Student\` is a role from an ontological perspective.
`;