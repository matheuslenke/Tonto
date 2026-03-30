# Writing Effective Ontology Documentation

This guide covers how to write labels, descriptions, and JSDoc block comments for elements in a Tonto ontology. Good documentation explains not just *what* something is, but *why* it was modeled the way it was.

## Core Principles

- **Clarity and Conciseness**: Straightforward language. Explain technical terms when used.
- **User-Centricity**: Help the reader understand what a concept means and how it fits the broader model.
- **Ontological Rigor**: Accurately reflect the commitments made by the chosen stereotype.
- **Consistency**: Apply standards uniformly.

## Labels

Labels are the primary human-readable identifier. Keep them short (1-3 words), in PascalCase for classes.

Always provide both English and Brazilian Portuguese:

```tonto
label {
    @en "Class Feature"
    @pt-br "Caracteristica de Classe"
}
```

## Descriptions

Descriptions explain what the concept is within its domain. Contextualize with domain-specific references when helpful.

```tonto
description {
    @en "A special ability, trait, or proficiency granted by an adventuring class, often at a specific level."
    @pt-br "Uma habilidade especial, traco ou proficiencia concedida por uma classe de aventureiro, frequentemente em um nivel especifico."
}
```

## JSDoc Block Comments

The `/** ... */` comment is where you explain the *ontological* choices — the "why", not just the "what". Do not repeat information from labels or descriptions.

### Structure

1. **High-level summary** (1 sentence, optional but recommended)
2. **OntoUML stereotype explanation**: State the stereotype, explain *why* it was chosen, describe implications
3. **Relationships and constraints**: Critical connections to other elements
4. **Usage example** (optional)

### Stereotype Explanation Templates

- **`kind`**: "This is a `kind` because it provides a principle of identity for its instances. An instance of X cannot stop being an X without ceasing to exist."
- **`subkind`**: "This is a `subkind` because it represents a rigid specialization of a `kind`. An instance of Y is always and necessarily an instance of X."
- **`phase`**: "This is a `phase` because it represents a contingent, temporary stage in the life of a `kind`. An instance can enter and leave this phase without losing its identity."
- **`role`**: "This is a `role` because it is a contingent classification that depends on a relationship with another entity. An instance plays this role only within a specific context."
- **`relator`**: "This is a `relator` because it represents the truth-maker of a material relationship, connecting two or more entities. It is the relationship itself, reified as an object."
- **`type`/`powertype`**: "This is a `type` because its instances are themselves types. It is a higher-order concept used for categorization."
- **`category`**: "This is a `category` because it is a rigid classification for instances of different kinds that share common properties."

### Good Example

```tonto
/**
 * Represents the role a Character plays when formally enrolled in an educational institution.
 *
 * **OntoUML:** This is a `role` because a Character is only a `Student` while they maintain
 * a relationship (an enrollment) with a school. It is a temporary and context-dependent
 * classification. If the relationship ends, the Character ceases to be a `Student` but
 * remains a `Person`.
 */
role Student specializes Person {
    label {
        @en "Student"
        @pt-br "Estudante"
    }
    description {
        @en "A person who is studying at a school or college."
        @pt-br "Uma pessoa que esta estudando em uma escola ou faculdade."
    }
}
```

### Bad Example (avoid)

```tonto
/**
 * This is the Student role.
 */
role Student specializes Person {
    label { @en "Student" @pt-br "Estudante" }
    description {
        // Missing description
    }
}
```

The bad example's comment is redundant (just restates the code) and the description is missing. It fails to explain *why* `Student` is a role from an ontological perspective.
