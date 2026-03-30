# Understanding and Summarizing Tonto Ontologies

This guide covers how to produce clear, informative summaries of Tonto ontologies that help users quickly understand the model's theme, scope, and structure.

## General Approach

- **Focus on abstraction**: Highlight the most significant concepts and relationships, not every attribute.
- **Use ontological terminology**: Refer to classes by their UFO stereotypes (e.g., "the `kind` Person", "the `relator` Employment").
- **Be objective**: Reflect what the Tonto code actually defines, don't infer beyond it.

## Summarizing a Single Package

Cover these aspects in order:

1. **Package Purpose**: State the main theme or domain, inferred from the package name, class names, and any comments.

2. **Key Classes**: List the most important classes, prioritizing ultimate sortals (`kind`, `collective`, `quantity`, `relator`, `event`, `situation`) since they represent foundational concepts. Mention significant `subkind`s, `phase`s, or `role`s if central.

3. **Core Relationships**: Describe the most important relations, specifying stereotypes (`@componentOf`, `@mediation`, etc.) and cardinalities when informative.

4. **Important Generalization Sets**: Describe any `genset`s, noting `disjoint`/`complete` properties and listing superclass with key subclasses.

5. **Key Datatypes/Enumerations**: Mention custom `datatype`s or `enum`s if fundamental to the domain.

## Summarizing an Entire Ontology (Multiple Packages)

1. **Overall Domain and Purpose**: High-level statement about what the ontology models.

2. **Modular Structure**: Identify main packages, their sub-domains, and how they relate (imports, cross-package relations).

3. **Central Concepts**: Highlight the most fundamental types that are central across the ontology.

4. **Key Relationship Patterns**: Describe common patterns — extensive parthood, mediations for contracts, characterizations for qualities, etc.

5. **Major Taxonomies**: Summarize the most important generalization hierarchies.

6. **Ontological Profile**: Characterize what types of entities are predominantly modeled (e.g., "focuses on substantials and their roles, with some events for processes").

## What to Avoid

- **Excessive detail**: Don't list every class, attribute, or end name.
- **Syntax recitation**: Explain the meaning, don't just re-state code.
- **Assumptions**: Don't infer information not present in the definitions.
- **Lengthy explanations**: Keep summaries concise and focused.
