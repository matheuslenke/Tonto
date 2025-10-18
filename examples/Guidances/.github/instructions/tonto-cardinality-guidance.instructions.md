---
applyTo: "src/**/*.tonto"
---

# Understanding Cardinalities in Tonto Relations

Cardinalities specify **how many instances** of one class can participate in a relationship with instances of another class. They are crucial for precisely defining the constraints of your domain.

## Cardinality Notation

In Tonto, cardinalities are specified in square brackets `[min..max]`:

- `[1]` - exactly one
- `[0..1]` - zero or one (optional)
- `[1..*]` - one or more
- `[0..*]` or `[*]` - zero or more (any number)
- `[2..5]` - between 2 and 5 (specific range)

## Reading Cardinalities in Relations

The key to understanding cardinalities is knowing which side you're reading from. In a relation, cardinalities specify constraints **from the perspective of the opposite end**.

### Basic Syntax Pattern

```tonto
[cardinalityA] -- relationName -- [cardinalityB] TargetClass
```

- **`[cardinalityA]`** (left side): How many instances of the **source class** can be associated with **one instance** of `TargetClass`
- **`[cardinalityB]`** (right side): How many instances of `TargetClass` can be associated with **one instance** of the source class

## Examples from Your Healthcare Domain

Let me provide practical examples using your `healthcare` package:

### Example 1: Patient and Medical Record (One-to-One)

```tonto
role Patient specializes Person {
    [1] -- hasMedicalRecord -- [1] MedicalRecord
}
```

**Reading:**
- **Left `[1]`**: Each `MedicalRecord` is associated with exactly **one** `Patient`
- **Right `[1]`**: Each `Patient` has exactly **one** `MedicalRecord`

This represents a **one-to-one** mandatory relationship: every patient must have exactly one medical record, and each medical record belongs to exactly one patient.

### Example 2: Patient and Treatment (One-to-Many)

```tonto
role Patient specializes Person {
    [1] -- receives -- [0..*] Treatment
}
```

**Reading:**
- **Left `[1]`**: Each `Treatment` is given to exactly **one** `Patient`
- **Right `[0..*]`**: Each `Patient` can receive **zero or more** `Treatment`s

This represents a **one-to-many** relationship: a patient can have multiple treatments, but each treatment is for one specific patient.

### Example 3: Hospitalization Relator (Many-to-Many via Relator)

Here's how your `Hospitalization` relator should define its mediation relations:

```tonto
relator Hospitalization {
    label {
        @en "Hospitalization"
        @pt-br "Hospitalização"
    }
    startDate: date [1]
    endDate: date [0..1]
    
    @mediation [1..*] -- [1] Patient
    @mediation [1..*] -- [1] Hospital
}
```

**Reading:**
- **First mediation (Patient)**:
  - Left `[1..*]`: A `Patient` can have **one or more** `Hospitalization`s (multiple hospital stays over time)
  - Right `[1]`: Each `Hospitalization` involves exactly **one** `Patient`

- **Second mediation (Hospital)**:
  - Left `[1..*]`: A `Hospital` can have **one or more** `Hospitalization`s (many patients)
  - Right `[1]`: Each `Hospitalization` occurs at exactly **one** `Hospital`

### Example 4: Company and Employee (From Your Main Package)

```tonto
kind Company {
    name: string
    [1] -- employs -- [0..*] Employee
}

role Employee specializes Person {
    salary: number
}
```

**Reading:**
- **Left `[1]`**: Each `Employee` works for exactly **one** `Company`
- **Right `[0..*]`**: A `Company` can employ **zero or more** `Employee`s

### Example 5: Manager Supervises Employees (Hierarchical)

```tonto
role Manager specializes Employee {
    [0..1] -- supervises -- [0..*] Employee
}
```

**Reading:**
- **Left `[0..1]`**: Each `Employee` can have **zero or one** `Manager` (optional supervision)
- **Right `[0..*]`**: A `Manager` can supervise **zero or more** `Employee`s

## Common Cardinality Patterns

| Pattern | Left | Right | Meaning | Example |
|---------|------|-------|---------|---------|
| **One-to-One (mandatory)** | `[1]` | `[1]` | Both sides must exist and are unique | Person ↔ SocialSecurityNumber |
| **One-to-One (optional)** | `[1]` | `[0..1]` | One side can be absent | Person ↔ DriverLicense |
| **One-to-Many** | `[1]` | `[0..*]` | One parent, many children | Person → Person |
| **Many-to-Many** | `[0..*]` | `[0..*]` | Both sides can have multiple, but optionally | Students ↔ Courses |
| **Mandatory participation** | `[1..*]` | `[1..*]` | At least one on both sides, possibly many | Author ↔ Book |

## Part-Whole Relations

For **composition** (`<o>--`) and **aggregation** (`<>--`), cardinalities work the same way:

```tonto
kind Hospital {
    @componentOf [1] <o>-- hasDepartments -- [1..*] Department
}
```

**Reading:**
- Each `Department` belongs to exactly **one** `Hospital` (left `[1]`)
- Each `Hospital` must have **one or more** `Department`s (right `[1..*]`)

## Tips for Choosing Cardinalities

1. **Start with the real-world constraints**: How does your domain actually work?
2. **Consider edge cases**: Can something exist without the relationship?
3. **Use `[0..1]` for optional relationships**: When the relationship may or may not exist
4. **Use `[1]` for mandatory relationships**: When the relationship must exist
5. **Use `[*]` or `[0..*]` for collections**: When there can be any number
6. **Use `[1..*]` when at least one is required**: When the collection cannot be empty


