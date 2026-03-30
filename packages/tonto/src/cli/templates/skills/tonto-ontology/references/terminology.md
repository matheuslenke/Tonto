# Terminology Analysis and Naming Suggestions

This guide helps analyze the terminology (names of classes, attributes, relations) within a Tonto ontology and provide constructive feedback for improvement. The goal is to enhance clarity, precision, and consistency.

## Evaluation Principles

When evaluating names, consider:

- **Clarity**: Easy to understand and unambiguous in context.
- **Precision**: Accurately reflects the concept being modeled.
- **Consistency**: Follows naming conventions (PascalCase for types, camelCase for properties) uniformly.
- **Conciseness**: As short as possible without losing clarity.
- **Ontological Congruence**: Name aligns with the UFO stereotype — a `kind` should sound like a fundamental type, a `relator` like a reified relationship, a `phase` like a temporary state.
- **Domain Relevance**: Resonates with expert terminology in the domain.

## Analyzing Class Names

For each class, examine the name together with:

1. **Its stereotype** — Does the name reflect whether it's a `kind`, `role`, `phase`, `relator`, `event`?
   - Relators are typically nouns representing the relationship (e.g., `Marriage`, `Enrollment`, `Employment`)
   - Phases suggest temporariness (e.g., `Child`, `Active`, `Pending`)
   - Roles suggest relational context (e.g., `Student`, `Customer`, `Employee`)
   - Events suggest happenings (e.g., `Purchase`, `Graduation`, `Submission`)

2. **Its attributes** — Do attributes coherently define the concept? (e.g., a `Student` having `studentID`, `major` makes sense)

3. **Its relations** — Do participated relations and end names make sense for this class?

4. **Its specialization hierarchy** — Is the name appropriately more specific than its superclass?

5. **Labels and descriptions** — Do they suggest a better term?

### Red Flags for Class Names

- Too generic: `Item`, `Data`, `Thing`, `InfoHolder`
- Misleading for the stereotype: naming a `relator` like an object `kind`, or an `event` like a `role`
- Conflicts with UFO rigidity: a `phase` name that implies permanence
- Inconsistency with similar concepts elsewhere in the ontology

## Analyzing Attribute Names

For each attribute, check:

- **Data type alignment**: `age` for `number`, `isActive` for `boolean`, `registrationDate` for `date`
- **Cardinality fit**: `phoneNumber` for `[1..*]` vs. `primaryPhone` for `[0..1]`
- **Meta-property hints**: `derived` attributes should suggest derivation (e.g., `fullName`); `const` attributes should suggest immutability (e.g., `ssn`)
- **Specificity**: prefer `creationDate` or `effectiveDate` over just `date`
- **Boolean convention**: use `isActive`, `hasChildren` — not just `active`, `children`

### Red Flags for Attribute Names

- **Reserved keyword used as name**: `description`, `label`, `value`, `role`, `type`, `kind`, `class`, and all other Tonto stereotype/structural keywords are reserved and cannot be used as attribute names. Use prefixed alternatives (`_description`, `_value`, `_role`) or synonyms (`summary`, `amount`, `participationRole`).
- Vague: `property`, `attr1`, `data`
- Type mismatch: `status` as `number` when it's conceptually an enumeration
- Ambiguous: `date` without context

## Analyzing Relation Names

For each relation, check:

- **Relation name**: Does it describe the nature of the connection? Material relations often use verb phrases (e.g., `employs`, `enrolledIn`)
- **End names**: Do they indicate the role played from the other class's perspective? (e.g., `employees` at Person end, `employer` at Organization end)
- **Stereotype alignment**: Does the name match the relation stereotype semantics?
- **Cardinality consistency**: Does `manager` imply `[0..1]` or `[1]`?

### Red Flags for Relation Names

- Missing name where one would improve clarity
- Too generic: `has`, `isRelatedTo`, `link`
- End names not intuitive or missing

## Output Format

When providing terminology feedback, structure it as:

1. **Element**: Which element (e.g., "Class `CustomerData`", "Attribute `val` in `Order`")
2. **Current Name**: Quote the current name
3. **Rationale**: Why it could be improved (reference specific principles)
4. **Suggestion**: One or more alternatives with brief justification
5. **Affirmation**: Acknowledge names that are already clear and appropriate

**Example:**

- **Element:** Class `InfoHolder` (stereotype: `relator`)
- **Current Name:** `InfoHolder`
- **Rationale:** Too generic. Attributes `startDate`, `endDate` and relations to `Person` and `Project` with ends `member` and `assignedProject` suggest this represents a project membership.
- **Suggestion:** `ProjectMembership` — directly reflects its role as a `relator` connecting a `Person` to a `Project`.
