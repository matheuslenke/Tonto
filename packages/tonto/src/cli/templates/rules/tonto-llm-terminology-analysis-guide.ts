export const tontoLLMTerminologyAnalysisGuide = 
`
# LLM Guidance for Understanding Tonto and Analyzing Ontology Terminology

## 1. Guidance for Terminology Analysis and Naming Suggestions in Tonto Ontologies

This section guides the LLM in analyzing the terminology (names of classes, attributes, relations) within a Tonto ontology and providing constructive feedback or suggestions for improvement. The goal is to enhance the clarity, precision, and consistency of the ontology's vocabulary.

**1.1. General Principles for Naming Evaluation**

When evaluating and suggesting names, consider the following:

*   **Clarity:** Is the name easy to understand and unambiguous within its context?
*   **Precision:** Does the name accurately and specifically reflect the concept, property, or relationship being modeled?
*   **Consistency:**
    *   Are naming conventions (e.g., PascalCase for types, camelCase for properties/ends) followed consistently?
    *   Is there consistency in how similar concepts are named across the ontology?
*   **Conciseness:** Is the name as short as possible without sacrificing clarity or precision?
*   **Ontological Congruence:** Does the name align with the element's UFO stereotype and its ontological meaning (e.g., a \`kind\` name like \`Person\`, a \`relator\` name like \`EmploymentContract\`, a \`phase\` name like \`Child\`)?
*   **Domain Relevance:** Does the name resonate with the terminology used by experts in the domain being modeled? Strive for a balance between domain language and ontological rigor.
*   **Avoidance of Ambiguity:** Does the name avoid terms that could be easily misinterpreted or have multiple meanings in the context?

**1.2. Analyzing Class Terminology**

For each class:

1.  **Examine the Class Name in conjunction with its Definition:**
    *   **Stereotype:** How well does the name reflect its OntoUML stereotype (e.g., \`kind\`, \`role\`, \`phase\`, \`relator\`, \`event\`)? For instance, a \`relator\` might be named \`Marriage\` or \`Enrollment\`. An \`event\` might be \`PurchaseOrderSubmission\`.
    *   **Ontological Natures (if specified):** Is the name compatible with the declared \`of <nature1>, ...\`?
    *   **Labels and Descriptions:** Do the provided \`label\` and \`description\` (in any language) support, clarify, or perhaps suggest a better term than the current class name?
    *   **Attributes:** Do the names and types of its attributes coherently define the concept suggested by the class name? For example, a class named \`Student\` might have attributes like \`studentID\`, \`major\`.
    *   **Relations:** Do the relations it participates in (and the roles suggested by relation end names) make sense for a class with this name? For example, a \`Student\` class might be related to a \`Course\` class via an \`enrollsIn\` relation.
    *   **Specialization/Generalization:** If it \`specializes\` a superclass, is the name a more specific term? If it is a superclass, is its name appropriately general for its subclasses?
    *   **Instantiation (\`instanceOf\`):** If it's an instance of a higher-order type, does the name fit the classification scheme?

2.  **Criteria for Suggesting Class Name Changes:**
    *   The name is too generic (e.g., \`Item\`, \`Data\`, \`Thing\`) when its properties and stereotype suggest a more specific concept.
    *   The name is misleading given its stereotype (e.g., naming a \`relator\` like an object \`kind\`, or an \`event\` like a \`role\`).
    *   The name conflicts with UFO principles associated with its stereotype (e.g., a \`phase\` name that implies permanence).
    *   Labels, descriptions, attributes, or relations strongly suggest a more common, precise, or domain-appropriate term.
    *   Inconsistency with how similar concepts are named elsewhere in the ontology.

**1.3. Analyzing Attribute Terminology**

For each attribute within a class:

1.  **Examine the Attribute Name in conjunction with its Definition:**
    *   **Containing Class Context:** Does the name clearly indicate the property it represents *for that specific class*?
    *   **Data Type:** Is the name consistent with its data type (e.g., \`age\` for \`number\`, \`isArchived\` for \`boolean\`, \`registrationDate\` for \`date\`)?
    *   **Cardinality:** Does the name make sense with the cardinality (e.g., \`phoneNumber\` for \`[1..*]\` or \`primaryPhoneNumber\` for \`[0..1]\`)?
    *   **Meta-properties (\`const\`, \`derived\`, \`ordered\`):**
        *   If \`derived\`, does the name suggest it (e.g., \`fullName\` derived from \`firstName\` and \`lastName\`)?
        *   If \`const\`, does the name imply immutability (e.g., \`socialSecurityNumber\`)?
        *   If \`ordered\`, does the name suggest a sequence (e.g., \`rankingHistory\`)?
    *   **Labels and Descriptions (if available for attributes in the future, or inferred from class description):** Do they clarify the attribute's purpose?

2.  **Criteria for Suggesting Attribute Name Changes:**
    *   The name is vague or uninformative (e.g., \`value\`, \`property\`, \`attr1\`).
    *   The name doesn't clearly fit the data type (e.g., \`status\` as a \`number\` if it's conceptually an enumeration like \`Pending\`, \`Approved\`).
    *   The name could be more specific or less ambiguous (e.g., instead of just \`date\`, perhaps \`creationDate\` or \`effectiveDate\` depending on context).
    *   Boolean attributes not clearly phrased as a question or state (e.g., prefer \`isActive\` or \`isEnabled\` over just \`active\`).
    *   Inconsistency with attribute naming elsewhere.

**1.4. Analyzing Relation Terminology**

For each relation (internal or external):

1.  **Examine Relation Name and End Names in conjunction with its Definition:**
    *   **Relation Name (if present):**
        *   Does it accurately describe the nature of the relationship between the source and target classes?
        *   Is it consistent with the **relation stereotype** (e.g., \`@mediation\` for a relator's connection, \`@componentOf\` for parthood)? A material relation might be named with a verb phrase (e.g., \`employs\`).
    *   **Relation End Names (if present):**
        *   Do they clearly indicate the role played by the class at that end of the relation, from the perspective of the *other* class?
        *   Are they descriptive and unambiguous? (e.g., for a \`Person -- employedBy -- Organization\` relation, end names could be \`employees\` at the \`Person\` side (role of Organization) and \`employer\` at the \`Organization\` side (role of Person)).
    *   **Connected Classes:** Are the names appropriate for the types of classes being related?
    *   **Cardinalities:** Do the names align with the specified cardinalities? (e.g., an end name \`manager\` might imply a \`[0..1]\` or \`[1]\` cardinality from the perspective of the \`Employee\`).
    *   **Relation Stereotype:** Does the chosen stereotype (e.g., \`@material\`, \`@formal\`, \`@componentOf\`, \`@mediation\`) semantically fit with the names used?

2.  **Criteria for Suggesting Relation/End Name Changes:**
    *   The relation name is missing, and adding one would significantly improve clarity.
    *   The relation name or end names are too generic (e.g., \`has\`, \`isRelatedTo\`, \`link\`).
    *   End names are not intuitive or do not clearly express the role from the counterparty's perspective.
    *   Verb-based relation names are passive when active voice would be clearer, or vice-versa.
    *   Names conflict with the semantic meaning of the relation stereotype.
    *   Names are not idiomatic for the domain or are easily confusable.
    *   Inconsistency in how similar relationships are named.

**1.5. Output Format for Terminology Feedback**

When providing feedback on terminology:

1.  **Identify the Element:** Clearly state which element is being discussed (e.g., "Class \`CustomerData\`", "Attribute \`val\` in class \`Order\`", "Relation between \`Product\` and \`Supplier\` with ends \`suppliedItems\` and \`vendor\`").
2.  **State the Current Name(s):** Quote the current name(s).
3.  **Provide Rationale:** Concisely explain *why* the current name might be suboptimal or could be improved. Refer to specific principles (clarity, precision, ontological congruence, consistency with attributes/relations, etc.).
4.  **Suggest Alternatives (if applicable):**
    *   Offer one or more specific alternative names.
    *   Briefly explain why the suggested alternative(s) might be better.
5.  **Affirm Good Names:** If a name is already clear, precise, and appropriate, acknowledge this. Positive feedback is also valuable.

**Example of Feedback:**

*   **Element:** Class \`InfoHolder\`
*   **Current Name:** \`InfoHolder\`
*   **Rationale:** The name \`InfoHolder\` is very generic. The class has a stereotype \`relator\` and its attributes \`startDate\`, \`endDate\` and relations to \`Person\` and \`Project\` (named \`member\` and \`assignedProject\`) suggest it represents an assignment or membership over time.
*   **Suggestion(s):** Consider \`ProjectMembership\` or \`Assignment\`. \`ProjectMembership\` more directly reflects the role as a \`relator\` connecting a \`Person\` to a \`Project\`.

By following these guidelines, an LLM can be effectively guided to understand Tonto and assist in analyzing and improving the terminology of ontologies in a well-founded manner. 
`;